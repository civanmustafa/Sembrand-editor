import { useCallback, useMemo, useEffect } from 'react';
import { createEditor, Descendant, Element as SlateElement, Text, BaseEditor } from 'slate';
import { Slate, Editable, withReact, ReactEditor, useSlateStatic } from 'slate-react';
import { withHistory, HistoryEditor } from 'slate-history';
// @ts-ignore - no types available
import isHotkey from 'is-hotkey';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
} as const;

interface SlateEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
}

export default function SlateEditor({
  value,
  onChange,
  primaryKeyword = '',
  secondaryKeywords = []
}: SlateEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback(
    (props: any) => (
      <Leaf
        {...props}
        primaryKeyword={primaryKeyword}
        secondaryKeywords={secondaryKeywords}
      />
    ),
    [primaryKeyword, secondaryKeywords]
  );

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event as any)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey as keyof typeof HOTKEYS];
        toggleMark(editor, mark);
      }
    }
  }, [editor]);

  return (
    <Slate editor={editor} initialValue={value} onValueChange={onChange}>
      <div className="space-y-2">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-lg border border-border flex-wrap">
          <MarkButton format="bold" icon={<Bold className="w-4 h-4" />} />
          <MarkButton format="italic" icon={<Italic className="w-4 h-4" />} />
          <MarkButton format="underline" icon={<Underline className="w-4 h-4" />} />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <BlockButton format="heading-one" icon={<Heading1 className="w-4 h-4" />} />
          <BlockButton format="heading-two" icon={<Heading2 className="w-4 h-4" />} />
          <BlockButton format="heading-three" icon={<Heading3 className="w-4 h-4" />} />
          <BlockButton format="heading-four" icon={<Heading4 className="w-4 h-4" />} />
          <BlockButton format="block-quote" icon={<Quote className="w-4 h-4" />} />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <BlockButton format="numbered-list" icon={<ListOrdered className="w-4 h-4" />} />
          <BlockButton format="bulleted-list" icon={<List className="w-4 h-4" />} />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <BlockButton format="left" icon={<AlignLeft className="w-4 h-4" />} />
          <BlockButton format="center" icon={<AlignCenter className="w-4 h-4" />} />
          <BlockButton format="right" icon={<AlignRight className="w-4 h-4" />} />
          <BlockButton format="justify" icon={<AlignJustify className="w-4 h-4" />} />
        </div>

        {/* Editor */}
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="ابدأ الكتابة أو الصق المحتوى هنا..."
          spellCheck
          onKeyDown={handleKeyDown}
          className="min-h-[500px] p-6 bg-muted/30 rounded-lg border border-border
                     focus:outline-none focus:ring-2 focus:ring-primary/50
                     text-foreground leading-relaxed"
          dir="rtl"
          style={{ textAlign: 'right' }}
          data-testid="slate-editor"
        />
      </div>
    </Slate>
  );
}

const toggleBlock = (editor: any, format: string) => {
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
  const isList = LIST_TYPES.includes(format);

  editor.unwrapNodes({
    match: (n: any) =>
      !editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as any).type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });

  let newProperties: any;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    };
  }

  editor.setNodes(newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    editor.wrapNodes(block);
  }
};

const toggleMark = (editor: any, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    editor.removeMark(format);
  } else {
    editor.addMark(format, true);
  }
};

const isBlockActive = (editor: any, format: string, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    editor.nodes({
      at: editor.unhangRange(selection),
      match: (n: any) => {
        if (!editor.isEditor(n) && SlateElement.isElement(n)) {
          if (blockType === 'align' && 'align' in n) {
            return (n as any).align === format;
          }
          return (n as any).type === format;
        }
        return false;
      },
    })
  );

  return !!match;
};

const isMarkActive = (editor: any, format: string) => {
  const marks = editor.marks();
  return marks ? marks[format] === true : false;
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const Element = ({ attributes, children, element }: any) => {
  const style: any = {};
  if ('align' in element) {
    style.textAlign = element.align;
  }

  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes} className="border-r-4 border-primary pr-4 my-4 text-muted-foreground">
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes} className="list-disc list-inside my-2">
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes} className="text-3xl font-bold my-4">
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes} className="text-2xl font-semibold my-3">
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 style={style} {...attributes} className="text-xl font-semibold my-2">
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 style={style} {...attributes} className="text-lg font-medium my-2">
          {children}
        </h4>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={style} {...attributes} className="list-decimal list-inside my-2">
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes} className="my-2">
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf, primaryKeyword, secondaryKeywords }: any) => {
  let content = children;

  if (leaf.bold) {
    content = <strong>{content}</strong>;
  }
  if (leaf.italic) {
    content = <em>{content}</em>;
  }
  if (leaf.underline) {
    content = <u>{content}</u>;
  }

  // Highlight keywords
  const text = leaf.text || '';
  const lowerText = text.toLowerCase();
  
  let highlighted = false;
  let highlightClass = '';

  if (primaryKeyword && lowerText.includes(primaryKeyword.toLowerCase())) {
    highlighted = true;
    highlightClass = 'bg-success/20 text-success-foreground';
  } else if (secondaryKeywords) {
    for (const keyword of secondaryKeywords) {
      if (keyword && lowerText.includes(keyword.toLowerCase())) {
        highlighted = true;
        highlightClass = 'bg-warning/25 text-warning-foreground';
        break;
      }
    }
  }

  return (
    <span {...attributes} className={highlighted ? highlightClass : ''}>
      {content}
    </span>
  );
};

const BlockButton = ({ format, icon }: { format: string; icon: React.ReactNode }) => {
  const editor = useSlateStatic();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
      data-testid={`button-block-${format}`}
    >
      {icon}
    </Button>
  );
};

const MarkButton = ({ format, icon }: { format: string; icon: React.ReactNode }) => {
  const editor = useSlateStatic();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      data-testid={`button-mark-${format}`}
    >
      {icon}
    </Button>
  );
};
