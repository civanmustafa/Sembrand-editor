import { useState, useEffect, useCallback, useRef } from 'react';
import ContentEditor from '@/components/ContentEditor';
import KeywordInput from '@/components/KeywordInput';
import KeywordAnalysis from '@/components/KeywordAnalysis';
import RepeatedPhrases, { PHRASE_COLORS } from '@/components/RepeatedPhrases';
import StructureAnalysis from '@/components/StructureAnalysis';
import ThemeToggle from '@/components/ThemeToggle';
import SearchReplace from '@/components/SearchReplace';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightConfig } from '@/components/QuillEditor';
import { normalizeArabicText } from '@/lib/arabicUtils';
import { FileText, Repeat } from 'lucide-react';

export default function Home() {
  const [content, setContent] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [subKeyword1, setSubKeyword1] = useState('');
  const [subKeyword2, setSubKeyword2] = useState('');
  const [subKeyword3, setSubKeyword3] = useState('');
  const [subKeyword4, setSubKeyword4] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);
  const [highlightedPhrases, setHighlightedPhrases] = useState<Set<string>>(new Set());
  const [highlightedViolation, setHighlightedViolation] = useState<string | null>(null);
  const [highlightedCriteria, setHighlightedCriteria] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<HighlightConfig[]>([]);
  const [editor, setEditor] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isKeywordsHighlighted, setIsKeywordsHighlighted] = useState(false);
  
  // Ref to prevent phrase cleanup effect from running when we just applied highlights
  const isApplyingHighlights = useRef(false);

  const handleKeywordClick = (keyword: string, moveCursorOnly: boolean = false) => {
    // Set flag to prevent phrase cleanup effect from running
    isApplyingHighlights.current = true;
    
    // Clear other highlight types but keep keywords highlighted state
    setHighlightedPhrases(new Set());
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
    
    // Toggle individual keyword highlight
    if (highlightedKeyword === keyword) {
      setHighlightedKeyword(null);
      setHighlights([]);
    } else {
      setHighlightedKeyword(keyword);
      setHighlights([{
        text: keyword,
        color: 'blue',
        type: 'keyword' as const
      }]);
      
      // Reset flag after a short delay
      setTimeout(() => {
        isApplyingHighlights.current = false;
      }, 300);
      
      // تحريك المؤشر والسكرول إلى أول ظهور للكلمة
      if (editor && keyword) {
        setTimeout(() => {
          const normalizedContent = content.toLowerCase();
          const normalizedKeyword = keyword.toLowerCase();
          const index = normalizedContent.indexOf(normalizedKeyword);
          
          if (index !== -1) {
            // Set cursor position
            editor.setSelection(index, 0);
            
            // Scroll to position only if not moveCursorOnly
            if (!moveCursorOnly && editor.scroll) {
              const totalLength = content.length;
              const scrollPercentage = index / totalLength;
              const editorHeight = editor.scroll.domNode.scrollHeight;
              const scrollPosition = scrollPercentage * editorHeight;
              editor.scroll.domNode.scrollTop = scrollPosition;
            }
          }
        }, 100);
      }
    }
  };

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
      return;
    }

    // Set flag to prevent phrase cleanup effect from running
    isApplyingHighlights.current = true;

    const newPhrases = new Set(highlightedPhrases);
    if (newPhrases.has(phrase)) {
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
    setHighlightedKeyword(null);
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
    
    // Reset flag after a short delay to allow highlights to be applied
    setTimeout(() => {
      isApplyingHighlights.current = false;
    }, 300);
    
    if (phrase && editor && newPhrases.has(phrase)) {
      setTimeout(() => {
        const normalizedContent = content.toLowerCase();
        const normalizedPhrase = phrase.toLowerCase();
        const index = normalizedContent.indexOf(normalizedPhrase);
        
        if (index !== -1) {
          // نقل المؤشر إلى بداية أول جملة
          editor.setSelection(index, 0);
        }
      }, 100);
    }
  }, [content, editor, highlightedPhrases, getColorForPhrase]);

  const handleViolationClick = useCallback((violations: string[] | null, criteriaTitle: string, shouldScroll: boolean = true, moveCursorOnly: boolean = false) => {
    // Toggle: if clicking on the same criteria that's already highlighted, clear it
    if (highlightedCriteria === criteriaTitle) {
      setHighlights([]);
      setHighlightedViolation(null);
      setHighlightedCriteria(null);
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
      setHighlightedKeyword(null);
      setHighlightedPhrases(new Set());
      
      // Reset flag after a short delay
      setTimeout(() => {
        isApplyingHighlights.current = false;
      }, 300);
      
      if (editor) {
        setTimeout(() => {
          // Remove markdown symbols for search
          const searchText = violations[0].replace(/^#+\s+/, '').trim();
          const normalizedContent = content.toLowerCase();
          const normalizedViolation = searchText.toLowerCase();
          const index = normalizedContent.indexOf(normalizedViolation);
          
          if (index !== -1) {
            // Set cursor position
            editor.setSelection(index, 0);
            
            // Only scroll if shouldScroll is true and not moveCursorOnly
            if (shouldScroll && !moveCursorOnly && editor.scroll) {
              const totalLength = content.length;
              const scrollPercentage = index / totalLength;
              const editorHeight = editor.scroll.domNode.scrollHeight;
              const scrollPosition = scrollPercentage * editorHeight;
              editor.scroll.domNode.scrollTop = scrollPosition;
            }
          }
        }, 100);
      }
    } else {
      setHighlights([]);
      setHighlightedViolation(null);
      setHighlightedCriteria(null);
      setHighlightedKeyword(null);
      setHighlightedPhrases(new Set());
    }
  }, [content, editor, highlightedCriteria]);

  const handleHighlightAllKeywords = useCallback(() => {
    // Set flag to prevent phrase cleanup effect from running
    isApplyingHighlights.current = true;
    
    const newHighlights: HighlightConfig[] = [];
    
    if (primaryKeyword) {
      newHighlights.push({
        text: primaryKeyword,
        color: 'green',
        type: 'primary'
      });
    }
    
    [subKeyword1, subKeyword2, subKeyword3, subKeyword4].forEach(keyword => {
      if (keyword) {
        newHighlights.push({
          text: keyword,
          color: 'orange',
          type: 'secondary'
        });
      }
    });
    
    if (companyName) {
      newHighlights.push({
        text: companyName,
        color: 'red',
        type: 'company'
      });
    }
    
    setHighlights(newHighlights);
    setIsKeywordsHighlighted(true);
    setHighlightedKeyword(null);
    setHighlightedPhrases(new Set());
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
    
    // Reset flag after a short delay
    setTimeout(() => {
      isApplyingHighlights.current = false;
    }, 300);
  }, [primaryKeyword, subKeyword1, subKeyword2, subKeyword3, subKeyword4, companyName]);

  const handleClearAllHighlights = useCallback(() => {
    setHighlights([]);
    setIsKeywordsHighlighted(false);
    setHighlightedKeyword(null);
    setHighlightedPhrases(new Set());
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
  }, []);

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
    setHighlightedKeyword(null);
    setHighlightedPhrases(new Set());
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
  }, [content, getColorForPhrase]);

  const handleToggleKeywordsHighlight = useCallback(() => {
    if (isKeywordsHighlighted) {
      handleClearAllHighlights();
    } else {
      handleHighlightAllKeywords();
    }
  }, [isKeywordsHighlighted, handleHighlightAllKeywords, handleClearAllHighlights]);

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
      } else if (e.altKey && e.key === 'j') {
        e.preventDefault();
        handleHighlightAllKeywords();
      } else if (e.altKey && e.key === 'l') {
        e.preventDefault();
        handleClearAllHighlights();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHighlightAllKeywords, handleClearAllHighlights]);

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
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-40px)]">
          <div className="lg:col-span-3 overflow-auto">
            <div className="space-y-4">
              <KeywordInput
                primaryKeyword={primaryKeyword}
                subKeyword1={subKeyword1}
                subKeyword2={subKeyword2}
                subKeyword3={subKeyword3}
                subKeyword4={subKeyword4}
                companyName={companyName}
                onPrimaryChange={setPrimaryKeyword}
                onSubKeyword1Change={setSubKeyword1}
                onSubKeyword2Change={setSubKeyword2}
                onSubKeyword3Change={setSubKeyword3}
                onSubKeyword4Change={setSubKeyword4}
                onCompanyNameChange={setCompanyName}
                onHighlightAll={handleToggleKeywordsHighlight}
                isHighlighted={isKeywordsHighlighted}
              />
              
              <KeywordAnalysis
                content={content}
                primaryKeyword={primaryKeyword}
                subKeyword1={subKeyword1}
                subKeyword2={subKeyword2}
                subKeyword3={subKeyword3}
                subKeyword4={subKeyword4}
                companyName={companyName}
                onKeywordClick={handleKeywordClick}
                highlightedKeyword={highlightedKeyword}
                onHighlightAllKeywords={handleHighlightAllKeywords}
                onClearAllHighlights={handleClearAllHighlights}
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col min-h-0">
            <ContentEditor
              content={content}
              onChange={setContent}
              highlightedKeyword={highlightedKeyword || highlightedViolation}
              highlights={highlights}
              onEditorReady={setEditor}
              onClearHighlights={handleClearAllHighlights}
            />
          </div>

          <div className="lg:col-span-3 overflow-auto">
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
