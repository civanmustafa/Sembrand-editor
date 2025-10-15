import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Highlighter, ChevronDown, ChevronUp, FileText, Repeat, Hash, ListOrdered } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RepeatedPhrasesProps {
  content: string;
  onPhraseClick: (phrase: string | null) => void;
  highlightedPhrase: string | null;
  onHighlightAll?: () => void;
}

interface PhraseData {
  phrase: string;
  count: number;
  selected: boolean;
  color: string;
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

export const PHRASE_COLORS = [
  { bg: 'bg-purple-500/20', border: 'border-purple-500/40', highlight: '#a855f7' },
  { bg: 'bg-blue-500/20', border: 'border-blue-500/40', highlight: '#3b82f6' },
  { bg: 'bg-green-500/20', border: 'border-green-500/40', highlight: '#22c55e' },
  { bg: 'bg-yellow-500/20', border: 'border-yellow-500/40', highlight: '#eab308' },
  { bg: 'bg-orange-500/20', border: 'border-orange-500/40', highlight: '#f97316' },
  { bg: 'bg-red-500/20', border: 'border-red-500/40', highlight: '#ef4444' },
  { bg: 'bg-pink-500/20', border: 'border-pink-500/40', highlight: '#ec4899' },
  { bg: 'bg-indigo-500/20', border: 'border-indigo-500/40', highlight: '#6366f1' },
  { bg: 'bg-teal-500/20', border: 'border-teal-500/40', highlight: '#14b8a6' },
  { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', highlight: '#06b6d4' },
];

export default function RepeatedPhrases({
  content,
  onPhraseClick,
  highlightedPhrase,
  onHighlightAll,
}: RepeatedPhrasesProps) {
  const [selectedPhrases, setSelectedPhrases] = useState<Set<string>>(new Set());
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set([
    'eight', 'seven', 'six', 'five', 'four', 'three', 'two'
  ]));

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
    
    const getColorForPhrase = (phrase: string): string => {
      let hash = 0;
      for (let i = 0; i < phrase.length; i++) {
        hash = phrase.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash) % PHRASE_COLORS.length;
      const color = PHRASE_COLORS[index];
      return `${color.bg} ${color.border}`;
    };

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
          color: getColorForPhrase(phrase),
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

  const toggleSection = (section: string) => {
    setOpenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const PhraseGroup = ({
    title,
    phrases,
    testId,
    sectionId,
  }: {
    title: string;
    phrases: PhraseData[];
    testId: string;
    sectionId: string;
  }) => {
    if (phrases.length === 0) return null;

    const isOpen = openSections.has(sectionId);

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleSection(sectionId)}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                  <Badge variant="outline">{phrases.length}</Badge>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-2 pt-0">
              {phrases.map((phraseData, idx) => {
                const isHighlighted = highlightedPhrase === phraseData.phrase;
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between gap-2 p-2 rounded-md border cursor-pointer transition-all ${
                      isHighlighted 
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                        : phraseData.color
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
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" data-testid={`badge-count-${testId}-${idx}`}>
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
                    <span className="text-sm flex-1 text-right">{phraseData.phrase}</span>
                  </div>
                );
              })}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">لوحة المعلومات</CardTitle>
            {onHighlightAll && (
              <Button
                size="sm"
                variant="outline"
                onClick={onHighlightAll}
                className="h-8 gap-2"
                data-testid="button-highlight-all-phrases"
              >
                <Highlighter className="w-3.5 h-3.5" />
                تمييز الكل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">الجمل المكررة</p>
            </div>
            <p className="text-2xl font-bold" data-testid="stat-repeated-phrases">
              {analysis.stats.repeatedPhrasesCount}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">إجمالي التكرار</p>
            </div>
            <p className="text-2xl font-bold" data-testid="stat-total-repetitions">
              {analysis.stats.totalRepetitions}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">الكلمات الفريدة</p>
            </div>
            <p className="text-2xl font-bold" data-testid="stat-unique-words">
              {analysis.stats.uniqueWords}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">إجمالي الكلمات</p>
            </div>
            <p className="text-2xl font-bold" data-testid="stat-total-words">
              {analysis.stats.totalWords}
            </p>
          </div>
        </CardContent>
      </Card>

      <PhraseGroup
        title="الجمل الثمانية"
        phrases={analysis.eightWord}
        testId="eight-word"
        sectionId="eight"
      />
      <PhraseGroup
        title="الجمل السباعية"
        phrases={analysis.sevenWord}
        testId="seven-word"
        sectionId="seven"
      />
      <PhraseGroup
        title="الجمل السداسية"
        phrases={analysis.sixWord}
        testId="six-word"
        sectionId="six"
      />
      <PhraseGroup
        title="الجمل الخماسية"
        phrases={analysis.fiveWord}
        testId="five-word"
        sectionId="five"
      />
      <PhraseGroup
        title="الجمل الرباعية"
        phrases={analysis.fourWord}
        testId="four-word"
        sectionId="four"
      />
      <PhraseGroup
        title="الجمل الثلاثية"
        phrases={analysis.threeWord}
        testId="three-word"
        sectionId="three"
      />
      <PhraseGroup
        title="الجمل الثنائية"
        phrases={analysis.twoWord}
        testId="two-word"
        sectionId="two"
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
