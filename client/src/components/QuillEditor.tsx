import { useRef, useEffect, useMemo, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from '@/components/ui/button';
import { EraserIcon, RemoveFormatting } from 'lucide-react';

export interface HighlightConfig {
  text: string;
  color: 'green' | 'orange' | 'red' | 'purple' | 'blue' | 'yellow' | string;
  type: 'primary' | 'secondary' | 'company' | 'phrase' | 'violation';
}

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightedKeyword?: string | null;
  highlights?: HighlightConfig[];
  onEditorReady?: (editor: any) => void;
  onClearHighlights?: () => void;
}

export default function QuillEditor({
  value,
  onChange,
  highlightedKeyword,
  highlights = [],
  onEditorReady,
  onClearHighlights
}: QuillEditorProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [selectionStats, setSelectionStats] = useState({ words: 0, chars: 0 });

  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      if (onEditorReady) {
        onEditorReady(editor);
      }

      // Listen for text selection changes
      editor.on('selection-change', (range: any) => {
        if (range && range.length > 0) {
          const selectedText = editor.getText(range.index, range.length);
          const words = selectedText.trim().split(/\s+/).filter(w => w.length > 0).length;
          const chars = selectedText.length;
          setSelectionStats({ words, chars });
        } else {
          setSelectionStats({ words: 0, chars: 0 });
        }
      });
    }
  }, [onEditorReady]);

  useEffect(() => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const editorContainer = editor.root;
    
    // Remove all existing highlights while preserving child nodes and formatting
    editorContainer.querySelectorAll('.highlight-mark').forEach(mark => {
      const parent = mark.parentNode;
      if (parent) {
        // Move all child nodes out of the highlight span
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        // Remove the now-empty highlight span
        parent.removeChild(mark);
      }
    });
    
    if (!highlightedKeyword && highlights.length === 0) return;
    
    const colorMap: Record<string, string> = {
      green: '#22c55e',
      orange: '#f97316',
      red: '#ef4444',
      purple: '#a855f7',
      blue: '#3b82f6',
      yellow: '#eab308'
    };
    
    const normalizeForComparison = (str: string) => {
      return str
        .replace(/[أإآ]/g, 'ا')
        .replace(/[ؤ]/g, 'و')
        .replace(/[ئ]/g, 'ي')
        .replace(/[ة]/g, 'ه')
        .replace(/[ى]/g, 'ي')
        .toLowerCase();
    };
    
    const applyHighlight = (text: string, color: string, borderColor?: string) => {
      if (!text) return;
      
      const textContent = editorContainer.textContent || '';
      
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
      
      const escapedWords = words.map(w => {
        const normalized = normalizeForComparison(w);
        const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        return escaped
          .replace(/ا/g, '[اأإآ]')
          .replace(/و/g, '[وؤ]')
          .replace(/ي/g, '[يئى]')
          .replace(/ه/g, '[هة]');
      });
      
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
    
    highlights.forEach(h => {
      const highlightColor = colorMap[h.color] || h.color;
      applyHighlight(h.text, `${highlightColor}33`);
    });
    
    if (highlightedKeyword) {
      applyHighlight(highlightedKeyword, `${colorMap.blue}66`, colorMap.blue);
    }
  }, [highlightedKeyword, highlights]);

  const handleRemoveEmptyLines = () => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const delta = editor.getContents();
    
    // Process delta to remove excessive empty lines while preserving formatting
    const ops = delta.ops || [];
    const newOps: any[] = [];
    let consecutiveNewlines = 0;
    
    ops.forEach(op => {
      if (typeof op.insert === 'string') {
        const text = op.insert;
        let processedText = '';
        
        for (const char of text) {
          if (char === '\n') {
            consecutiveNewlines++;
            if (consecutiveNewlines <= 2) {
              processedText += char;
            }
          } else {
            consecutiveNewlines = 0;
            processedText += char;
          }
        }
        
        if (processedText) {
          newOps.push({ ...op, insert: processedText });
        }
      } else {
        newOps.push(op);
        consecutiveNewlines = 0;
      }
    });
    
    const newDelta = { ops: newOps };
    editor.setContents(newDelta as any);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: '#custom-toolbar'
    }
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
        .quill-editor-wrapper #custom-toolbar {
          direction: rtl;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          padding: 8px;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--background));
        }
        .quill-editor-wrapper #custom-toolbar .toolbar-row-1 {
          display: flex;
          align-items: center;
          gap: 4px;
          width: 100%;
          order: 1;
        }
        .quill-editor-wrapper #custom-toolbar .toolbar-row-2 {
          display: flex;
          align-items: center;
          gap: 4px;
          width: 100%;
          order: 2;
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
        #custom-toolbar .ql-formats {
          margin-left: 8px;
        }
        #custom-toolbar .custom-actions {
          margin-right: auto;
          display: flex;
          gap: 4px;
        }
      `}</style>
      <div className="relative">
        <div id="custom-toolbar">
          <div className="toolbar-row-1">
            <select className="ql-header" defaultValue="">
              <option value="1">عنوان 1</option>
              <option value="2">عنوان 2</option>
              <option value="3">عنوان 3</option>
              <option value="4">عنوان 4</option>
              <option value="">نص عادي</option>
            </select>
            <span className="ql-formats">
              <button className="ql-list" value="ordered" />
              <button className="ql-list" value="bullet" />
            </span>
            <span className="ql-formats">
              <button className="ql-direction" value="rtl" />
            </span>
            <span className="ql-formats">
              <select className="ql-align" />
            </span>
            <span className="ql-formats">
              <button className="ql-link" />
              <button className="ql-code-block" />
            </span>
            <span className="ql-formats">
              <button className="ql-clean" />
            </span>
          </div>
          <div className="toolbar-row-2">
            <span className="ql-formats">
              <button className="ql-bold" />
              <button className="ql-italic" />
              <button className="ql-underline" />
              <button className="ql-strike" />
            </span>
            <div className="custom-actions flex items-center gap-4" style={{ marginRight: 'auto' }}>
              {selectionStats.words > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md border border-primary/20">
                  <span className="text-xs font-medium text-primary" data-testid="selection-word-count">
                    {selectionStats.words} كلمة
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-medium text-primary" data-testid="selection-char-count">
                    {selectionStats.chars} حرف
                  </span>
                </div>
              )}
              {onClearHighlights && (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={onClearHighlights}
                  className="h-7 w-7"
                  data-testid="button-clear-highlights"
                  title="إلغاء جميع التمييز"
                >
                  <EraserIcon className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button
                size="icon"
                variant="outline"
                onClick={handleRemoveEmptyLines}
                className="h-7 w-7"
                data-testid="button-remove-empty-lines"
                title="مسح الأسطر الفارغة الزائدة"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
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
    </div>
  );
}
