import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Highlighter } from 'lucide-react';

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
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

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

  const handleCopy = async (phrase: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(phrase);
    setCopiedPhrase(phrase);
    setTimeout(() => setCopiedPhrase(null), 2000);
  };

  const getColorForPhrase = (phrase: string): string => {
    const colors = [
      'bg-purple-500/20 border-purple-500/40',
      'bg-blue-500/20 border-blue-500/40',
      'bg-green-500/20 border-green-500/40',
      'bg-yellow-500/20 border-yellow-500/40',
      'bg-orange-500/20 border-orange-500/40',
      'bg-red-500/20 border-red-500/40',
      'bg-pink-500/20 border-pink-500/40',
      'bg-indigo-500/20 border-indigo-500/40',
      'bg-teal-500/20 border-teal-500/40',
      'bg-cyan-500/20 border-cyan-500/40',
    ];
    
    let hash = 0;
    for (let i = 0; i < phrase.length; i++) {
      hash = phrase.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleHighlightGroup = (phrases: PhraseData[]) => {
    if (phrases.length === 0) return;
    
    const firstPhrase = phrases[0].phrase;
    if (highlightedPhrase === firstPhrase) {
      onPhraseClick(null);
    } else {
      onPhraseClick(firstPhrase);
    }
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleHighlightGroup(phrases)}
              className="h-7 px-2"
            >
              <Highlighter className="w-3 h-3 ml-1" />
              تمييز الكل
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {phrases.map((phraseData, idx) => {
            const isHighlighted = highlightedPhrase === phraseData.phrase;

            const phraseColor = getColorForPhrase(phraseData.phrase);
            
            return (
              <div
                key={idx}
                className={`flex items-center justify-between gap-2 p-2 rounded-md border cursor-pointer transition-all ${
                  isHighlighted 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                    : `${phraseColor}`
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
                <span className="text-sm flex-1 text-right">{phraseData.phrase}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary">
                    {phraseData.count}×
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={(e) => handleCopy(phraseData.phrase, e)}
                    data-testid={`button-copy-phrase-${testId}-${idx}`}
                  >
                    {copiedPhrase === phraseData.phrase ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
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
        title="الجمل الثمانية"
        phrases={analysis.eightWord}
        testId="eight-word"
      />
      <PhraseGroup
        title="الجمل السباعية"
        phrases={analysis.sevenWord}
        testId="seven-word"
      />
      <PhraseGroup
        title="الجمل السداسية"
        phrases={analysis.sixWord}
        testId="six-word"
      />
      <PhraseGroup
        title="الجمل الخماسية"
        phrases={analysis.fiveWord}
        testId="five-word"
      />
      <PhraseGroup
        title="الجمل الرباعية"
        phrases={analysis.fourWord}
        testId="four-word"
      />
      <PhraseGroup
        title="الجمل الثلاثية"
        phrases={analysis.threeWord}
        testId="three-word"
      />
      <PhraseGroup
        title="الجمل الثنائية"
        phrases={analysis.twoWord}
        testId="two-word"
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
