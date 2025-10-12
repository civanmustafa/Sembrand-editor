import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search, Replace, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchReplaceProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onReplace?: (searchText: string, replaceText: string, replaceAll: boolean) => void;
}

export default function SearchReplace({
  isOpen,
  onClose,
  content,
  onReplace
}: SearchReplaceProps) {
  const [searchText, setSearchText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);

  if (!isOpen) return null;

  const handleSearch = () => {
    if (!searchText) {
      setTotalMatches(0);
      setCurrentMatch(0);
      return;
    }

    const lowerContent = content.toLowerCase();
    const lowerSearch = searchText.toLowerCase();
    let count = 0;
    let index = 0;

    while ((index = lowerContent.indexOf(lowerSearch, index)) !== -1) {
      count++;
      index += lowerSearch.length;
    }

    setTotalMatches(count);
    setCurrentMatch(count > 0 ? 1 : 0);
  };

  const handleNext = () => {
    if (totalMatches === 0) return;
    setCurrentMatch(prev => (prev >= totalMatches ? 1 : prev + 1));
  };

  const handlePrevious = () => {
    if (totalMatches === 0) return;
    setCurrentMatch(prev => (prev <= 1 ? totalMatches : prev - 1));
  };

  const handleReplace = () => {
    if (onReplace && searchText) {
      onReplace(searchText, replaceText, false);
      handleSearch();
    }
  };

  const handleReplaceAll = () => {
    if (onReplace && searchText) {
      onReplace(searchText, replaceText, true);
      handleSearch();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-start justify-center pt-20"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md p-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">البحث والاستبدال</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClose}
              data-testid="button-close-search"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="البحث عن..."
                className="flex-1"
                dir="rtl"
                autoFocus
                data-testid="input-search"
              />
              <Button
                onClick={handleSearch}
                variant="outline"
                size="icon"
                data-testid="button-search"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {totalMatches > 0 && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {currentMatch} من {totalMatches}
                </span>
                <div className="flex gap-1">
                  <Button
                    onClick={handlePrevious}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    data-testid="button-previous"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={handleNext}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    data-testid="button-next"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="استبدال بـ..."
                className="flex-1"
                dir="rtl"
                data-testid="input-replace"
              />
              <Button
                onClick={handleReplace}
                variant="outline"
                size="icon"
                data-testid="button-replace"
              >
                <Replace className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleReplaceAll}
                variant="default"
                className="flex-1"
                data-testid="button-replace-all"
              >
                استبدال الكل
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            <p>Enter: التالي | Shift+Enter: السابق | Esc: إغلاق</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
