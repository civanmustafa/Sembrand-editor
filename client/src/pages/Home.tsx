import { useState, useEffect, useCallback } from 'react';
import ContentEditor from '@/components/ContentEditor';
import KeywordInput from '@/components/KeywordInput';
import KeywordAnalysis from '@/components/KeywordAnalysis';
import RepeatedPhrases from '@/components/RepeatedPhrases';
import StructureAnalysis from '@/components/StructureAnalysis';
import ThemeToggle from '@/components/ThemeToggle';
import SearchReplace from '@/components/SearchReplace';
import { FileSearch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HighlightConfig } from '@/components/SlateEditor';
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
  const [highlightedPhrase, setHighlightedPhrase] = useState<string | null>(null);
  const [highlights, setHighlights] = useState<HighlightConfig[]>([]);
  const [editor, setEditor] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isKeywordsHighlighted, setIsKeywordsHighlighted] = useState(false);

  const handleKeywordClick = (keyword: string) => {
    setHighlightedPhrase(null);
    if (highlightedKeyword === keyword) {
      setHighlightedKeyword(null);
    } else {
      setHighlightedKeyword(keyword);
    }
  };

  const handlePhraseClick = (phrase: string | null) => {
    setHighlightedKeyword(null);
    setHighlightedPhrase(phrase);
  };

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
  }, []);

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
              highlightedKeyword={highlightedKeyword || highlightedPhrase}
              highlights={highlights}
              onEditorReady={setEditor}
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
                <StructureAnalysis content={content} />
              </TabsContent>
              
              <TabsContent value="phrases" className="mt-4">
                <RepeatedPhrases
                  content={content}
                  onPhraseClick={handlePhraseClick}
                  highlightedPhrase={highlightedPhrase}
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
