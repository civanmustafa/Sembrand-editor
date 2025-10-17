import { useRef, useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import CodeBlock from '@tiptap/extension-code-block';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  AlignRight,
  AlignLeft,
  AlignCenter,
  Link as LinkIcon,
  Code,
  Eraser,
  Trash2,
  Save,
  RotateCcw
} from 'lucide-react';

export interface HighlightConfig {
  text: string;
  color: 'green' | 'orange' | 'red' | 'purple' | 'blue' | 'yellow' | string;
  type: 'primary' | 'secondary' | 'company' | 'phrase' | 'violation' | 'keyword';
}

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlightedKeyword?: string | null;
  highlights?: HighlightConfig[];
  onEditorReady?: (editor: Editor) => void;
  scrollToText?: string | null;
  onClearHighlights?: () => void;
}

// Arabic text normalization for matching
const normalizeForComparison = (str: string) => {
  return str
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .toLowerCase();
};

const normalizeForSearch = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const colorMap: Record<string, string> = {
  green: '#22c55e',
  orange: '#f97316',
  red: '#ef4444',
  purple: '#a855f7',
  blue: '#3b82f6',
  yellow: '#eab308'
};

// RTL Extension for Arabic support
const RTLExtension = Extension.create({
  name: 'rtl',
  
  addGlobalAttributes() {
    return [
      {
        types: ['heading', 'paragraph', 'listItem'],
        attributes: {
          dir: {
            default: 'rtl',
            parseHTML: element => element.dir || 'rtl',
            renderHTML: attributes => {
              return { dir: attributes.dir || 'rtl' };
            }
          }
        }
      }
    ];
  }
});

