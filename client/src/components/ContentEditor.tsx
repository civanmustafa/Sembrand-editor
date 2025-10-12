import { useState, useEffect } from 'react';
import { Descendant } from 'slate';
import SlateEditor from './SlateEditor';
import { Card } from '@/components/ui/card';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  highlightedKeyword?: string | null;
}

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
    if (para.startsWith('#### ')) {
      return {
        type: 'heading-four',
        children: [{ text: para.slice(5) }],
      } as any;
    } else if (para.startsWith('### ')) {
      return {
        type: 'heading-three',
        children: [{ text: para.slice(4) }],
      } as any;
    } else if (para.startsWith('## ')) {
      return {
        type: 'heading-two',
        children: [{ text: para.slice(3) }],
      } as any;
    } else if (para.startsWith('# ')) {
      return {
        type: 'heading-one',
        children: [{ text: para.slice(2) }],
      } as any;
    } else {
      return {
        type: 'paragraph',
        children: [{ text: para }],
      } as any;
    }
  });
};

const slateValueToText = (value: Descendant[]): string => {
  return value
    .map((node: any) => {
      const text = node.children?.map((child: any) => child.text || '').join('') || '';
      
      if (node.type === 'heading-one') return `# ${text}`;
      if (node.type === 'heading-two') return `## ${text}`;
      if (node.type === 'heading-three') return `### ${text}`;
      if (node.type === 'heading-four') return `#### ${text}`;
      
      return text;
    })
    .join('\n\n');
};

export default function ContentEditor({ 
  content, 
  onChange,
  highlightedKeyword
}: ContentEditorProps) {
  const [slateValue, setSlateValue] = useState<Descendant[]>(() => 
    textToSlateValue(content)
  );

  useEffect(() => {
    if (!content) {
      setSlateValue(textToSlateValue(''));
    }
  }, [content]);

  const handleChange = (newValue: Descendant[]) => {
    setSlateValue(newValue);
    const plainText = slateValueToText(newValue);
    onChange(plainText);
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden p-4">
        <SlateEditor
          value={slateValue}
          onChange={handleChange}
          highlightedKeyword={highlightedKeyword}
        />
      </div>
    </Card>
  );
}
