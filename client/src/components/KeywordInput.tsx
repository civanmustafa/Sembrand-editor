import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Highlighter } from 'lucide-react';

interface KeywordInputProps {
  primaryKeyword: string;
  subKeyword1: string;
  subKeyword2: string;
  subKeyword3: string;
  subKeyword4: string;
  companyName: string;
  onPrimaryChange: (value: string) => void;
  onSubKeyword1Change: (value: string) => void;
  onSubKeyword2Change: (value: string) => void;
  onSubKeyword3Change: (value: string) => void;
  onSubKeyword4Change: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onHighlightAll?: () => void;
  isHighlighted?: boolean;
}

export default function KeywordInput({
  primaryKeyword,
  subKeyword1,
  subKeyword2,
  subKeyword3,
  subKeyword4,
  companyName,
  onPrimaryChange,
  onSubKeyword1Change,
  onSubKeyword2Change,
  onSubKeyword3Change,
  onSubKeyword4Change,
  onCompanyNameChange,
  onHighlightAll,
  isHighlighted = false,
}: KeywordInputProps) {
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
        </div>

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
        </div>

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
        </div>
      </CardContent>
    </Card>
  );
}
