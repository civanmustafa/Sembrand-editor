import { useState } from 'react';
import { Plus, X, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface KeywordInputProps {
  primaryKeyword: string;
  secondaryKeywords: string[];
  onPrimaryChange: (keyword: string) => void;
  onSecondaryChange: (keywords: string[]) => void;
  onKeywordClick?: (keyword: string, type: 'primary' | 'secondary') => void;
}

export default function KeywordInput({
  primaryKeyword,
  secondaryKeywords,
  onPrimaryChange,
  onSecondaryChange,
  onKeywordClick
}: KeywordInputProps) {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !secondaryKeywords.includes(newKeyword.trim())) {
      onSecondaryChange([...secondaryKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const updated = secondaryKeywords.filter((_, i) => i !== index);
    onSecondaryChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="space-y-6 p-6 bg-card border border-card-border rounded-lg">
      {/* Primary Keyword */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          الكلمة المفتاحية الأساسية
        </label>
        <div className="flex gap-2">
          <Input
            value={primaryKeyword}
            onChange={(e) => onPrimaryChange(e.target.value)}
            placeholder="أدخل الكلمة المفتاحية الأساسية"
            className="text-right"
            data-testid="input-primary-keyword"
          />
          {primaryKeyword && (
            <Button
              size="icon"
              variant="outline"
              onClick={() => onKeywordClick?.(primaryKeyword, 'primary')}
              className="shrink-0"
              data-testid="button-highlight-primary"
            >
              <MousePointer2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Secondary Keywords */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          الكلمات المفتاحية الفرعية
        </label>
        
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="أضف كلمة فرعية"
            className="text-right"
            data-testid="input-secondary-keyword"
          />
          <Button
            size="icon"
            onClick={handleAddKeyword}
            disabled={!newKeyword.trim()}
            data-testid="button-add-secondary"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Secondary Keywords List */}
        {secondaryKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {secondaryKeywords.map((keyword, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="gap-2 hover-elevate cursor-pointer bg-warning/20 text-warning-foreground border-warning/30"
                onClick={() => onKeywordClick?.(keyword, 'secondary')}
                data-testid={`badge-keyword-${index}`}
              >
                <span>{keyword}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveKeyword(index);
                  }}
                  className="hover:text-destructive"
                  data-testid={`button-remove-keyword-${index}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
