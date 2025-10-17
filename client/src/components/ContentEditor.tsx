import TiptapEditor, { HighlightConfig } from './TiptapEditor';
import { Card } from '@/components/ui/card';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  highlightedKeyword?: string | null;
  highlights?: HighlightConfig[];
  onEditorReady?: (editor: any) => void;
  scrollToText?: string | null;
  onClearHighlights?: () => void;
}

const textToHtml = (text: string): string => {
  if (!text) return '';
  
  let html = text;
  
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  const orderedListRegex = /(?:^|\n)((?:\d+\..+(?:\n|$))+)/g;
  html = html.replace(orderedListRegex, (match, listContent) => {
    const items = listContent.trim().split('\n').map((line: string) => {
      const content = line.replace(/^\d+\.\s*/, '');
      return `<li>${content}</li>`;
    }).join('');
    return `<ol>${items}</ol>`;
  });
  
  const unorderedListRegex = /(?:^|\n)((?:[•\-*]\s+.+(?:\n|$))+)/g;
  html = html.replace(unorderedListRegex, (match, listContent) => {
    const items = listContent.trim().split('\n').map((line: string) => {
      const content = line.replace(/^[•\-*]\s*/, '');
      return `<li>${content}</li>`;
    }).join('');
    return `<ul>${items}</ul>`;
  });
  
  const lines = html.split('\n');
  const converted: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('<') || line === '') {
      converted.push(line);
      continue;
    }
    
    converted.push(`<p>${line}</p>`);
  }
  
  html = converted.join('');
  
  return html;
};

const htmlToText = (html: string): string => {
  if (!html) return '';
  
  let text = html;
  
  text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  
  text = text.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 1;
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, item: string) => {
      return `${counter++}. ${item.trim()}\n`;
    });
    return items + '\n';
  });
  
  text = text.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    const items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m: string, item: string) => {
      return `• ${item.trim()}\n`;
    });
    return items + '\n';
  });
  
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  
  text = text.replace(/<[^>]+>/g, '');
  
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  
  return text;
};

export default function ContentEditor({ 
  content, 
  onChange,
  highlightedKeyword,
  highlights = [],
  onEditorReady,
  scrollToText = null,
  onClearHighlights
}: ContentEditorProps) {
  const htmlContent = textToHtml(content);
  
  const handleChange = (newHtml: string) => {
    const plainText = htmlToText(newHtml);
    onChange(plainText);
  };

  return (
    <Card className="h-full flex flex-col p-0 overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <TiptapEditor
          value={htmlContent}
          onChange={handleChange}
          highlightedKeyword={highlightedKeyword}
          highlights={highlights}
          onEditorReady={onEditorReady}
          scrollToText={scrollToText}
          onClearHighlights={onClearHighlights}
        />
      </div>
    </Card>
  );
}
