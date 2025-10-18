import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

type CriteriaStatus = 'achieved' | 'close' | 'violation';

interface CriteriaCardProps {
  title: string;
  description?: string;
  status: CriteriaStatus;
  required: string;
  current: string;
  details?: string[];
  onClick?: () => void;
  isHighlighted?: boolean;
  tooltipContent?: string;
  violationCount?: number;
  totalCount?: number;
}

export default function CriteriaCard({
  title,
  description,
  status,
  required,
  current,
  details,
  onClick,
  isHighlighted = false,
  tooltipContent,
  violationCount = 0,
  totalCount = 1
}: CriteriaCardProps) {
  const statusConfig = {
    achieved: {
      icon: CheckCircle2,
      color: 'success',
      bg: 'bg-success/5',
      border: 'border-r-success',
      badgeVariant: 'default' as const,
      badgeClass: 'bg-success text-success-foreground'
    },
    close: {
      icon: AlertTriangle,
      color: 'warning',
      bg: 'bg-warning/5',
      border: 'border-r-warning',
      badgeVariant: 'secondary' as const,
      badgeClass: 'bg-warning/20 text-warning-foreground border-warning/30'
    },
    violation: {
      icon: XCircle,
      color: 'destructive',
      bg: 'bg-destructive/5',
      border: 'border-r-destructive',
      badgeVariant: 'destructive' as const,
      badgeClass: 'bg-destructive/20 text-destructive border-destructive/30'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  
  // Calculate progress (inverse - violations reduce the progress)
  const progressValue = status === 'achieved' ? 100 : 
                        status === 'close' ? 50 : 
                        Math.max(0, ((totalCount - violationCount) / totalCount) * 100);

  return (
    <Card className={`p-1 border-r-4 ${config.border} ${config.bg} ${isHighlighted ? 'ring-2 ring-primary' : ''}`} data-testid={`card-criteria-${title}`} dir="rtl">
      <div className="space-y-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 flex items-center gap-1.5">
            <h3 
              className={`font-semibold text-[13px] text-foreground text-right ${onClick && status === 'violation' ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
              onClick={onClick && status === 'violation' ? onClick : undefined}
            >
              {title}
            </h3>
            {tooltipContent && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-sm whitespace-pre-line">{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Icon className={`w-4 h-4 text-${config.color} shrink-0`} />
        </div>

        {/* Progress Bar */}
        {status === 'violation' && violationCount > 0 && (
          <div className="space-y-0.5">
            <Progress value={progressValue} className="h-1.5 animate-pulse" />
            <p className="text-[10px] text-muted-foreground text-right">
              {violationCount} مخالفة
            </p>
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center justify-start gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <span className="font-mono text-[12px]">{required}</span>
          </div>
          <span className="text-muted-foreground text-[11px]">←</span>
          <div className="flex items-center gap-1">
            <span className="text-[12px]">→</span>
            <Badge className={`font-mono ${config.badgeClass} text-[12px] px-1.5 py-0`}>
              {current}
            </Badge>
          </div>
        </div>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="pt-1 border-t border-border/50">
            <ul className="space-y-0.5 text-[10px] text-muted-foreground">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-right break-words">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
