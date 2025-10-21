import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';

interface KeywordInputProps {
  primaryKeyword: string;
  subKeywords: string[];
  companyName: string;
  onPrimaryKeywordChange: (value: string) => void;
  onSubKeywordChange: (index: number, value: string) => void;
  onCompanyNameChange: (value: string) => void;
}

export default function KeywordInput({
  primaryKeyword,
  subKeywords,
  companyName,
  onPrimaryKeywordChange,
  onSubKeywordChange,
  onCompanyNameChange
}: KeywordInputProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Key className="w-5 h-5" />
          إدخال الكلمات المفتاحية
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="primary-keyword" className="text-sm font-medium">
            الكلمة المفتاحية الأساسية
          </Label>
          <Input
            id="primary-keyword"
            data-testid="input-primary-keyword"
            value={primaryKeyword}
            onChange={(e) => onPrimaryKeywordChange(e.target.value)}
            placeholder="أدخل الكلمة المفتاحية الأساسية"
            className="text-right"
            dir="rtl"
          />
        </div>

        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-2">
            <Label htmlFor={`sub-keyword-${index}`} className="text-sm font-medium">
              العبارة الفرعية {index + 1}
            </Label>
            <Input
              id={`sub-keyword-${index}`}
              data-testid={`input-sub-keyword-${index}`}
              value={subKeywords[index] || ''}
              onChange={(e) => onSubKeywordChange(index, e.target.value)}
              placeholder={`أدخل العبارة الفرعية ${index + 1}`}
              className="text-right"
              dir="rtl"
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="company-name" className="text-sm font-medium">
            اسم الشركة
          </Label>
          <Input
            id="company-name"
            data-testid="input-company-name"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="أدخل اسم الشركة"
            className="text-right"
            dir="rtl"
          />
        </div>
      </CardContent>
    </Card>
  );
}
