import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Repeat, LayoutList } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RepeatedPhrases from './RepeatedPhrases';
import StructureAnalysis from './StructureAnalysis';
import KeywordAnalysis from './KeywordAnalysis';

interface AnalysisTabsProps {
  content: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export default function AnalysisTabs({ 
  content, 
  primaryKeyword, 
  secondaryKeywords 
}: AnalysisTabsProps) {
  return (
    <Tabs defaultValue="structure" className="w-full h-full flex flex-col" dir="rtl">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="structure" className="gap-2" data-testid="tab-structure">
          <LayoutList className="w-4 h-4" />
          <span>الهيكل والمحتوى</span>
        </TabsTrigger>
        <TabsTrigger value="keywords" className="gap-2" data-testid="tab-keywords">
          <FileText className="w-4 h-4" />
          <span>الكلمات المفتاحية</span>
        </TabsTrigger>
        <TabsTrigger value="repeated" className="gap-2" data-testid="tab-repeated">
          <Repeat className="w-4 h-4" />
          <span>الجمل المكررة</span>
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="structure" className="h-full overflow-y-auto mt-0">
          <StructureAnalysis content={content} />
        </TabsContent>

        <TabsContent value="keywords" className="h-full overflow-y-auto mt-0">
          <KeywordAnalysis 
            content={content}
            primaryKeyword={primaryKeyword}
            secondaryKeywords={secondaryKeywords}
          />
        </TabsContent>

        <TabsContent value="repeated" className="h-full overflow-y-auto mt-0">
          <RepeatedPhrases content={content} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
