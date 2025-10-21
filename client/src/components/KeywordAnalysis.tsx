import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import KeywordInput from './KeywordInput';
import { analyzePrimaryKeyword, analyzeSubKeyword, analyzeCompanyName } from '@/lib/keywordAnalysis';
import type { PrimaryKeywordAnalysis, SubKeywordAnalysis, CompanyNameAnalysis } from '@shared/schema';

interface KeywordAnalysisProps {
  content: string;
  primaryKeyword: string;
  subKeywords: string[];
  companyName: string;
  highlightedKeyword: string | null;
  onPrimaryKeywordChange: (value: string) => void;
  onSubKeywordChange: (index: number, value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onKeywordClick: (keyword: string, type: 'primary' | 'sub' | 'company') => void;
  onHighlightAll: () => void;
}

export default function KeywordAnalysis({
  content,
  primaryKeyword,
  subKeywords,
  companyName,
  highlightedKeyword,
  onPrimaryKeywordChange,
  onSubKeywordChange,
  onCompanyNameChange,
  onKeywordClick,
  onHighlightAll
}: KeywordAnalysisProps) {
  
  // Analyze keywords
  const primaryAnalysis = useMemo<PrimaryKeywordAnalysis | null>(() => {
    if (!primaryKeyword) return null;
    return analyzePrimaryKeyword(content, primaryKeyword);
  }, [content, primaryKeyword]);

  const subAnalyses = useMemo<(SubKeywordAnalysis | null)[]>(() => {
    return subKeywords.map(keyword => {
      if (!keyword) return null;
      return analyzeSubKeyword(content, keyword);
    });
  }, [content, subKeywords]);

  const companyAnalysis = useMemo<CompanyNameAnalysis | null>(() => {
    if (!companyName) return null;
    return analyzeCompanyName(content, companyName);
  }, [content, companyName]);

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <KeywordInput
            primaryKeyword={primaryKeyword}
            subKeywords={subKeywords}
            companyName={companyName}
            highlightedKeyword={highlightedKeyword}
            primaryAnalysis={primaryAnalysis}
            subAnalyses={subAnalyses}
            companyAnalysis={companyAnalysis}
            onPrimaryKeywordChange={onPrimaryKeywordChange}
            onSubKeywordChange={onSubKeywordChange}
            onCompanyNameChange={onCompanyNameChange}
            onKeywordClick={onKeywordClick}
            onHighlightAll={onHighlightAll}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
