import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
        <div className="space-y-1">
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            من {totalCount} معايير: {violationCount} مخالف - {achievedCount} متوافق
          </p>
        </div>
      </div>
    </Card>
  );
}
