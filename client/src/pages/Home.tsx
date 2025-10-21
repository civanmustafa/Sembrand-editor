import { useState, useEffect, useCallback, useRef } from 'react';
import ContentEditor from '@/components/ContentEditor';
import RepeatedPhrases, { PHRASE_COLORS } from '@/components/RepeatedPhrases';
import StructureAnalysis from '@/components/StructureAnalysis';
import ThemeToggle from '@/components/ThemeToggle';
import SearchReplace from '@/components/SearchReplace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightConfig } from '@/components/TiptapEditor';
import { normalizeArabicText } from '@/lib/arabicUtils';
import { FileText, Repeat } from 'lucide-react';

export default function Home() {
  const [content, setContent] = useState('');
  const [highlightedPhrases, setHighlightedPhrases] = useState<Set<string>>(new Set());
  const [highlightedViolation, setHighlightedViolation] = useState<string | null>(null);
  const [highlightedCriteria, setHighlightedCriteria] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<HighlightConfig[]>([]);
  const [editor, setEditor] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrollToText, setScrollToText] = useState<string | null>(null);
  
  // Ref to prevent phrase cleanup effect from running when we just applied highlights
  const isApplyingHighlights = useRef(false);

  const handleClearHighlights = useCallback(() => {
    setHighlights([]);
    setHighlightedPhrases(new Set());
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
    setScrollToText(null);
  }, []);

  const getColorForPhrase = useCallback((phrase: string): string => {
    let hash = 0;
    for (let i = 0; i < phrase.length; i++) {
      hash = phrase.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PHRASE_COLORS.length;
    return PHRASE_COLORS[index].highlight;
  }, []);

  const handlePhraseClick = useCallback((phrase: string | null) => {
    if (!phrase) {
      setHighlightedPhrases(new Set());
      setHighlights([]);
      setScrollToText(null);
      return;
    }

    // Set flag to prevent phrase cleanup effect from running
    isApplyingHighlights.current = true;

    const newPhrases = new Set(highlightedPhrases);
    const wasHighlighted = newPhrases.has(phrase);
    
    if (wasHighlighted) {
      newPhrases.delete(phrase);
    } else {
      newPhrases.add(phrase);
    }
    
    setHighlightedPhrases(newPhrases);
    
    const phraseHighlights: HighlightConfig[] = Array.from(newPhrases).map(p => ({
      text: p,
      color: getColorForPhrase(p),
      type: 'phrase' as const
    }));
    
    setHighlights(phraseHighlights);
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
    
    // Don't scroll when highlighting phrases - keep tab stable
    // Reset flag after a short delay to allow highlights to be applied
    setTimeout(() => {
      isApplyingHighlights.current = false;
    }, 300);
  }, [content, editor, highlightedPhrases, getColorForPhrase]);

  const handleViolationClick = useCallback((violations: string[] | null, criteriaTitle: string, shouldScroll: boolean = true, moveCursorOnly: boolean = false) => {
    // Toggle: if clicking on the same criteria that's already highlighted, clear it
    if (highlightedCriteria === criteriaTitle) {
      setHighlights([]);
      setHighlightedViolation(null);
      setHighlightedCriteria(null);
      setScrollToText(null);
      return;
    }
    
    if (violations && violations.length > 0) {
      // Set flag to prevent phrase cleanup effect from running
      isApplyingHighlights.current = true;
      
      // Create highlights for all violations
      const violationHighlights: HighlightConfig[] = violations.map(v => ({
        text: v,
        color: 'red',
        type: 'violation' as const
      }));
      
      // Set highlights FIRST before clearing other states to prevent batching issues
      setHighlights(violationHighlights);
      setHighlightedViolation(violations[0]); // Keep first for backwards compatibility
      setHighlightedCriteria(criteriaTitle);
      setHighlightedPhrases(new Set());
      
      // Scroll to the first violation (move cursor without clicking or removing highlights)
      setScrollToText(violations[0]);
      
      // Reset scroll after a short delay to allow for re-triggering if needed
      setTimeout(() => {
        setScrollToText(null);
      }, 500);
      
      // Reset flag after a short delay
      setTimeout(() => {
        isApplyingHighlights.current = false;
      }, 300);
    } else {
      setHighlights([]);
      setHighlightedViolation(null);
      setHighlightedCriteria(null);
      setHighlightedPhrases(new Set());
      setScrollToText(null);
    }
  }, [content, editor, highlightedCriteria]);


  const handleHighlightAllPhrases = useCallback(() => {
    if (!content.trim()) return;

    const words = normalizeArabicText(content)
      .replace(/[^\u0600-\u06FF\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(w => w.length > 0);

    const extractPhrases = (n: number): Array<{phrase: string, count: number}> => {
      const phrasesMap = new Map<string, number>();
      
      for (let i = 0; i <= words.length - n; i++) {
        const phrase = words.slice(i, i + n).join(' ');
        phrasesMap.set(phrase, (phrasesMap.get(phrase) || 0) + 1);
      }

      return Array.from(phrasesMap.entries())
        .filter(([_, count]) => count > 1)
        .map(([phrase, count]) => ({ phrase, count }));
    };

    const allPhrases = [
      ...extractPhrases(2),
      ...extractPhrases(3),
      ...extractPhrases(4),
      ...extractPhrases(5),
      ...extractPhrases(6),
      ...extractPhrases(7),
      ...extractPhrases(8),
    ];

    const phraseHighlights: HighlightConfig[] = allPhrases.map(p => ({
      text: p.phrase,
      color: getColorForPhrase(p.phrase),
      type: 'phrase' as const
    }));

    setHighlights(phraseHighlights);
    setHighlightedPhrases(new Set());
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
  }, [content, getColorForPhrase]);

  const handleReplace = useCallback((searchText: string, replaceText: string, replaceAll: boolean) => {
    const normalizedSearch = normalizeArabicText(searchText);
    const normalizedContent = normalizeArabicText(content);
    
    if (replaceAll) {
      let newContent = content;
      let searchIndex = 0;
      let offset = 0;
      
      while ((searchIndex = normalizedContent.indexOf(normalizedSearch, searchIndex)) !== -1) {
        const actualIndex = searchIndex + offset;
        newContent = newContent.substring(0, actualIndex) +
                     replaceText +
                     newContent.substring(actualIndex + searchText.length);
        offset += replaceText.length - searchText.length;
        searchIndex += normalizedSearch.length;
      }
      setContent(newContent);
    } else {
      const index = normalizedContent.indexOf(normalizedSearch);
      if (index !== -1) {
        setContent(
          content.substring(0, index) +
          replaceText +
          content.substring(index + searchText.length)
        );
      }
    }
  }, [content]);

  // Remove phrases from highlights when they are no longer repeated
  useEffect(() => {
    // Don't run this effect if we're currently applying highlights
    if (isApplyingHighlights.current) return;
    
    if (highlightedPhrases.size === 0) return;
    
    // Get current repeated phrases
    const normalizedWords = normalizeArabicText(content)
      .replace(/[^\u0600-\u06FF\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(w => w.length > 0);

    const extractPhrases = (n: number): Set<string> => {
      const phrasesMap = new Map<string, number>();
      
      for (let i = 0; i <= normalizedWords.length - n; i++) {
        const phrase = normalizedWords.slice(i, i + n).join(' ');
        phrasesMap.set(phrase, (phrasesMap.get(phrase) || 0) + 1);
      }

      const repeated = new Set<string>();
      phrasesMap.forEach((count, phrase) => {
        if (count > 1) {
          repeated.add(phrase);
        }
      });
      return repeated;
    };

    const allRepeatedPhrases = new Set([
      ...Array.from(extractPhrases(2)),
      ...Array.from(extractPhrases(3)),
      ...Array.from(extractPhrases(4)),
      ...Array.from(extractPhrases(5)),
      ...Array.from(extractPhrases(6)),
      ...Array.from(extractPhrases(7)),
      ...Array.from(extractPhrases(8)),
    ]);

    // Check if any highlighted phrase is no longer repeated
    const newHighlightedPhrases = new Set(highlightedPhrases);
    let changed = false;
    
    highlightedPhrases.forEach(phrase => {
      const normalized = normalizeArabicText(phrase)
        .replace(/[^\u0600-\u06FF\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!allRepeatedPhrases.has(normalized)) {
        newHighlightedPhrases.delete(phrase);
        changed = true;
      }
    });

    if (changed) {
      setHighlightedPhrases(newHighlightedPhrases);
      
      const phraseHighlights: HighlightConfig[] = Array.from(newHighlightedPhrases).map(p => ({
        text: p,
        color: getColorForPhrase(p),
        type: 'phrase' as const
      }));
      
      setHighlights(phraseHighlights);
    }
  }, [content, highlightedPhrases, getColorForPhrase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <SearchReplace
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        content={content}
        onReplace={handleReplace}
      />
      
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="fixed top-4 left-4 z-50">
          <ThemeToggle />
        </div>
      <main className="w-full px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-40px)]">
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            <ContentEditor
              content={content}
              onChange={setContent}
              highlightedKeyword={highlightedViolation}
              highlights={highlights}
              onEditorReady={setEditor}
              scrollToText={scrollToText}
              onClearHighlights={handleClearHighlights}
            />
          </div>

          <div className="w-full lg:w-[30%] lg:flex-shrink-0 overflow-auto">
            <Tabs defaultValue="structure" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="structure" data-testid="tab-structure" className="gap-1.5" title="الهيكل والمحتوى">
                  <FileText className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="phrases" data-testid="tab-phrases" className="gap-1.5" title="الجمل المكررة">
                  <Repeat className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="structure" className="mt-4">
                <StructureAnalysis 
                  content={content} 
                  onViolationClick={handleViolationClick}
                  highlightedCriteria={highlightedCriteria}
                />
              </TabsContent>
              
              <TabsContent value="phrases" className="mt-4">
                <RepeatedPhrases
                  content={content}
                  onPhraseClick={handlePhraseClick}
                  highlightedPhrases={highlightedPhrases}
                  onHighlightAll={handleHighlightAllPhrases}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
