import { useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import { normalizeArabicText } from '@/lib/arabicUtils';

export interface HighlightConfig {
  text: string;
  color: 'green' | 'orange' | 'red' | 'purple' | 'blue' | 'yellow';
  type: 'primary' | 'secondary' | 'company' | 'phrase' | 'violation';
}

interface TinyEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightedKeyword?: string | null;
  highlights?: HighlightConfig[];
  onEditorReady?: (editor: any) => void;
}

export default function TinyEditor({
  value,
  onChange,
  highlightedKeyword,
  highlights = [],
  onEditorReady
}: TinyEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const originalContentRef = useRef<string>('');

  useEffect(() => {
    if (editorRef.current) {
      highlightText();
    }
  }, [highlights, highlightedKeyword]);

  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = () => {
    const editor = editorRef.current;
    if (!editor) return;

    let content = originalContentRef.current || editor.getContent({ format: 'html' });
    if (!originalContentRef.current) {
      originalContentRef.current = content;
    }

    // Remove existing highlights
    content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');

    const colorMap = {
      green: '#22c55e',
      orange: '#f97316',
      red: '#ef4444',
      purple: '#a855f7',
      blue: '#3b82f6',
      yellow: '#eab308'
    };

    // Apply highlights for all configured highlights
    highlights.forEach(h => {
      const escapedText = escapeRegex(h.text);
      const regex = new RegExp(`(${escapedText})`, 'gi');
      content = content.replace(regex, `<mark style="background-color: ${colorMap[h.color]}33; color: inherit;" data-highlight-type="${h.type}">$1</mark>`);
    });

    // Apply special highlight for the currently selected keyword/phrase
    if (highlightedKeyword) {
      const escapedKeyword = escapeRegex(highlightedKeyword);
      const regex = new RegExp(`(${escapedKeyword})`, 'gi');
      content = content.replace(regex, `<mark style="background-color: ${colorMap.blue}66; border: 2px solid ${colorMap.blue}; border-radius: 3px; padding: 2px;" data-highlight-type="selected">$1</mark>`);
    }

    editor.setContent(content);
  };

  const handleEditorChange = (newValue: string) => {
    originalContentRef.current = newValue.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
    onChange(newValue);
  };

  return (
    <Editor
      onInit={(evt, editor) => {
        editorRef.current = editor;
        if (onEditorReady) {
          onEditorReady(editor);
        }
      }}
      value={value}
      onEditorChange={handleEditorChange}
      init={{
        height: 500,
        menubar: false,
        plugins: [
          'lists', 'link', 'code', 'table', 'wordcount',
          'searchreplace', 'directionality'
        ],
        toolbar: 'undo redo | blocks | bold italic underline strikethrough | ' +
          'alignleft aligncenter alignright | bullist numlist | ' +
          'removeformat | ltr rtl | code',
        directionality: 'rtl',
        language: 'ar',
        content_style: `
          body { 
            font-family: Tajawal, Cairo, "IBM Plex Sans Arabic", -apple-system, sans-serif; 
            font-size: 16px; 
            direction: rtl; 
            text-align: right; 
            line-height: 1.6;
          }
          mark {
            border-radius: 2px;
            padding: 1px 2px;
          }
        `,
        skin: 'oxide-dark',
        content_css: 'dark',
      }}
    />
  );
}
