import { useState } from 'react';
import ContentEditor from '@/components/ContentEditor';
import KeywordInput from '@/components/KeywordInput';
import AnalysisTabs from '@/components/AnalysisTabs';
import ThemeToggle from '@/components/ThemeToggle';
import { FileSearch } from 'lucide-react';

export default function Home() {
  const [content, setContent] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);

  const handleKeywordClick = (keyword: string, type: 'primary' | 'secondary') => {
    console.log(`Highlighting ${type} keyword: ${keyword}`);
    // In a real implementation, this would scroll to and highlight the keyword in the editor
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FileSearch className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">محلل المحتوى العربي</h1>
                <p className="text-sm text-muted-foreground">أداة SEO احترافية</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-140px)]">
          {/* Left Panel - Editor (60%) */}
          <div className="lg:col-span-3 space-y-4 flex flex-col">
            <KeywordInput
              primaryKeyword={primaryKeyword}
              secondaryKeywords={secondaryKeywords}
              onPrimaryChange={setPrimaryKeyword}
              onSecondaryChange={setSecondaryKeywords}
              onKeywordClick={handleKeywordClick}
            />
            
            <div className="flex-1 min-h-0">
              <ContentEditor
                content={content}
                onChange={setContent}
                primaryKeyword={primaryKeyword}
                secondaryKeywords={secondaryKeywords}
              />
            </div>
          </div>

          {/* Right Panel - Analysis (40%) */}
          <div className="lg:col-span-2 bg-card border border-card-border rounded-lg p-4 overflow-hidden">
            <AnalysisTabs
              content={content}
              primaryKeyword={primaryKeyword}
              secondaryKeywords={secondaryKeywords}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
