import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ListChecks, XCircle, CheckCircle2 } from 'lucide-react';

interface CategoryHeaderProps {
  title: string;
  emoji?: string;
  violationCount: number;
  totalCount: number;
}

export default function CategoryHeader({ title, emoji, violationCount, totalCount }: CategoryHeaderProps) {
  // Calculate progress (inverse - violations reduce the progress)
  const achievedCount = totalCount - violationCount;
  const progressValue = totalCount > 0 ? (achievedCount / totalCount) * 100 : 100;

  return (
    <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-r-4 border-r-primary">
      <div className="space-y-3">
        <div className="flex items-center justify-end gap-2">
          <h3 className="text-xl font-semibold text-foreground">
            {title}
          </h3>
          {emoji && <span className="text-2xl">{emoji}</span>}
        </div>
        <div className="space-y-2">
          <Progress value={progressValue} className="h-2" />
          <div className="flex items-center justify-end gap-4 text-sm">
            <div className="flex items-center gap-1.5" data-testid="total-criteria">
              <ListChecks className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{totalCount}</span>
              <span className="text-muted-foreground">معايير</span>
            </div>
            <div className="flex items-center gap-1.5" data-testid="violations-count">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="font-medium text-destructive">{violationCount}</span>
              <span className="text-muted-foreground">مخالف</span>
            </div>
            <div className="flex items-center gap-1.5" data-testid="achieved-count">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-600">{achievedCount}</span>
              <span className="text-muted-foreground">متوافق</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
