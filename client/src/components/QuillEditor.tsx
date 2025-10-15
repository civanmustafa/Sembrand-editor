import { useRef, useEffect, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export interface HighlightConfig {
  text: string;
  color: 'green' | 'orange' | 'red' | 'purple' | 'blue' | 'yellow';
  type: 'primary' | 'secondary' | 'company' | 'phrase' | 'violation';
}

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightedKeyword?: string | null;
  highlights?: HighlightConfig[];
  onEditorReady?: (editor: any) => void;
}

export default function QuillEditor({
  value,
  onChange,
  highlightedKeyword,
  highlights = [],
  onEditorReady
}: QuillEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const originalContentRef = useRef<string>('');

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }
  }, [onEditorReady]);

  useEffect(() => {
    if (quillRef.current) {
      highlightText();
    }
  }, [highlights, highlightedKeyword]);

  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    let content = originalContentRef.current || editor.root.innerHTML;
    if (!originalContentRef.current) {
      originalContentRef.current = content;
    }

    content = content.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');

    const colorMap = {
      green: '#22c55e',
      orange: '#f97316',
      red: '#ef4444',
      purple: '#a855f7',
      blue: '#3b82f6',
      yellow: '#eab308'
    };

    highlights.forEach(h => {
      const escapedText = escapeRegex(h.text);
      const regex = new RegExp(`(${escapedText})`, 'gi');
      content = content.replace(regex, `<mark style="background-color: ${colorMap[h.color]}33; color: inherit;" data-highlight-type="${h.type}">$1</mark>`);
    });

    if (highlightedKeyword) {
      const escapedKeyword = escapeRegex(highlightedKeyword);
      const regex = new RegExp(`(${escapedKeyword})`, 'gi');
      content = content.replace(regex, `<mark style="background-color: ${colorMap.blue}66; border: 2px solid ${colorMap.blue}; border-radius: 3px; padding: 2px;" data-highlight-type="selected">$1</mark>`);
    }

    editor.root.innerHTML = content;
  };

  const handleEditorChange = (newValue: string) => {
    const cleanedValue = newValue.replace(/<mark[^>]*>(.*?)<\/mark>/g, '$1');
    originalContentRef.current = cleanedValue;
    onChange(newValue);
  };

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'code-block'],
      ['clean']
    ]
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'direction', 'align',
    'link', 'code-block'
  ];

  return (
    <div className="quill-editor-wrapper" dir="rtl">
      <style>{`
        .quill-editor-wrapper .ql-container {
          font-family: Tajawal, Cairo, "IBM Plex Sans Arabic", -apple-system, sans-serif;
          font-size: 16px;
          min-height: 500px;
          direction: rtl;
          text-align: right;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: 500px;
          direction: rtl;
          text-align: right;
        }
        .quill-editor-wrapper .ql-toolbar {
          direction: ltr;
        }
        .quill-editor-wrapper mark {
          border-radius: 2px;
          padding: 1px 2px;
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
          content: 'عنوان 1';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
          content: 'عنوان 2';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
          content: 'عنوان 3';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
          content: 'عنوان 4';
        }
        .ql-snow .ql-picker.ql-header .ql-picker-label:not([data-value])::before,
        .ql-snow .ql-picker.ql-header .ql-picker-item:not([data-value])::before {
          content: 'نص عادي';
        }
      `}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleEditorChange}
        modules={modules}
        formats={formats}
        placeholder="ابدأ الكتابة أو الصق المحتوى هنا..."
      />
    </div>
  );
}
