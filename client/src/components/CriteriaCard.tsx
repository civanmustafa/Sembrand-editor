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
    <Card className={`p-2 border-r-4 ${config.border} ${config.bg} ${isHighlighted ? 'ring-2 ring-primary' : ''}`} data-testid={`card-criteria-${title}`} dir="rtl">
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 flex items-center gap-2">
            <h3 
              className={`font-semibold text-base text-foreground text-right ${onClick && status === 'violation' ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
              onClick={onClick && status === 'violation' ? onClick : undefined}
            >
              {title}
            </h3>
            {tooltipContent && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <p className="text-sm whitespace-pre-line">{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <Icon className={`w-5 h-5 text-${config.color} shrink-0`} />
        </div>

        {/* Progress Bar */}
        {status === 'violation' && violationCount > 0 && (
          <div className="space-y-1">
            <Progress value={progressValue} className="h-1.5" />
            <p className="text-xs text-muted-foreground text-right">
              {violationCount} مخالفة
            </p>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground text-right">المطلوب</p>
            <p className="font-mono text-sm font-medium text-right break-words">{required}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground text-right">الحالي</p>
            <Badge className={`font-mono ${config.badgeClass} text-xs`}>
              {current}
            </Badge>
          </div>
        </div>

        {/* Details */}
        {details && details.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <ul className="space-y-1 text-xs text-muted-foreground">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
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
