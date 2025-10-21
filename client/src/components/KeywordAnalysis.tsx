import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import KeywordInput from './KeywordInput';
import PrimaryKeywordCard from './PrimaryKeywordCard';
import SubKeywordCard from './SubKeywordCard';
import CompanyNameCard from './CompanyNameCard';
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
  onKeywordClick
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
        <div className="p-4 space-y-4">
          {/* Input section */}
          <KeywordInput
            primaryKeyword={primaryKeyword}
            subKeywords={subKeywords}
            companyName={companyName}
            onPrimaryKeywordChange={onPrimaryKeywordChange}
            onSubKeywordChange={onSubKeywordChange}
            onCompanyNameChange={onCompanyNameChange}
          />

          {/* Analysis section */}
          <div className="space-y-3">
            {/* Primary keyword */}
            {primaryAnalysis && (
              <PrimaryKeywordCard
                analysis={primaryAnalysis}
                isHighlighted={highlightedKeyword === primaryKeyword}
                onToggleHighlight={() => onKeywordClick(primaryKeyword, 'primary')}
              />
            )}

            {/* Sub keywords */}
            {subAnalyses.map((analysis, index) => 
              analysis && (
                <SubKeywordCard
                  key={index}
                  analysis={analysis}
                  index={index}
                  isHighlighted={highlightedKeyword === subKeywords[index]}
                  onToggleHighlight={() => onKeywordClick(subKeywords[index], 'sub')}
                />
              )
            )}

            {/* Company name */}
            {companyAnalysis && (
              <CompanyNameCard
                analysis={companyAnalysis}
                isHighlighted={highlightedKeyword === companyName}
                onToggleHighlight={() => onKeywordClick(companyName, 'company')}
              />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
