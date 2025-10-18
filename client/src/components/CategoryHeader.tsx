import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { XCircle, CheckCircle2 } from 'lucide-react';

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
  const isAllAchieved = violationCount === 0;

  return (
    <Card className={`p-4 bg-gradient-to-br from-primary/10 via-accent/5 to-background border-r-4 ${
      isAllAchieved ? 'border-r-success' : 'border-r-destructive'
    }`}>
      <div className="space-y-3">
        <div className="flex items-center justify-end gap-2">
          <h3 className={`text-xl font-semibold transition-colors duration-500 ${
            isAllAchieved ? 'text-success' : 'text-foreground'
          }`}>
            {title}
          </h3>
          {emoji && <span className="text-2xl">{emoji}</span>}
        </div>
        <div className="space-y-2">
          <Progress 
            value={progressValue} 
            className={`h-2 transition-all duration-500 ${
              isAllAchieved ? '[&>div]:bg-success' : ''
            }`} 
          />
          <div className="flex items-center justify-end gap-4 text-sm">
            <div className="flex items-center gap-1.5" data-testid="violations-count">
              <XCircle className={`w-4 h-4 transition-colors duration-500 ${
                isAllAchieved ? 'text-success' : 'text-destructive'
              }`} />
              <span className={`font-medium transition-colors duration-500 ${
                isAllAchieved ? 'text-success' : 'text-foreground'
              }`}>{violationCount}</span>
              <span className={`transition-colors duration-500 ${
                isAllAchieved ? 'text-success' : 'text-muted-foreground'
              }`}>مخالف</span>
            </div>
            <div className="flex items-center gap-1.5" data-testid="achieved-count">
              <CheckCircle2 className={`w-4 h-4 transition-colors duration-500 ${
                isAllAchieved ? 'text-success' : 'text-green-600'
              }`} />
              <span className={`font-medium transition-colors duration-500 ${
                isAllAchieved ? 'text-success' : 'text-foreground'
              }`}>{achievedCount}</span>
              <span className={`transition-colors duration-500 ${
                isAllAchieved ? 'text-success' : 'text-muted-foreground'
              }`}>متوافق</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
