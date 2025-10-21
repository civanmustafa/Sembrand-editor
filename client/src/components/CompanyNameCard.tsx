import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { CompanyNameAnalysis } from '@shared/schema';

interface CompanyNameCardProps {
  analysis: CompanyNameAnalysis | null;
  isHighlighted: boolean;
  onToggleHighlight: () => void;
}

export default function CompanyNameCard({
  analysis,
  isHighlighted,
  onToggleHighlight
}: CompanyNameCardProps) {
  const { toast } = useToast();

  if (!analysis || !analysis.name) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(analysis.name);
      toast({
        title: "تم النسخ",
        description: "تم نسخ اسم الشركة"
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل نسخ اسم الشركة",
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
              data-testid="button-company-name"
            >
              {analysis.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              data-testid="button-copy-company-name"
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Badge variant={isInRange ? "default" : "destructive"} className="w-fit text-xs">
          اسم الشركة
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* Frequency analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">النسبة المطلوبة:</span>
            <span className="font-medium" data-testid="text-company-target-percentage">
              {analysis.targetPercentage.min}% - {analysis.targetPercentage.max}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">العدد المطلوب:</span>
            <span className="font-medium" data-testid="text-company-target-count">
              {analysis.targetCount.min} - {analysis.targetCount.max} مرة
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">النسبة الحالية:</span>
            <span 
              className={`font-medium ${isInRange ? 'text-green-600' : 'text-red-600'}`}
              data-testid="text-company-current-percentage"
            >
              {analysis.currentPercentage.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">العدد الحالي:</span>
            <span 
              className={`font-medium ${isInRange ? 'text-green-600' : 'text-red-600'}`}
              data-testid="text-company-current-count"
            >
              {analysis.currentCount} مرة
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
