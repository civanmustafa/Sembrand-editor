import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Square } from 'lucide-react';

interface RepeatedPhrasesProps {
  content: string;
  onPhraseClick: (phrase: string | null) => void;
  highlightedPhrase: string | null;
}

interface PhraseData {
  phrase: string;
  count: number;
  selected: boolean;
}

interface PhrasesAnalysis {
  twoWord: PhraseData[];
  threeWord: PhraseData[];
  fourWord: PhraseData[];
  fiveWord: PhraseData[];
  sixWord: PhraseData[];
  sevenWord: PhraseData[];
  eightWord: PhraseData[];
  stats: {
    totalWords: number;
    uniqueWords: number;
    repeatedPhrasesCount: number;
    totalRepetitions: number;
  };
}

export default function RepeatedPhrases({
  content,
  onPhraseClick,
  highlightedPhrase,
}: RepeatedPhrasesProps) {
  const [selectedPhrases, setSelectedPhrases] = useState<Set<string>>(new Set());

  const analysis: PhrasesAnalysis = useMemo(() => {
    if (!content.trim()) {
      return {
        twoWord: [],
        threeWord: [],
        fourWord: [],
        fiveWord: [],
        sixWord: [],
        sevenWord: [],
        eightWord: [],
        stats: {
          totalWords: 0,
          uniqueWords: 0,
          repeatedPhrasesCount: 0,
          totalRepetitions: 0,
        },
      };
    }

    const words = content
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);

    const uniqueWordsSet = new Set(words);
    
    const extractPhrases = (n: number): PhraseData[] => {
      const phrasesMap = new Map<string, number>();
      
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        phrasesMap.set(phrase, (phrasesMap.get(phrase) || 0) + 1);
      }

      return Array.from(phrasesMap.entries())
        .filter(([_, count]) => count > 1)
        .map(([phrase, count]) => ({
          phrase,
          count,
          selected: selectedPhrases.has(phrase),
        }))
        .sort((a, b) => b.count - a.count);
    };

    const twoWord = extractPhrases(2);
    const threeWord = extractPhrases(3);
    const fourWord = extractPhrases(4);
    const fiveWord = extractPhrases(5);
    const sixWord = extractPhrases(6);
    const sevenWord = extractPhrases(7);
    const eightWord = extractPhrases(8);

    const allPhrases = [
      ...twoWord,
      ...threeWord,
      ...fourWord,
      ...fiveWord,
      ...sixWord,
      ...sevenWord,
      ...eightWord,
    ];

    const totalRepetitions = allPhrases.reduce(
      (sum, p) => sum + (p.count - 1),
      0
    );

    return {
      twoWord,
      threeWord,
      fourWord,
      fiveWord,
      sixWord,
      sevenWord,
      eightWord,
      stats: {
        totalWords: words.length,
        uniqueWords: uniqueWordsSet.size,
        repeatedPhrasesCount: allPhrases.length,
        totalRepetitions,
      },
    };
  }, [content, selectedPhrases]);

  const togglePhrase = (phrase: string) => {
    const newSelected = new Set(selectedPhrases);
    if (newSelected.has(phrase)) {
      newSelected.delete(phrase);
      if (highlightedPhrase === phrase) {
        onPhraseClick(null);
      }
    } else {
      newSelected.add(phrase);
    }
    setSelectedPhrases(newSelected);
  };

  const selectAllInGroup = (phrases: PhraseData[]) => {
    const newSelected = new Set(selectedPhrases);
    phrases.forEach(p => newSelected.add(p.phrase));
    setSelectedPhrases(newSelected);
  };

  const clearSelectionInGroup = (phrases: PhraseData[]) => {
    const newSelected = new Set(selectedPhrases);
    phrases.forEach(p => {
      newSelected.delete(p.phrase);
      if (highlightedPhrase === p.phrase) {
        onPhraseClick(null);
      }
    });
    setSelectedPhrases(newSelected);
  };

  const PhraseGroup = ({
    title,
    phrases,
    testId,
  }: {
    title: string;
    phrases: PhraseData[];
    testId: string;
  }) => {
    if (phrases.length === 0) return null;

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => selectAllInGroup(phrases)}
                data-testid={`button-select-all-${testId}`}
              >
                تحديد الكل
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => clearSelectionInGroup(phrases)}
                data-testid={`button-clear-${testId}`}
              >
                مسح التحديد
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {phrases.map((phraseData, idx) => {
            const isSelected = selectedPhrases.has(phraseData.phrase);
            const isHighlighted = highlightedPhrase === phraseData.phrase;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between gap-2 p-2 rounded-md border cursor-pointer ${
                  isHighlighted ? 'border-primary bg-primary/10' : 'border-border'
                }`}
                data-testid={`phrase-${testId}-${idx}`}
                onClick={() =>
                  onPhraseClick(
                    highlightedPhrase === phraseData.phrase
                      ? null
                      : phraseData.phrase
                  )
                }
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePhrase(phraseData.phrase);
                  }}
                  className="flex items-center gap-2 flex-1 text-right"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="text-sm truncate">{phraseData.phrase}</span>
                </button>
                <Badge variant="secondary" className="shrink-0">
                  {phraseData.count}×
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">لوحة المعلومات</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">عدد الكلمات</p>
            <p className="text-2xl font-bold" data-testid="stat-total-words">
              {analysis.stats.totalWords}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">الكلمات الفريدة</p>
            <p className="text-2xl font-bold" data-testid="stat-unique-words">
              {analysis.stats.uniqueWords}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">الجمل المكررة</p>
            <p className="text-2xl font-bold" data-testid="stat-repeated-phrases">
              {analysis.stats.repeatedPhrasesCount}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">إجمالي التكرار</p>
            <p className="text-2xl font-bold" data-testid="stat-total-repetitions">
              {analysis.stats.totalRepetitions}
            </p>
          </div>
        </CardContent>
      </Card>

      <PhraseGroup
        title="الجمل الثنائية"
        phrases={analysis.twoWord}
        testId="two-word"
      />
      <PhraseGroup
        title="الجمل الثلاثية"
        phrases={analysis.threeWord}
        testId="three-word"
      />
      <PhraseGroup
        title="الجمل الرباعية"
        phrases={analysis.fourWord}
        testId="four-word"
      />
      <PhraseGroup
        title="الجمل الخماسية"
        phrases={analysis.fiveWord}
        testId="five-word"
      />
      <PhraseGroup
        title="الجمل السداسية"
        phrases={analysis.sixWord}
        testId="six-word"
      />
      <PhraseGroup
        title="الجمل السباعية"
        phrases={analysis.sevenWord}
        testId="seven-word"
      />
      <PhraseGroup
        title="الجمل الثمانية"
        phrases={analysis.eightWord}
        testId="eight-word"
      />

      {analysis.stats.repeatedPhrasesCount === 0 && content.trim() && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد جمل مكررة في النص
          </CardContent>
        </Card>
      )}
    </div>
  );
}
