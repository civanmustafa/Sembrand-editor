import { useMemo, useCallback } from 'react';
import SlateEditor, { HighlightConfig } from './SlateEditor';
import { Card } from '@/components/ui/card';
import { Descendant } from 'slate';

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  highlightedKeyword?: string | null;
  highlights?: HighlightConfig[];
  onEditorReady?: (editor: any) => void;
}

const textToSlateValue = (text: string): Descendant[] => {
  if (!text || text.trim() === '') {
    return [{ type: 'paragraph', children: [{ text: '' }] } as any];
  }
  
  const lines = text.split('\n');
  const nodes: Descendant[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (line === '') {
      i++;
      continue;
    }
    
    if (line.startsWith('# ')) {
      nodes.push({
        type: 'heading-one',
        children: [{ text: line.substring(2) }]
      } as any);
      i++;
    } else if (line.startsWith('## ')) {
      nodes.push({
        type: 'heading-two',
        children: [{ text: line.substring(3) }]
      } as any);
      i++;
    } else if (line.startsWith('### ')) {
      nodes.push({
        type: 'heading-three',
        children: [{ text: line.substring(4) }]
      } as any);
      i++;
    } else if (line.startsWith('#### ')) {
      nodes.push({
        type: 'heading-four',
        children: [{ text: line.substring(5) }]
      } as any);
      i++;
    } else if (/^\d+\.\s/.test(line)) {
      const listItems: any[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s*/, '');
        listItems.push({
          type: 'list-item',
          children: [{ text: itemText }]
        });
        i++;
      }
      nodes.push({
        type: 'numbered-list',
        children: listItems
      } as any);
    } else if (/^[•\-*]\s/.test(line)) {
      const listItems: any[] = [];
      while (i < lines.length && /^[•\-*]\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[•\-*]\s*/, '');
        listItems.push({
          type: 'list-item',
          children: [{ text: itemText }]
        });
        i++;
      }
      nodes.push({
        type: 'bulleted-list',
        children: listItems
      } as any);
    } else {
      nodes.push({
        type: 'paragraph',
        children: [{ text: line }]
      } as any);
      i++;
    }
  }
  
  return nodes.length > 0 ? nodes : [{ type: 'paragraph', children: [{ text: '' }] } as any];
};

const slateValueToText = (value: Descendant[]): string => {
  const lines: string[] = [];
  
  const processNode = (node: any) => {
    if ('text' in node) {
      return node.text;
    }
    
    const childrenText = node.children?.map(processNode).join('') || '';
    
    switch (node.type) {
      case 'heading-one':
        return `# ${childrenText}`;
      case 'heading-two':
        return `## ${childrenText}`;
      case 'heading-three':
        return `### ${childrenText}`;
      case 'heading-four':
        return `#### ${childrenText}`;
      case 'numbered-list':
        return node.children?.map((child: any, idx: number) => {
          const text = child.children?.map(processNode).join('') || '';
          return `${idx + 1}. ${text}`;
        }).join('\n') || '';
      case 'bulleted-list':
        return node.children?.map((child: any) => {
          const text = child.children?.map(processNode).join('') || '';
          return `• ${text}`;
        }).join('\n') || '';
      case 'block-quote':
        return childrenText;
      case 'list-item':
        return childrenText;
      case 'paragraph':
      default:
        return childrenText;
    }
  };
  
  value.forEach(node => {
    const text = processNode(node);
    if (text) {
      lines.push(text);
    }
  });
  
  return lines.join('\n');
};

export default function ContentEditor({ 
  content, 
  onChange,
  highlightedKeyword,
  highlights = [],
  onEditorReady
}: ContentEditorProps) {
  const slateValue = useMemo(() => textToSlateValue(content), [content]);
  
  const handleChange = useCallback((newValue: Descendant[]) => {
    const plainText = slateValueToText(newValue);
    onChange(plainText);
  }, [onChange]);

  return (
    <Card className="h-full flex flex-col">
      <div className="flex-1 overflow-hidden p-4">
        <SlateEditor
          value={slateValue}
          onChange={handleChange}
          highlightedKeyword={highlightedKeyword}
          highlights={highlights}
          onEditorReady={onEditorReady}
        />
      </div>
    </Card>
  );
}
