import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, X, Highlighter, HighlighterIcon } from 'lucide-react';
import { useState } from 'react';
import { normalizeArabicText, findAllOccurrences } from '@/lib/arabicUtils';

interface KeywordAnalysisProps {
  content: string;
  primaryKeyword: string;
  subKeyword1: string;
  subKeyword2: string;
  subKeyword3: string;
  subKeyword4: string;
  companyName: string;
  onKeywordClick: (keyword: string, moveCursorOnly?: boolean) => void;
  highlightedKeyword: string | null;
  onHighlightAllKeywords?: () => void;
  onClearAllHighlights?: () => void;
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
  onHighlightAllKeywords,
  onClearAllHighlights,
}: KeywordAnalysisProps) {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [allHighlighted, setAllHighlighted] = useState(false);

  const handleToggleAllHighlights = () => {
    if (allHighlighted) {
      onClearAllHighlights?.();
      setAllHighlighted(false);
    } else {
      onHighlightAllKeywords?.();
      setAllHighlighted(true);
    }
  };

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
    
    const occurrences = findAllOccurrences(content, keyword);
    const count = occurrences.length;
    
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
        findAllOccurrences(paragraphs[0] || '', keyword).length > 0 : false;
      result.inLastParagraph = paragraphs.length > 0 ? 
        findAllOccurrences(paragraphs[paragraphs.length - 1] || '', keyword).length > 0 : false;
      result.inFirstHeading = headings.length > 0 ? 
        findAllOccurrences(headings[0] || '', keyword).length > 0 : false;
      result.inLastHeading = headings.length > 0 ? 
        findAllOccurrences(headings[headings.length - 1] || '', keyword).length > 0 : false;
    }

    if (checkSub) {
      const h2Headings = content.match(/^##\s+.+$/gm) || [];
      const h2WithKeyword = h2Headings.filter(h => findAllOccurrences(h, keyword).length > 0);
      result.inH2Headings = h2WithKeyword;
      
      if (h2WithKeyword.length > 0) {
        const sections = content.split(/^##\s+/gm);
        result.inRelatedParagraphs = sections.some(section => {
          const firstLine = section.split('\n')[0] || '';
          const hasHeadingWithKeyword = findAllOccurrences(firstLine, keyword).length > 0;
          const hasParagraphWithKeyword = findAllOccurrences(section, keyword).length > 0;
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
    isCompany = false,
  }: {
    title: string;
    keyword: string;
    analysis: AnalysisResult;
    checkPrimary?: boolean;
    checkSub?: boolean;
    isCompany?: boolean;
  }) => {
    if (!keyword) return null;

    const isInRange = analysis.count >= analysis.requiredCount.min && 
                     analysis.count <= analysis.requiredCount.max;

    return (
      <Card className={highlightedKeyword === keyword ? 'ring-2 ring-primary' : ''}>
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onKeywordClick(keyword, isCompany);
                }}
                data-testid={`button-highlight-${keyword}`}
              >
                <Highlighter className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
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
          </div>
          <div className="text-right text-sm text-primary truncate block w-full">
            {keyword}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {checkPrimary && (
            <div className="space-y-2 pb-3 border-b">
              <div className="text-xs font-medium text-muted-foreground mb-2">الشروط المطلوبة:</div>
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
            <div className="space-y-2 pb-3 border-b">
              <div className="text-xs font-medium text-muted-foreground mb-2">الشروط المطلوبة:</div>
              <CriteriaCheck 
                met={(analysis.inH2Headings?.length || 0) > 0} 
                label={
                  (analysis.inH2Headings?.length || 0) > 0 
                    ? `موجودة في ${analysis.inH2Headings?.length || 0} ${(analysis.inH2Headings?.length || 0) === 1 ? 'عنوان' : 'عناوين'} H2` 
                    : "غير موجودة في أي عنوان H2 (مطلوب عنوان واحد على الأقل)"
                }
              />
              <CriteriaCheck 
                met={analysis.inRelatedParagraphs || false} 
                label={
                  analysis.inRelatedParagraphs 
                    ? "موجودة في الفقرات المرتبطة بنفس العناوين" 
                    : "غير موجودة في الفقرات المرتبطة بالعناوين (مطلوب)"
                } 
              />
            </div>
          )}

          <div className="pt-3 space-y-3">
            <div className="space-y-2">
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
            
            <div className="space-y-2 pt-2 border-t">
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
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button
          onClick={handleToggleAllHighlights}
          variant={allHighlighted ? "default" : "outline"}
          className="flex-1"
          data-testid="button-toggle-all-highlights"
        >
          <HighlighterIcon className="w-4 h-4 ml-2" />
          {allHighlighted ? "مسح التمييز" : "تمييز جميع الكلمات"}
        </Button>
      </div>
      
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
        isCompany={true}
      />
    </div>
  );
}
