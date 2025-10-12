import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, X } from 'lucide-react';
import { useState } from 'react';

interface KeywordAnalysisProps {
  content: string;
  primaryKeyword: string;
  subKeyword1: string;
  subKeyword2: string;
  subKeyword3: string;
  subKeyword4: string;
  companyName: string;
  onKeywordClick: (keyword: string) => void;
  highlightedKeyword: string | null;
}

interface AnalysisResult {
  count: number;
  percentage: number;
  requiredCount: { min: number; max: number };
  requiredPercentage: { min: number; max: number };
  inFirstParagraph?: boolean;
  inLastParagraph?: boolean;
  inFirstHeading?: boolean;
  inLastHeading?: boolean;
  inH2Headings?: string[];
  inRelatedParagraphs?: boolean;
}

export default function KeywordAnalysis({
  content,
  primaryKeyword,
  subKeyword1,
  subKeyword2,
  subKeyword3,
  subKeyword4,
  companyName,
  onKeywordClick,
  highlightedKeyword,
}: KeywordAnalysisProps) {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const analyzeKeyword = (
    keyword: string,
    minPercentage: number,
    maxPercentage: number,
    checkPrimary = false,
    checkSub = false
  ): AnalysisResult => {
    if (!keyword || !content) {
      return {
        count: 0,
        percentage: 0,
        requiredCount: { min: 0, max: 0 },
        requiredPercentage: { min: minPercentage, max: maxPercentage },
      };
    }

    const words = content.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    
    const regex = new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = lowerContent.match(regex);
    const count = matches ? matches.length : 0;
    
    const percentage = totalWords > 0 ? (count / totalWords) * 100 : 0;
    
    const minRequired = Math.ceil((totalWords * minPercentage) / 100);
    const maxRequired = Math.floor((totalWords * maxPercentage) / 100);

    const result: AnalysisResult = {
      count,
      percentage,
      requiredCount: { min: minRequired, max: maxRequired },
      requiredPercentage: { min: minPercentage, max: maxPercentage },
    };

    if (checkPrimary) {
      const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
      const headings = content.match(/^#+\s+.+$/gm) || [];
      
      result.inFirstParagraph = paragraphs.length > 0 ? 
        paragraphs[0]?.toLowerCase().includes(lowerKeyword) ?? false : false;
      result.inLastParagraph = paragraphs.length > 0 ? 
        paragraphs[paragraphs.length - 1]?.toLowerCase().includes(lowerKeyword) ?? false : false;
      result.inFirstHeading = headings.length > 0 ? 
        headings[0]?.toLowerCase().includes(lowerKeyword) ?? false : false;
      result.inLastHeading = headings.length > 0 ? 
        headings[headings.length - 1]?.toLowerCase().includes(lowerKeyword) ?? false : false;
    }

    if (checkSub) {
      const h2Headings = content.match(/^##\s+.+$/gm) || [];
      const h2WithKeyword = h2Headings.filter(h => h.toLowerCase().includes(lowerKeyword));
      result.inH2Headings = h2WithKeyword;
      
      if (h2WithKeyword.length > 0) {
        const sections = content.split(/^##\s+/gm);
        result.inRelatedParagraphs = sections.some(section => {
          const sectionLower = section.toLowerCase();
          const hasHeadingWithKeyword = sectionLower.split('\n')[0]?.includes(lowerKeyword);
          const hasParagraphWithKeyword = sectionLower.includes(lowerKeyword);
          return hasHeadingWithKeyword && hasParagraphWithKeyword;
        });
      }
    }

    return result;
  };

  const handleCopy = async (keyword: string) => {
    await navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const primaryAnalysis = analyzeKeyword(primaryKeyword, 0.7, 0.9, true, false);
  const sub1Analysis = analyzeKeyword(subKeyword1, 0.1, 0.2, false, true);
  const sub2Analysis = analyzeKeyword(subKeyword2, 0.1, 0.2, false, true);
  const sub3Analysis = analyzeKeyword(subKeyword3, 0.1, 0.2, false, true);
  const sub4Analysis = analyzeKeyword(subKeyword4, 0.1, 0.2, false, true);
  const companyAnalysis = analyzeKeyword(companyName, 0.1, 0.2, false, false);

  const CriteriaCheck = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <X className="w-4 h-4 text-destructive" />
      )}
      <span className={met ? 'text-muted-foreground' : 'text-destructive'}>
        {label}
      </span>
    </div>
  );

  const KeywordCard = ({
    title,
    keyword,
    analysis,
    checkPrimary = false,
    checkSub = false,
  }: {
    title: string;
    keyword: string;
    analysis: AnalysisResult;
    checkPrimary?: boolean;
    checkSub?: boolean;
  }) => {
    if (!keyword) return null;

    const isInRange = analysis.count >= analysis.requiredCount.min && 
                     analysis.count <= analysis.requiredCount.max;

    return (
      <Card className={highlightedKeyword === keyword ? 'ring-2 ring-primary' : ''}>
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={() => handleCopy(keyword)}
              data-testid={`button-copy-${keyword}`}
            >
              {copiedKeyword === keyword ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <button
            onClick={() => onKeywordClick(keyword)}
            className="text-right text-sm text-primary hover:underline truncate block w-full"
            data-testid={`button-highlight-${keyword}`}
          >
            {keyword}
          </button>
        </CardHeader>
        <CardContent className="space-y-3">
          {checkPrimary && (
            <div className="space-y-2">
              <CriteriaCheck 
                met={analysis.inFirstParagraph || false} 
                label="موجودة في أول فقرة" 
              />
              <CriteriaCheck 
                met={analysis.inFirstHeading || false} 
                label="موجودة في أول عنوان" 
              />
              <CriteriaCheck 
                met={analysis.inLastHeading || false} 
                label="موجودة في آخر عنوان" 
              />
              <CriteriaCheck 
                met={analysis.inLastParagraph || false} 
                label="موجودة في آخر فقرة" 
              />
            </div>
          )}

          {checkSub && (
            <div className="space-y-2">
              <CriteriaCheck 
                met={(analysis.inH2Headings?.length || 0) > 0} 
                label={`موجودة في ${analysis.inH2Headings?.length || 0} عنوان H2`}
              />
              <CriteriaCheck 
                met={analysis.inRelatedParagraphs || false} 
                label="موجودة في فقرة نفس العنوان" 
              />
            </div>
          )}

          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">النسبة المطلوبة:</span>
              <span className="font-medium">
                {analysis.requiredPercentage.min.toFixed(1)}% - {analysis.requiredPercentage.max.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">النسبة الحالية:</span>
              <Badge variant={isInRange ? 'default' : 'destructive'}>
                {analysis.percentage.toFixed(2)}%
              </Badge>
            </div>
          </div>

          <div className="pt-2 border-t space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">العدد المطلوب:</span>
              <span className="font-medium">
                {analysis.requiredCount.min} - {analysis.requiredCount.max}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">العدد الحالي:</span>
              <Badge variant={isInRange ? 'default' : 'destructive'}>
                {analysis.count}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <KeywordCard
        title="الكلمة المفتاحية الأساسية"
        keyword={primaryKeyword}
        analysis={primaryAnalysis}
        checkPrimary={true}
      />
      
      <KeywordCard
        title="العبارة الفرعية 1"
        keyword={subKeyword1}
        analysis={sub1Analysis}
        checkSub={true}
      />
      
      <KeywordCard
        title="العبارة الفرعية 2"
        keyword={subKeyword2}
        analysis={sub2Analysis}
        checkSub={true}
      />
      
      <KeywordCard
        title="العبارة الفرعية 3"
        keyword={subKeyword3}
        analysis={sub3Analysis}
        checkSub={true}
      />
      
      <KeywordCard
        title="العبارة الفرعية 4"
        keyword={subKeyword4}
        analysis={sub4Analysis}
        checkSub={true}
      />
      
      <KeywordCard
        title="اسم الشركة"
        keyword={companyName}
        analysis={companyAnalysis}
      />
    </div>
  );
}
