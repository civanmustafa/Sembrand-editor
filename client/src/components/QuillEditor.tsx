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

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (onEditorReady) {
        onEditorReady(editor);
      }
    }
  }, [onEditorReady]);

  useEffect(() => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const editorContainer = editor.root;
    
    // Remove all existing highlights
    editorContainer.querySelectorAll('.highlight-mark').forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
      }
    });
    
    if (!highlightedKeyword && highlights.length === 0) return;
    
    const colorMap = {
      green: '#22c55e',
      orange: '#f97316',
      red: '#ef4444',
      purple: '#a855f7',
      blue: '#3b82f6',
      yellow: '#eab308'
    };
    
    const applyHighlight = (text: string, color: string, borderColor?: string) => {
      if (!text) return;
      
      const textContent = editorContainer.textContent || '';
      
      // For Arabic phrases, we need to find matches more flexibly
      // Remove non-Arabic characters for comparison but keep original for display
      const normalizeForSearch = (str: string) => {
        return str
          .toLowerCase()
          .replace(/[^\u0600-\u06FF\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };
      
      const normalizedText = normalizeForSearch(text);
      const words = normalizedText.split(' ').filter(w => w.length > 0);
      
      if (words.length === 0) return;
      
      // Create a regex pattern that allows for punctuation between words
      const escapedWords = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      // Pattern: word + (optional punctuation + whitespace + optional punctuation) + word
      const regexPattern = escapedWords.join('[^\\u0600-\\u06FF\\s]*\\s+[^\\u0600-\\u06FF\\s]*');
      const regex = new RegExp(regexPattern, 'gi');
      
      let match;
      const matches: Array<{start: number, end: number}> = [];
      
      while ((match = regex.exec(textContent)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length
        });
      }
      
      // Apply highlights for each match
      matches.forEach(({start, end}) => {
        const range = document.createRange();
        let charCount = 0;
        let foundStart = false;
        let foundEnd = false;
        
        const walker = document.createTreeWalker(
          editorContainer,
          NodeFilter.SHOW_TEXT,
          null
        );
        
        let startNode: Node | null = null;
        let startOffset = 0;
        let endNode: Node | null = null;
        let endOffset = 0;
        
        while (walker.nextNode()) {
          const node = walker.currentNode;
          const nodeLength = node.textContent?.length || 0;
          
          if (!foundStart && charCount + nodeLength > start) {
            startNode = node;
            startOffset = start - charCount;
            foundStart = true;
          }
          
          if (foundStart && charCount + nodeLength >= end) {
            endNode = node;
            endOffset = end - charCount;
            foundEnd = true;
            break;
          }
          
          charCount += nodeLength;
        }
        
        if (foundStart && foundEnd && startNode && endNode) {
          try {
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            
            const mark = document.createElement('span');
            mark.className = 'highlight-mark';
            mark.style.backgroundColor = color;
            mark.style.color = 'inherit';
            mark.style.borderRadius = '3px';
            mark.style.padding = '2px 4px';
            if (borderColor) {
              mark.style.border = `2px solid ${borderColor}`;
            }
            
            range.surroundContents(mark);
          } catch (e) {
            // Ignore errors from ranges that span multiple elements
          }
        }
      });
    };
    
    // Apply multi-keyword highlights first
    highlights.forEach(h => {
      applyHighlight(h.text, `${colorMap[h.color]}33`);
    });
    
    // Apply single keyword highlight last (highest priority)
    if (highlightedKeyword) {
      applyHighlight(highlightedKeyword, `${colorMap.blue}66`, colorMap.blue);
    }
  }, [highlightedKeyword, highlights, value]);

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
          max-height: 500px;
          overflow-y: auto;
          direction: rtl;
          text-align: right;
        }
        .quill-editor-wrapper .ql-toolbar {
          direction: ltr;
        }
        .quill-editor-wrapper .highlight-mark {
          border-radius: 3px;
          padding: 2px 4px;
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
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder="ابدأ الكتابة أو الصق المحتوى هنا..."
      />
    </div>
  );
}
