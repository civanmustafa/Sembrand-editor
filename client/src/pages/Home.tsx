import { useState, useEffect, useCallback } from 'react';
import ContentEditor from '@/components/ContentEditor';
import KeywordInput from '@/components/KeywordInput';
import KeywordAnalysis from '@/components/KeywordAnalysis';
import RepeatedPhrases, { PHRASE_COLORS } from '@/components/RepeatedPhrases';
import StructureAnalysis from '@/components/StructureAnalysis';
import ThemeToggle from '@/components/ThemeToggle';
import SearchReplace from '@/components/SearchReplace';
import { FileSearch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightConfig } from '@/components/QuillEditor';
import { normalizeArabicText } from '@/lib/arabicUtils';

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

  const handleKeywordClick = (keyword: string) => {
    setHighlightedPhrases(new Set());
    setHighlightedViolation(null);
    setHighlightedCriteria(null);
    if (highlightedKeyword === keyword) {
      setHighlightedKeyword(null);
    } else {
      setHighlightedKeyword(keyword);
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
    
    if (phrase && editor) {
      setTimeout(() => {
        const normalizedContent = content.toLowerCase();
        const normalizedPhrase = phrase.toLowerCase();
        const index = normalizedContent.indexOf(normalizedPhrase);
        
        if (index !== -1 && editor.scroll) {
          const totalLength = content.length;
          const scrollPercentage = index / totalLength;
          const editorHeight = editor.scroll.domNode.scrollHeight;
          const scrollPosition = scrollPercentage * editorHeight;
          editor.scroll.domNode.scrollTop = scrollPosition;
        }
      }, 100);
    }
  }, [content, editor, highlightedPhrases, getColorForPhrase]);

  const handleViolationClick = useCallback((violations: string[] | null, criteriaTitle: string) => {
    setHighlightedKeyword(null);
    setHighlightedPhrases(new Set());
    
    if (violations && violations.length > 0) {
      // Create highlights for all violations
      const violationHighlights: HighlightConfig[] = violations.map(v => ({
        text: v,
        color: 'red',
        type: 'violation' as const
      }));
      
      setHighlights(violationHighlights);
      setHighlightedViolation(violations[0]); // Keep first for backwards compatibility
      setHighlightedCriteria(criteriaTitle);
      
      if (editor) {
        setTimeout(() => {
          const normalizedContent = content.toLowerCase();
          const normalizedViolation = violations[0].toLowerCase();
          const index = normalizedContent.indexOf(normalizedViolation);
          
          if (index !== -1 && editor.scroll) {
            const totalLength = content.length;
            const scrollPercentage = index / totalLength;
            const editorHeight = editor.scroll.domNode.scrollHeight;
            const scrollPosition = scrollPercentage * editorHeight;
            editor.scroll.domNode.scrollTop = scrollPosition;
          }
        }, 100);
      }
    } else {
      setHighlights([]);
      setHighlightedViolation(null);
      setHighlightedCriteria(null);
    }
  }, [content, editor]);

  const handleHighlightAllKeywords = useCallback(() => {
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

    const words = content
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\s]/g, ' ')
      .split(/\s+/)
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
        <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">محلل المحتوى الاحترافي</h1>
                <p className="text-sm text-muted-foreground">أداة تحليل SEO متقدمة</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
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
                <TabsTrigger value="structure" data-testid="tab-structure">
                  الهيكل والمحتوى
                </TabsTrigger>
                <TabsTrigger value="phrases" data-testid="tab-phrases">
                  الجمل المكررة
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
