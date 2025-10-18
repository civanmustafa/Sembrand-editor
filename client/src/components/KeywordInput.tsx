import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Highlighter, CheckCircle2, XCircle, Check, X } from 'lucide-react';
import { findAllOccurrences, normalizeArabicText } from '@/lib/arabicUtils';

interface KeywordInputProps {
  primaryKeyword: string;
  subKeyword1: string;
  subKeyword2: string;
  subKeyword3: string;
  subKeyword4: string;
  companyName: string;
  content: string;
  onPrimaryChange: (value: string) => void;
  onSubKeyword1Change: (value: string) => void;
  onSubKeyword2Change: (value: string) => void;
  onSubKeyword3Change: (value: string) => void;
  onSubKeyword4Change: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onHighlightAll?: () => void;
  isHighlighted?: boolean;
  onKeywordClick?: (keyword: string, moveCursorOnly?: boolean) => void;
  highlightedKeyword?: string | null;
  onHighlightAllKeywords?: () => void;
  onClearAllHighlights?: () => void;
}

export default function KeywordInput({
  primaryKeyword,
  subKeyword1,
  subKeyword2,
  subKeyword3,
  subKeyword4,
  companyName,
  content,
  onPrimaryChange,
  onSubKeyword1Change,
  onSubKeyword2Change,
  onSubKeyword3Change,
  onSubKeyword4Change,
  onCompanyNameChange,
  onHighlightAll,
  isHighlighted = false,
}: KeywordInputProps) {
  
  const getKeywordCount = (keyword: string) => {
    if (!keyword || !content) return 0;
    return findAllOccurrences(content, keyword).length;
  };

  const getTotalWords = () => {
    if (!content) return 0;
    return content.split(/\s+/).filter(w => w.length > 0).length;
  };

  const getPercentage = (keyword: string) => {
    const count = getKeywordCount(keyword);
    const total = getTotalWords();
    if (total === 0) return '0.00';
    return ((count / total) * 100).toFixed(2);
  };

  const getStatus = (keyword: string, minPct: number, maxPct: number) => {
    const pct = parseFloat(getPercentage(keyword));
    return pct >= minPct && pct <= maxPct;
  };

  const checkInFirstParagraph = (keyword: string) => {
    if (!keyword || !content) return false;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length === 0) return false;
    const normalized = normalizeArabicText(paragraphs[0] || '');
    const normalizedKeyword = normalizeArabicText(keyword);
    return normalized.includes(normalizedKeyword);
  };

  const checkInLastParagraph = (keyword: string) => {
    if (!keyword || !content) return false;
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    if (paragraphs.length === 0) return false;
    const normalized = normalizeArabicText(paragraphs[paragraphs.length - 1] || '');
    const normalizedKeyword = normalizeArabicText(keyword);
    return normalized.includes(normalizedKeyword);
  };

  const checkInFirstHeading = (keyword: string) => {
    if (!keyword || !content) return false;
    const headings = content.match(/^#+\s+.+$/gm) || [];
    if (headings.length === 0) return false;
    const normalized = normalizeArabicText(headings[0] || '');
    const normalizedKeyword = normalizeArabicText(keyword);
    return normalized.includes(normalizedKeyword);
  };

  const checkInLastHeading = (keyword: string) => {
    if (!keyword || !content) return false;
    const headings = content.match(/^#+\s+.+$/gm) || [];
    if (headings.length === 0) return false;
    const normalized = normalizeArabicText(headings[headings.length - 1] || '');
    const normalizedKeyword = normalizeArabicText(keyword);
    return normalized.includes(normalizedKeyword);
  };

  const CriteriaCheck = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-1.5 text-xs">
      {met ? (
        <Check className="w-3 h-3 text-success flex-shrink-0" />
      ) : (
        <X className="w-3 h-3 text-destructive flex-shrink-0" />
      )}
      <span className={met ? 'text-muted-foreground' : 'text-destructive'}>
        {label}
      </span>
    </div>
  );

  const KeywordStats = ({ 
    keyword, 
    color, 
    minPct, 
    maxPct, 
    showPositionChecks = false 
  }: { 
    keyword: string; 
    color: string; 
    minPct: number; 
    maxPct: number;
    showPositionChecks?: boolean;
  }) => {
    if (!keyword) return null;
    
    const count = getKeywordCount(keyword);
    const pct = getPercentage(keyword);
    const isValid = getStatus(keyword, minPct, maxPct);
    const totalWords = getTotalWords();
    const minRequired = Math.ceil((totalWords * minPct) / 100);
    const maxRequired = Math.floor((totalWords * maxPct) / 100);
    
    return (
      <div className="space-y-2">
        <div className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border ${
          color === 'green' ? 'bg-green-500/10 border-green-500/30' :
          color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
          'bg-blue-500/10 border-blue-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {isValid ? (
              <CheckCircle2 className={`w-4 h-4 ${
                color === 'green' ? 'text-green-600 dark:text-green-400' :
                color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                'text-blue-600 dark:text-blue-400'
              }`} />
            ) : (
              <XCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {count} مرة
              </span>
              <span className="text-xs text-muted-foreground">
                مطلوب: {minRequired}-{maxRequired}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className={`text-sm font-bold ${
              color === 'green' ? 'text-green-600 dark:text-green-400' :
              color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
              'text-blue-600 dark:text-blue-400'
            }`}>
              {pct}%
            </div>
            <span className="text-xs text-muted-foreground">
              {minPct}-{maxPct}%
            </span>
          </div>
        </div>
        
        {showPositionChecks && (
          <div className="px-3 py-2 space-y-1 bg-muted/50 rounded-md border">
            <CriteriaCheck met={checkInFirstParagraph(keyword)} label="موجودة في أول فقرة" />
            <CriteriaCheck met={checkInLastParagraph(keyword)} label="موجودة في آخر فقرة" />
            <CriteriaCheck met={checkInFirstHeading(keyword)} label="موجودة في أول عنوان" />
            <CriteriaCheck met={checkInLastHeading(keyword)} label="موجودة في آخر عنوان" />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">الكلمات المفتاحية</CardTitle>
          {onHighlightAll && (
            <Button
              size="sm"
              variant={isHighlighted ? "default" : "outline"}
              onClick={onHighlightAll}
              className="h-8"
            >
              <Highlighter className="w-3 h-3 ml-1" />
              {isHighlighted ? "إلغاء" : "تمييز الكل"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            الكلمة المفتاحية الأساسية
          </label>
          <Input
            value={primaryKeyword}
            onChange={(e) => onPrimaryChange(e.target.value)}
            placeholder="أدخل الكلمة المفتاحية الأساسية"
            className="text-right"
            data-testid="input-primary-keyword"
          />
          <KeywordStats keyword={primaryKeyword} color="green" minPct={0.7} maxPct={0.9} showPositionChecks={true} />
        </div>

        <div className="h-px bg-border my-4" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            العبارة الفرعية 1
          </label>
          <Input
            value={subKeyword1}
            onChange={(e) => onSubKeyword1Change(e.target.value)}
            placeholder="أدخل العبارة الفرعية الأولى"
            className="text-right"
            data-testid="input-sub-keyword-1"
          />
          <KeywordStats keyword={subKeyword1} color="orange" minPct={0.1} maxPct={0.2} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            العبارة الفرعية 2
          </label>
          <Input
            value={subKeyword2}
            onChange={(e) => onSubKeyword2Change(e.target.value)}
            placeholder="أدخل العبارة الفرعية الثانية"
            className="text-right"
            data-testid="input-sub-keyword-2"
          />
          <KeywordStats keyword={subKeyword2} color="orange" minPct={0.1} maxPct={0.2} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            العبارة الفرعية 3
          </label>
          <Input
            value={subKeyword3}
            onChange={(e) => onSubKeyword3Change(e.target.value)}
            placeholder="أدخل العبارة الفرعية الثالثة"
            className="text-right"
            data-testid="input-sub-keyword-3"
          />
          <KeywordStats keyword={subKeyword3} color="orange" minPct={0.1} maxPct={0.2} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            العبارة الفرعية 4
          </label>
          <Input
            value={subKeyword4}
            onChange={(e) => onSubKeyword4Change(e.target.value)}
            placeholder="أدخل العبارة الفرعية الرابعة"
            className="text-right"
            data-testid="input-sub-keyword-4"
          />
          <KeywordStats keyword={subKeyword4} color="orange" minPct={0.1} maxPct={0.2} />
        </div>

        <div className="h-px bg-border my-4" />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            اسم الشركة
          </label>
          <Input
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="أدخل اسم الشركة"
            className="text-right"
            data-testid="input-company-name"
          />
          <KeywordStats keyword={companyName} color="blue" minPct={0.1} maxPct={0.2} />
        </div>
      </CardContent>
    </Card>
  );
}
