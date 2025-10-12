import { useState } from 'react';
import { Descendant } from 'slate';
import SlateEditor from './SlateEditor';
import { Highlighter } from 'lucide-react';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
}

// Convert plain text to Slate value
const textToSlateValue = (text: string): Descendant[] => {
  if (!text.trim()) {
    return [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      } as any,
    ];
  }

  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(para => {
    // Check if it starts with heading markers
    if (para.startsWith('# ')) {
      return {
        type: 'heading-one',
        children: [{ text: para.slice(2) }],
      } as any;
    } else if (para.startsWith('## ')) {
      return {
        type: 'heading-two',
        children: [{ text: para.slice(3) }],
      } as any;
    } else {
      return {
        type: 'paragraph',
        children: [{ text: para }],
      } as any;
    }
  });
};

// Convert Slate value to plain text
const slateValueToText = (value: Descendant[]): string => {
  return value
    .map((node: any) => {
      if (node.children) {
        return node.children.map((child: any) => child.text || '').join('');
      }
      return '';
    })
    .join('\n\n');
};

export default function ContentEditor({ 
  content, 
  onChange, 
  primaryKeyword = '', 
  secondaryKeywords = [] 
}: ContentEditorProps) {
  const [slateValue, setSlateValue] = useState<Descendant[]>(() => 
    textToSlateValue(content)
  );

  const handleChange = (newValue: Descendant[]) => {
    setSlateValue(newValue);
    const plainText = slateValueToText(newValue);
    onChange(plainText);
  };

  return (
    <div className="relative h-full">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 text-sm text-muted-foreground">
        <Highlighter className="w-4 h-4" />
        <span>المحرر</span>
      </div>
      
      <div className="pt-12 h-full overflow-y-auto">
        <SlateEditor
          value={slateValue}
          onChange={handleChange}
          primaryKeyword={primaryKeyword}
          secondaryKeywords={secondaryKeywords}
        />
      </div>
    </div>
  );
}
