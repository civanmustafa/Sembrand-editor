import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { SubKeywordAnalysis } from '@shared/schema';

interface SubKeywordCardProps {
  analysis: SubKeywordAnalysis | null;
  index: number;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
}

export default function SubKeywordCard({
  analysis,
  index,
  isHighlighted,
  onToggleHighlight
}: SubKeywordCardProps) {
  const { toast } = useToast();

  if (!analysis || !analysis.keyword) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.keyword);
      toast({
        title: "تم النسخ",
        description: `تم نسخ العبارة الفرعية ${index + 1}`
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل نسخ العبارة الفرعية",
        variant: "destructive"
      });
    }
  };

  const isInRange = 
    analysis.currentPercentage >= analysis.targetPercentage.min &&
    analysis.currentPercentage <= analysis.targetPercentage.max;

  const allConditionsMet = analysis.inH2Heading && analysis.inSameH2Paragraph && isInRange;

  return (
    <Card className={`transition-all ${isHighlighted ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CardTitle 
              className="text-base cursor-pointer hover-elevate active-elevate-2 px-2 py-1 rounded-md truncate"
              onClick={onToggleHighlight}
              data-testid={`button-sub-keyword-${index}`}
            >
              {analysis.keyword}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              data-testid={`button-copy-sub-keyword-${index}`}
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Badge variant={allConditionsMet ? "default" : "destructive"} className="w-fit text-xs">
          العبارة الفرعية {index + 1}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* H2 checks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2" data-testid={`text-in-h2-${index}`}>
            <span className="text-muted-foreground">موجودة في عنوان H2؟</span>
            {analysis.inH2Heading ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className="flex items-center justify-between gap-2" data-testid={`text-in-h2-paragraph-${index}`}>
            <span className="text-muted-foreground">في فقرة نفس العنوان؟</span>
            {analysis.inSameH2Paragraph ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <X className="w-4 h-4 text-red-600" />
            )}
          </div>
          
          {analysis.h2HeadingsContaining.length > 0 && (
            <div className="pt-1">
              <span className="text-muted-foreground text-xs">عناوين H2 المحتوية:</span>
              <ul className="mt-1 space-y-1">
                {analysis.h2HeadingsContaining.map((heading, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground truncate" title={heading}>
                    • {heading}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Frequency analysis */}
        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">النسبة المطلوبة:</span>
            <span className="font-medium" data-testid={`text-target-percentage-${index}`}>
              {analysis.targetPercentage.min}% - {analysis.targetPercentage.max}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">العدد المطلوب:</span>
            <span className="font-medium" data-testid={`text-target-count-${index}`}>
              {analysis.targetCount.min} - {analysis.targetCount.max} مرة
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">النسبة الحالية:</span>
            <span 
              className={`font-medium ${isInRange ? 'text-green-600' : 'text-red-600'}`}
              data-testid={`text-current-percentage-${index}`}
            >
              {analysis.currentPercentage.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">العدد الحالي:</span>
            <span 
              className={`font-medium ${isInRange ? 'text-green-600' : 'text-red-600'}`}
              data-testid={`text-current-count-${index}`}
            >
              {analysis.currentCount} مرة
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
