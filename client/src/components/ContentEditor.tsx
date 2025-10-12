import { useState, useRef, useEffect } from 'react';
import { Highlighter } from 'lucide-react';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
}

export default function ContentEditor({ 
  content, 
  onChange, 
  primaryKeyword = '', 
  secondaryKeywords = [] 
}: ContentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [highlightedContent, setHighlightedContent] = useState(content);

  useEffect(() => {
    if (!editorRef.current) return;
    
    let html = content;
    
    // Highlight primary keyword (green)
    if (primaryKeyword && primaryKeyword.trim()) {
      const regex = new RegExp(`(${primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      html = html.replace(regex, '<mark class="bg-success/20 text-success-foreground">$1</mark>');
    }
    
    // Highlight secondary keywords (yellow)
    secondaryKeywords.forEach(keyword => {
      if (keyword && keyword.trim()) {
        const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        html = html.replace(regex, '<mark class="bg-warning/25 text-warning-foreground">$1</mark>');
      }
    });
    
    setHighlightedContent(html);
  }, [content, primaryKeyword, secondaryKeywords]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    onChange(text);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-sm text-muted-foreground">
        <Highlighter className="w-4 h-4" />
        <span>المحرر</span>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder="ابدأ الكتابة أو الصق المحتوى هنا..."
        className="w-full h-full p-6 pt-16 bg-muted/30 rounded-lg border border-border
                   focus:outline-none focus:ring-2 focus:ring-primary/50
                   text-foreground leading-relaxed text-right
                   overflow-y-auto"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
        data-testid="input-content-editor"
      />
    </div>
  );
}
