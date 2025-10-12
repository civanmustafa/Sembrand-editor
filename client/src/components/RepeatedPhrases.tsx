import { useState, useMemo } from 'react';
import { CheckSquare, Square, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface RepeatedPhrasesProps {
  content: string;
}

interface PhraseCount {
  phrase: string;
  count: number;
}

export default function RepeatedPhrases({ content }: RepeatedPhrasesProps) {
  const [selectedPhrases, setSelectedPhrases] = useState<Set<string>>(new Set());

  // Extract n-grams (2 to 8 words)
  const phraseGroups = useMemo(() => {
    const text = content.toLowerCase().trim();
    if (!text) return {};

    const words = text.split(/\s+/).filter(w => w.length > 0);
    const groups: Record<number, PhraseCount[]> = {};

    for (let n = 2; n <= 8; n++) {
      const phraseCounts = new Map<string, number>();
      
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
      }

      // Filter only repeated phrases
      const repeated = Array.from(phraseCounts.entries())
        .filter(([_, count]) => count > 1)
        .map(([phrase, count]) => ({ phrase, count }))
        .sort((a, b) => b.count - a.count);

      if (repeated.length > 0) {
        groups[n] = repeated;
      }
    }

    return groups;
  }, [content]);

  const handleSelectAll = (groupSize: number) => {
    const newSelected = new Set(selectedPhrases);
    phraseGroups[groupSize]?.forEach(({ phrase }) => newSelected.add(phrase));
    setSelectedPhrases(newSelected);
  };

  const handleDeselectAll = (groupSize: number) => {
    const newSelected = new Set(selectedPhrases);
    phraseGroups[groupSize]?.forEach(({ phrase }) => newSelected.delete(phrase));
    setSelectedPhrases(newSelected);
  };

  const togglePhrase = (phrase: string) => {
    const newSelected = new Set(selectedPhrases);
    if (newSelected.has(phrase)) {
      newSelected.delete(phrase);
    } else {
      newSelected.add(phrase);
    }
    setSelectedPhrases(newSelected);
  };

  const groupLabels: Record<number, string> = {
    2: 'الجمل الثنائية',
    3: 'الجمل الثلاثية',
    4: 'الجمل الرباعية',
    5: 'الجمل الخماسية',
    6: 'الجمل السداسية',
    7: 'الجمل السباعية',
    8: 'الجمل الثمانية'
  };

  if (Object.keys(phraseGroups).length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        لا توجد جمل مكررة في المحتوى
      </div>
    );
  }

  return (
    <Accordion type="multiple" className="w-full space-y-2">
      {Object.entries(phraseGroups).map(([size, phrases]) => {
        const groupSize = parseInt(size);
        const allSelected = phrases.every(({ phrase }) => selectedPhrases.has(phrase));
        
        return (
          <AccordionItem
            key={size}
            value={size}
            className="border border-border rounded-lg bg-card"
            data-testid={`accordion-phrases-${size}`}
          >
            <AccordionTrigger className="px-4 hover:no-underline hover-elevate">
              <div className="flex items-center justify-between w-full gap-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-mono">
                    {phrases.length}
                  </Badge>
                  <span className="font-medium">{groupLabels[groupSize]}</span>
                </div>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="px-4 pb-4">
              <div className="flex gap-2 mb-3 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll(groupSize);
                  }}
                  disabled={allSelected}
                  data-testid={`button-select-all-${size}`}
                >
                  <CheckSquare className="w-4 h-4 ml-2" />
                  تحديد الكل
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeselectAll(groupSize);
                  }}
                  disabled={!phrases.some(({ phrase }) => selectedPhrases.has(phrase))}
                  data-testid={`button-deselect-all-${size}`}
                >
                  <Square className="w-4 h-4 ml-2" />
                  مسح التحديد
                </Button>
              </div>

              <div className="space-y-2">
                {phrases.map(({ phrase, count }, index) => {
                  const isSelected = selectedPhrases.has(phrase);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => togglePhrase(phrase)}
                      className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors hover-elevate
                        ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
                      data-testid={`phrase-item-${size}-${index}`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                          ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <span className="font-mono text-sm text-right flex-1">{phrase}</span>
                      </div>
                      <Badge variant="secondary" className="font-mono shrink-0">
                        {count}×
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
