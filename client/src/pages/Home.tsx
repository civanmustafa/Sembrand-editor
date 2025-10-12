import { useState } from 'react';
import ContentEditor from '@/components/ContentEditor';
import KeywordInput from '@/components/KeywordInput';
import KeywordAnalysis from '@/components/KeywordAnalysis';
import RepeatedPhrases from '@/components/RepeatedPhrases';
import ThemeToggle from '@/components/ThemeToggle';
import { FileSearch } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [content, setContent] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [subKeyword1, setSubKeyword1] = useState('');
  const [subKeyword2, setSubKeyword2] = useState('');
  const [subKeyword3, setSubKeyword3] = useState('');
  const [subKeyword4, setSubKeyword4] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [highlightedKeyword, setHighlightedKeyword] = useState<string | null>(null);

  const handleKeywordClick = (keyword: string) => {
    if (highlightedKeyword === keyword) {
      setHighlightedKeyword(null);
    } else {
      setHighlightedKeyword(keyword);
    }
  };

  return (
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
              />
              
              <Tabs defaultValue="keywords" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="keywords" data-testid="tab-keywords">
                    تحليل الكلمات
                  </TabsTrigger>
                  <TabsTrigger value="phrases" data-testid="tab-phrases">
                    الجمل المكررة
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="keywords" className="mt-4">
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
                  />
                </TabsContent>
                
                <TabsContent value="phrases" className="mt-4">
                  <RepeatedPhrases
                    content={content}
                    onPhraseClick={setHighlightedKeyword}
                    highlightedPhrase={highlightedKeyword}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-9 flex flex-col min-h-0">
            <ContentEditor
              content={content}
              onChange={setContent}
              highlightedKeyword={highlightedKeyword}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
