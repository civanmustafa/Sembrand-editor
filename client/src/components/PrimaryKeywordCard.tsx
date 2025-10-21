import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { PrimaryKeywordAnalysis } from '@shared/schema';

interface PrimaryKeywordCardProps {
  analysis: PrimaryKeywordAnalysis | null;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
}

export default function PrimaryKeywordCard({
  analysis,
  isHighlighted,
  onToggleHighlight
}: PrimaryKeywordCardProps) {
  const { toast } = useToast();

  if (!analysis || !analysis.keyword) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.keyword);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الكلمة المفتاحية الأساسية"
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل نسخ الكلمة المفتاحية",
        variant: "destructive"
      });
    }
  };

  const isInRange = 
    analysis.currentPercentage >= analysis.targetPercentage.min &&
    analysis.currentPercentage <= analysis.targetPercentage.max;

  return (
    <Card className={`transition-all ${isHighlighted ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CardTitle 
              className="text-base cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md truncate"
              onClick={onToggleHighlight}
              data-testid="button-primary-keyword"
            >
              {analysis.keyword}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              data-testid="button-copy-primary-keyword"
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Badge variant={isInRange ? "default" : "destructive"} className="w-fit text-xs">
          الكلمة المفتاحية الأساسية
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Position checks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2" data-testid="text-first-paragraph">
            <span className="text-muted-foreground">في أول فقرة؟</span>
            {analysis.inFirstParagraph ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2" data-testid="text-first-heading">
            <span className="text-muted-foreground">في أول عنوان؟</span>
            {analysis.inFirstHeading ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2" data-testid="text-last-heading">
            <span className="text-muted-foreground">في آخر عنوان؟</span>
            {analysis.inLastHeading ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2" data-testid="text-last-paragraph">
            <span className="text-muted-foreground">في آخر فقرة؟</span>
            {analysis.inLastParagraph ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
        </div>

        {/* Frequency analysis */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">النسبة المطلوبة:</span>
            <span className="font-medium" data-testid="text-target-percentage">
              {analysis.targetPercentage.min}% - {analysis.targetPercentage.max}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">العدد المطلوب:</span>
            <span className="font-medium" data-testid="text-target-count">
              {analysis.targetCount.min} - {analysis.targetCount.max} مرة
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">النسبة الحالية:</span>
            <span 
              className={`font-medium ${isInRange ? 'text-green-600' : 'text-red-600'}`}
              data-testid="text-current-percentage"
            >
              {analysis.currentPercentage.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">العدد الحالي:</span>
            <span 
              className={`font-medium ${isInRange ? 'text-green-600' : 'text-red-600'}`}
              data-testid="text-current-count"
            >
              {analysis.currentCount} مرة
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