export default function TiptapEditor({
  value,
  onChange,
  highlightedKeyword,
  highlights = [],
  onEditorReady,
  scrollToText = null,
  onClearHighlights
}: TiptapEditorProps) {
  const [selectionStats, setSelectionStats] = useState({ words: 0, chars: 0 });
  const [savedContent, setSavedContent] = useState<string>('');
  const isApplyingHighlights = useRef(false);
  const previousValue = useRef<string>(value);
  const highlightsRef = useRef<HighlightConfig[]>(highlights);
  const keywordRef = useRef<string | null>(highlightedKeyword || null);
  const isInternalUpdate = useRef(false);

  // Update refs when props change
  useEffect(() => {
    highlightsRef.current = highlights;
    keywordRef.current = highlightedKeyword || null;
  }, [highlights, highlightedKeyword]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3, 4]
        }
      }),
      CodeBlock,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      RTLExtension,
      Extension.create({
        name: 'highlightPlugin',
        addProseMirrorPlugins() {
          return [new Plugin({
            key: new PluginKey('arabicHighlight'),
            state: {
              init() {
                return DecorationSet.empty;
              },
              apply(tr, oldState) {
                // Only recalculate if document changed or highlights were updated
                const forceUpdate = tr.getMeta('forceHighlightUpdate');
                if (!tr.docChanged && !forceUpdate && oldState !== DecorationSet.empty) {
                  return oldState.map(tr.mapping, tr.doc);
                }
                
                const decorations: Decoration[] = [];
                const text = tr.doc.textContent;
                const currentHighlights = highlightsRef.current;
                const currentKeyword = keywordRef.current;

                const applyHighlight = (searchText: string, color: string, borderColor?: string) => {
                  if (!searchText) return;
                  
                  const normalizedText = normalizeForSearch(searchText);
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
                  
                  // Allow spaces and Arabic punctuation between words
                  const regexPattern = escapedWords.join('[^\\u0600-\\u06FF\\s]*[\\s\\u060C\\u061B\\u061F]*[^\\u0600-\\u06FF\\s]*');
                  const regex = new RegExp(regexPattern, 'gi');
                  
                  // Process each block node (paragraph, heading, etc)
                  tr.doc.descendants((node, blockPos) => {
                    if (!node.isTextblock) return;
                    
                    // Build text content for this block with position mapping
                    let blockText = '';
                    const textNodes: { text: string; pos: number; length: number }[] = [];
                    
                    node.descendants((child, childRelPos) => {
                      if (child.isText && child.text) {
                        textNodes.push({
                          text: child.text,
                          pos: blockPos + childRelPos + 1, // +1 for block start token
                          length: child.text.length
                        });
                        blockText += child.text;
                      }
                    });
                    
                    if (!blockText) return;
                    
                    regex.lastIndex = 0;
                    let match;
                    
                    while ((match = regex.exec(blockText)) !== null) {
                      const matchStart = match.index;
                      const matchEnd = matchStart + match[0].length;
                      
                      // Find which text nodes contain this match
                      let textOffset = 0;
                      
                      for (const textNode of textNodes) {
                        const nodeStart = textOffset;
                        const nodeEnd = textOffset + textNode.length;
                        
                        if (matchEnd <= nodeStart) break; // Match is before this node
                        if (matchStart >= nodeEnd) {
                          textOffset = nodeEnd;
                          continue; // Match is after this node
                        }
                        
                        // Match overlaps with this node
                        const overlapStart = Math.max(matchStart, nodeStart);
                        const overlapEnd = Math.min(matchEnd, nodeEnd);
                        
                        const from = textNode.pos + (overlapStart - nodeStart);
                        const to = textNode.pos + (overlapEnd - nodeStart);
                        
                        const decoration = Decoration.inline(
                          from,
                          to,
                          {
                            class: 'highlight-mark',
                            style: `background-color: ${color}; ${borderColor ? `border: 2px solid ${borderColor};` : ''} border-radius: 3px; padding: 2px 4px;`
                          }
                        );
                        decorations.push(decoration);
                        
                        textOffset = nodeEnd;
                      }
                    }
                  });
                };

                // Apply all highlights
                currentHighlights.forEach(h => {
                  const highlightColor = colorMap[h.color] || h.color;
                  applyHighlight(h.text, `${highlightColor}33`);
                });

                // Apply highlighted keyword with border
                if (currentKeyword) {
                  applyHighlight(currentKeyword, `${colorMap.blue}66`, colorMap.blue);
                }

                return DecorationSet.create(tr.doc, decorations);
              }
            },
            props: {
              decorations(state) {
                return this.getState(state);
              }
            }
          })];
        }
      })
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[500px] max-h-[500px] overflow-y-auto',
        dir: 'rtl'
      }
    },
    onUpdate: ({ editor }) => {
      if (isApplyingHighlights.current) return;
      
      const html = editor.getHTML();
      const currentText = editor.getText();
      const previousText = previousValue.current ? 
        new DOMParser().parseFromString(previousValue.current, 'text/html').body.textContent || '' : '';
      
      if (currentText !== previousText) {
        previousValue.current = html;
        // Mark this as an internal update (from typing)
        isInternalUpdate.current = true;
        onChange(html);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        const words = selectedText.trim().split(/\s+/).filter(w => w.length > 0).length;
        const chars = selectedText.length;
        setSelectionStats({ words, chars });
      } else {
        setSelectionStats({ words: 0, chars: 0 });
      }
    }
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // If this is an internal update (from typing), skip setContent
      // to avoid flashing and cursor jumping
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        previousValue.current = value;
        return;
      }
      
      // This is an external update (e.g., from highlights)
      // Save scroll position BEFORE any updates
      const scrollElement = editor.view.dom.closest('.ProseMirror');
      const savedScrollTop = scrollElement?.scrollTop || 0;
      
      // Save cursor position before updating content
      const { from, to } = editor.state.selection;
      const savedCursorPos = { from, to };
      
      // Update content
      editor.commands.setContent(value);
      previousValue.current = value;
      
      // Always restore cursor position to prevent it from jumping to the end
      // ProseMirror resets selection to end after setContent, so we must restore it
      setTimeout(() => {
        try {
          const docSize = editor.state.doc.content.size;
          
          // Handle empty document case
          if (docSize === 0) {
            editor.commands.setTextSelection({ from: 0, to: 0 });
            return;
          }
          
          // Clamp both endpoints to valid ProseMirror range [0, docSize]
          let clampedFrom = Math.max(0, Math.min(savedCursorPos.from, docSize));
          let clampedTo = Math.max(0, Math.min(savedCursorPos.to, docSize));
          
          // Ensure from <= to (preserve selection direction)
          if (clampedFrom > clampedTo) {
            [clampedFrom, clampedTo] = [clampedTo, clampedFrom];
          }
          
          // Restore selection with clamped positions
          editor.commands.setTextSelection({ 
            from: clampedFrom, 
            to: clampedTo 
          });
          
          // Restore scroll position to prevent unwanted scrolling
          requestAnimationFrame(() => {
            if (scrollElement) {
              scrollElement.scrollTop = savedScrollTop;
            }
          });
        } catch (e) {
          // If restoration fails, at least try to restore scroll position
          requestAnimationFrame(() => {
            if (scrollElement) {
              scrollElement.scrollTop = savedScrollTop;
            }
          });
        }
      }, 10);
    }
  }, [value, editor]);

  // Update highlights - force plugin to re-run with meta flag
  useEffect(() => {
    if (editor) {
      isApplyingHighlights.current = true;
      // Force the plugin to re-run by dispatching a transaction with meta flag
      const tr = editor.state.tr.setMeta('forceHighlightUpdate', true);
      editor.view.dispatch(tr);
      setTimeout(() => {
        isApplyingHighlights.current = false;
      }, 100);
    }
  }, [highlights, highlightedKeyword, editor]);

  // Scroll to text when scrollToText changes
  useEffect(() => {
    if (!editor || !scrollToText) return;

    const docText = editor.getText();
    const searchNormalized = normalizeForComparison(scrollToText);
    
    // Split into words for flexible matching
    const words = normalizeForSearch(scrollToText).split(' ').filter(w => w.length > 0);
    if (words.length === 0) return;

    // Build regex pattern with Arabic character variants
    const escapedWords = words.map(w => {
      const normalized = normalizeForComparison(w);
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      return escaped
        .replace(/ا/g, '[اأإآ]')
        .replace(/و/g, '[وؤ]')
        .replace(/ي/g, '[يئى]')
        .replace(/ه/g, '[هة]');
    });
    
    const regexPattern = escapedWords.join('[^\\u0600-\\u06FF\\s]*[\\s\\u060C\\u061B\\u061F]*[^\\u0600-\\u06FF\\s]*');
    const regex = new RegExp(regexPattern, 'i');

    // Find the first occurrence in the document
    let found = false;
    editor.state.doc.descendants((node, pos) => {
      if (found || !node.isTextblock) return false;
      
      const text = node.textContent;
      const match = text.match(regex);
      
      if (match && match.index !== undefined) {
        // Calculate the exact position
        const matchPos = pos + 1 + match.index;
        
        // Set cursor position without selecting text
        editor.chain()
          .focus()
          .setTextSelection(matchPos)
          .run();
        
        // Scroll to the position
        const { node: domNode } = editor.view.domAtPos(matchPos);
        if (domNode instanceof Element) {
          domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (domNode.parentElement) {
          domNode.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        found = true;
        return false;
      }
    });
  }, [scrollToText, editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor-wrapper" dir="rtl">
      <style>{`
        .tiptap-editor-wrapper {
          font-family: Tajawal, Cairo, "IBM Plex Sans Arabic", -apple-system, sans-serif;
          direction: ltr;
          padding: 0;
          margin: 0;
        }
        
        .tiptap-editor-wrapper .ProseMirror {
          font-family: Tajawal, Cairo, "IBM Plex Sans Arabic", -apple-system, sans-serif;
          font-size: 16px;
          direction: rtl;
          text-align: right;
          overflow-y: auto;
          max-height: calc(100vh - 250px);
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .tiptap-editor-wrapper .ProseMirror p {
          margin-right: 0 !important;
          margin-left: 0 !important;
        }
        
        .tiptap-editor-wrapper .ProseMirror h1,
        .tiptap-editor-wrapper .ProseMirror h2,
        .tiptap-editor-wrapper .ProseMirror h3,
        .tiptap-editor-wrapper .ProseMirror h4 {
          margin-right: 0 !important;
          margin-left: 0 !important;
        }
        
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar {
          width: 8px;
        }
        
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 4px;
        }
        
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        
        .tiptap-editor-wrapper .ProseMirror::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--foreground) / 0.3);
        }
        
        .tiptap-editor-wrapper .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
          line-height: 1.3;
          color: hsl(var(--foreground));
          border-bottom: 2px solid hsl(var(--border));
          padding-bottom: 0.3em;
        }
        
        .tiptap-editor-wrapper .ProseMirror h2 {
          font-size: 1.75em;
          font-weight: 700;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
          line-height: 1.3;
          color: hsl(var(--foreground));
          border-bottom: 1px solid hsl(var(--border));
          padding-bottom: 0.25em;
        }
        
        .tiptap-editor-wrapper .ProseMirror h3 {
          font-size: 1.5em;
          font-weight: 600;
          margin-top: 1em;
          margin-bottom: 1em;
          line-height: 1.3;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor-wrapper .ProseMirror h4 {
          font-size: 1.25em;
          font-weight: 600;
          margin-top: 1.33em;
          margin-bottom: 1.33em;
          line-height: 1.3;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor-wrapper .ProseMirror p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          line-height: 1.6;
          color: hsl(var(--foreground));
        }
        
        /* تحسين لون النص في الوضع المظلم لجعله أكثر وضوحاً */
        .dark .tiptap-editor-wrapper .ProseMirror p,
        .dark .tiptap-editor-wrapper .ProseMirror,
        .dark .tiptap-editor-wrapper .ProseMirror li {
          color: hsl(0 0% 95%);
        }
        
        .tiptap-editor-wrapper .ProseMirror ul,
        .tiptap-editor-wrapper .ProseMirror ol {
          padding-right: 2em;
          padding-left: 0;
          margin: 1em 0;
        }
        
        .tiptap-editor-wrapper .ProseMirror li {
          padding-right: 0.5em;
          padding-left: 0;
          margin-bottom: 0.5em;
          line-height: 1.6;
          color: hsl(var(--foreground));
        }
        
        .tiptap-editor-wrapper .highlight-mark {
          border-radius: 3px;
          padding: 2px 4px;
        }

        .tiptap-editor-wrapper .ProseMirror pre {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          font-family: 'JetBrainsMono', 'Courier New', monospace;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }

        .tiptap-editor-wrapper .ProseMirror pre code {
          background: none;
          padding: 0;
          font-size: 0.9em;
        }

        .tiptap-toolbar {
          direction: rtl;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          padding: 8px;
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--background));
        }

        .tiptap-toolbar-row {
          display: flex;
          align-items: center;
          gap: 4px;
          width: 100%;
        }

        .tiptap-toolbar button {
          padding: 6px 8px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .tiptap-toolbar button:hover {
          background: hsl(var(--muted));
        }

        .tiptap-toolbar button.is-active {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-color: hsl(var(--primary));
        }

        .tiptap-toolbar button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .tiptap-toolbar select {
          padding: 6px 8px;
          border: 1px solid hsl(var(--border));
          background: hsl(var(--background));
          border-radius: 4px;
          cursor: pointer;
          font-family: inherit;
          color: hsl(var(--foreground));
        }

        .tiptap-toolbar .toolbar-divider {
          width: 1px;
          height: 24px;
          background: hsl(var(--border));
          margin: 0 4px;
        }
      `}</style>

      <div className="relative">
        <div className="tiptap-toolbar">
          <div className="tiptap-toolbar-row">
            <select
              value={
                editor.isActive('heading', { level: 1 }) ? '1' :
                editor.isActive('heading', { level: 2 }) ? '2' :
                editor.isActive('heading', { level: 3 }) ? '3' :
                editor.isActive('heading', { level: 4 }) ? '4' : ''
              }
              onChange={(e) => {
                const level = e.target.value;
                const { from, to } = editor.state.selection;
                if (level) {
                  editor.chain().setHeading({ level: parseInt(level) as 1 | 2 | 3 | 4 }).setTextSelection({ from, to }).run();
                } else {
                  editor.chain().setParagraph().setTextSelection({ from, to }).run();
                }
              }}
              data-testid="select-heading"
            >
              <option value="">نص عادي</option>
              <option value="1">عنوان 1</option>
              <option value="2">عنوان 2</option>
              <option value="3">عنوان 3</option>
              <option value="4">عنوان 4</option>
            </select>

            <div className="toolbar-divider" />

            <button
              onClick={() => {
                const { from, to } = editor.state.selection;
                editor.chain().toggleOrderedList().setTextSelection({ from, to }).run();
              }}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
              data-testid="button-ordered-list"
              title="قائمة مرقمة"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const { from, to } = editor.state.selection;
                editor.chain().toggleBulletList().setTextSelection({ from, to }).run();
              }}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
              data-testid="button-bullet-list"
              title="قائمة نقطية"
            >
              <List className="w-4 h-4" />
            </button>

            <div className="toolbar-divider" />

            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
              data-testid="button-align-right"
              title="محاذاة لليمين"
            >
              <AlignRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
              data-testid="button-align-center"
              title="محاذاة للوسط"
            >
              <AlignCenter className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
              data-testid="button-align-left"
              title="محاذاة لليسار"
            >
              <AlignLeft className="w-4 h-4" />
            </button>

            <div className="toolbar-divider" />

            <button
              onClick={() => {
                const url = window.prompt('أدخل الرابط:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className={editor.isActive('link') ? 'is-active' : ''}
              data-testid="button-link"
              title="إضافة رابط"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'is-active' : ''}
              data-testid="button-code-block"
              title="كود"
            >
              <Code className="w-4 h-4" />
            </button>

            <div className="toolbar-divider" />

            <button
              onClick={() => {
                if (onClearHighlights) {
                  onClearHighlights();
                }
              }}
              data-testid="button-clear-highlights"
              title="إلغاء التمييز"
            >
              <Eraser className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                // Save cursor position
                const { from, to } = editor.state.selection;
                
                // Get and clean content
                const content = editor.getHTML();
                const cleaned = content
                  .replace(/<p>\s*<\/p>/g, '')
                  .replace(/<p><br\s*\/?><\/p>/gi, '')
                  .replace(/<p>[\s\u200B\u00A0]*<\/p>/g, '')
                  .replace(/(<\/[^>]+>)\s*\n\s*(<[^>]+>)/g, '$1$2');
                
                // Set cleaned content
                editor.commands.setContent(cleaned);
                
                // Restore cursor position
                setTimeout(() => {
                  const newDocSize = editor.state.doc.content.size;
                  const safeFrom = Math.min(from, newDocSize);
                  const safeTo = Math.min(to, newDocSize);
                  editor.commands.setTextSelection({ from: safeFrom, to: safeTo });
                }, 50);
              }}
              data-testid="button-remove-empty-lines"
              title="مسح الأسطر الفارغة"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="toolbar-divider" />

            <button
              onClick={() => {
                setSavedContent(editor.getHTML());
              }}
              data-testid="button-save"
              title="حفظ"
            >
              <Save className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (savedContent) {
                  editor.commands.setContent(savedContent);
                }
              }}
              data-testid="button-restore"
              title="استرداد"
              disabled={!savedContent}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="tiptap-toolbar-row">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              data-testid="button-bold"
              title="عريض"
            >
              <Bold className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              data-testid="button-italic"
              title="مائل"
            >
              <Italic className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'is-active' : ''}
              data-testid="button-underline"
              title="تحته خط"
            >
              <Underline className="w-4 h-4" />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''}
              data-testid="button-strike"
              title="يتوسطه خط"
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            <div style={{ marginRight: 'auto' }} className="flex items-center gap-4">
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
            </div>
          </div>
        </div>

        <div className="w-full" style={{ padding: 0, margin: 0 }}>
          <EditorContent editor={editor} className="w-full" style={{ padding: 0, margin: 0 }} />
        </div>
      </div>
    </div>
  );
}
