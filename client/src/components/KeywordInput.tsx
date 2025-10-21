import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Key, Highlighter } from 'lucide-react';
import type { PrimaryKeywordAnalysis, SubKeywordAnalysis, CompanyNameAnalysis } from '@shared/schema';
import PrimaryKeywordCard from './PrimaryKeywordCard';
import SubKeywordCard from './SubKeywordCard';
import CompanyNameCard from './CompanyNameCard';

interface KeywordInputProps {
  primaryKeyword: string;
  subKeywords: string[];
  companyName: string;
  highlightedKeyword: string | null;
  primaryAnalysis: PrimaryKeywordAnalysis | null;
  subAnalyses: (SubKeywordAnalysis | null)[];
  companyAnalysis: CompanyNameAnalysis | null;
  onPrimaryKeywordChange: (value: string) => void;
  onSubKeywordChange: (index: number, value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onKeywordClick: (keyword: string, type: 'primary' | 'sub' | 'company') => void;
  onHighlightAll: () => void;
}

export default function KeywordInput({
  primaryKeyword,
  subKeywords,
  companyName,
  highlightedKeyword,
  primaryAnalysis,
  subAnalyses,
  companyAnalysis,
  onPrimaryKeywordChange,
  onSubKeywordChange,
  onCompanyNameChange,
  onKeywordClick,
  onHighlightAll
}: KeywordInputProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5" />
            إدخال الكلمات المفتاحية
          </CardTitle>
          <Button
            onClick={onHighlightAll}
            size="sm"
            variant="outline"
            className="gap-2"
            data-testid="button-highlight-all"
          >
            <Highlighter className="w-4 h-4" />
            تمييز الكل
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Keyword */}
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
          {primaryKeyword && primaryAnalysis && (
            <div className="mt-2">
              <PrimaryKeywordCard
                analysis={primaryAnalysis}
                isHighlighted={highlightedKeyword === primaryKeyword}
                onToggleHighlight={() => onKeywordClick(primaryKeyword, 'primary')}
              />
            </div>
          )}
        </div>

        {/* Sub Keywords */}
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
            {subKeywords[index] && subAnalyses && subAnalyses[index] && (
              <div className="mt-2">
                <SubKeywordCard
                  analysis={subAnalyses[index]!}
                  index={index}
                  isHighlighted={highlightedKeyword === subKeywords[index]}
                  onToggleHighlight={() => onKeywordClick(subKeywords[index], 'sub')}
                />
              </div>
            )}
          </div>
        ))}

        {/* Company Name */}
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
          {companyName && companyAnalysis && (
            <div className="mt-2">
              <CompanyNameCard
                analysis={companyAnalysis}
                isHighlighted={highlightedKeyword === companyName}
                onToggleHighlight={() => onKeywordClick(companyName, 'company')}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
