import { useCallback, useMemo } from 'react';
import { createEditor, Descendant, Element as SlateElement, Editor } from 'slate';
import { Slate, Editable, withReact, useSlateStatic } from 'slate-react';
import { withHistory } from 'slate-history';
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
  Quote,
  Strikethrough,
  Code
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
  highlightedKeyword?: string | null;
}

export default function SlateEditor({
  value,
  onChange,
  highlightedKeyword
}: SlateEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback(
    (props: any) => (
      <Leaf
        {...props}
        highlightedKeyword={highlightedKeyword}
      />
    ),
    [highlightedKeyword]
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
      <div className="space-y-2 h-full flex flex-col">
        <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-md border flex-wrap">
          <MarkButton format="bold" icon={<Bold className="w-4 h-4" />} />
          <MarkButton format="italic" icon={<Italic className="w-4 h-4" />} />
          <MarkButton format="underline" icon={<Underline className="w-4 h-4" />} />
          <MarkButton format="strikethrough" icon={<Strikethrough className="w-4 h-4" />} />
          <MarkButton format="code" icon={<Code className="w-4 h-4" />} />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <BlockButton format="heading-one" icon={<Heading1 className="w-4 h-4" />} />
          <BlockButton format="heading-two" icon={<Heading2 className="w-4 h-4" />} />
          <BlockButton format="heading-three" icon={<Heading3 className="w-4 h-4" />} />
          <BlockButton format="heading-four" icon={<Heading4 className="w-4 h-4" />} />
          <BlockButton format="block-quote" icon={<Quote className="w-4 h-4" />} />
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <BlockButton format="numbered-list" icon={<ListOrdered className="w-4 h-4" />} />
          <BlockButton format="bulleted-list" icon={<List className="w-4 h-4" />} />
        </div>

        <div className="flex-1 overflow-auto">
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="ابدأ الكتابة أو الصق المحتوى هنا..."
            spellCheck
            onKeyDown={handleKeyDown}
            className="min-h-[400px] p-6 bg-muted/30 rounded-md border
                       focus:outline-none focus:ring-2 focus:ring-primary/50
                       text-foreground leading-relaxed"
            dir="rtl"
            style={{ textAlign: 'right' }}
            data-testid="slate-editor"
          />
        </div>
      </div>
    </Slate>
  );
}

const toggleBlock = (editor: any, format: string) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  editor.unwrapNodes({
    match: (n: any) =>
      !editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as any).type),
    split: true,
  });

  const newProperties: any = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };

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

const isBlockActive = (editor: any, format: string) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    editor.nodes({
      at: editor.unhangRange(selection),
      match: (n: any) => {
        if (!editor.isEditor(n) && SlateElement.isElement(n)) {
          return (n as any).type === format;
        }
        return false;
      },
    })
  );

  return !!match;
};

const isMarkActive = (editor: any, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

const Element = ({ attributes, children, element }: any) => {
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote {...attributes} className="border-r-4 border-primary pr-4 my-4 text-muted-foreground">
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul {...attributes} className="list-disc list-inside my-2">
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 {...attributes} className="text-3xl font-bold my-4">
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 {...attributes} className="text-2xl font-semibold my-3">
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 {...attributes} className="text-xl font-semibold my-2">
          {children}
        </h3>
      );
    case 'heading-four':
      return (
        <h4 {...attributes} className="text-lg font-medium my-2">
          {children}
        </h4>
      );
    case 'list-item':
      return (
        <li {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol {...attributes} className="list-decimal list-inside my-2">
          {children}
        </ol>
      );
    default:
      return (
        <p {...attributes} className="my-2">
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf, highlightedKeyword }: any) => {
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
  if (leaf.strikethrough) {
    content = <s>{content}</s>;
  }
  if (leaf.code) {
    content = <code className="bg-muted px-1 py-0.5 rounded text-sm">{content}</code>;
  }

  const text = leaf.text || '';
  const lowerText = text.toLowerCase();
  
  let highlighted = false;
  if (highlightedKeyword && lowerText.includes(highlightedKeyword.toLowerCase())) {
    highlighted = true;
  }

  return (
    <span 
      {...attributes} 
      className={highlighted ? 'bg-primary/30 text-primary-foreground rounded px-0.5' : ''}
    >
      {content}
    </span>
  );
};

const BlockButton = ({ format, icon }: { format: string; icon: React.ReactNode }) => {
  const editor = useSlateStatic();
  const isActive = isBlockActive(editor, format);
  
  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
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
  const isActive = isMarkActive(editor, format);
  
  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
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
