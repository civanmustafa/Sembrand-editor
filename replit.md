# Arabic SEO Content Analysis Tool

## Overview

This project is a professional Arabic SEO content analysis tool designed to assist content writers in verifying compliance with specific SEO writing guidelines. It offers real-time analysis of Arabic content, checking keyword distribution, structural requirements, repeated phrases, and adherence to content writing standards. The tool is tailored for Arabic RTL (right-to-left) content, implementing Material Design 3 principles, and features a rich text editor with comprehensive formatting and an analysis dashboard for immediate feedback on content quality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 2025)

### UX Enhancements Batch 1 (October 17, 2025)
1. **Editor Scrollbar:** Repositioned to far left edge for RTL layout consistency
2. **Cursor Stability:** Preserved cursor position during highlight activation and text formatting operations
3. **Scroll Prevention:** Added preventDefault on highlight buttons to prevent unwanted card scrolling
4. **Auto-Navigation:** Clicking highlight icons scrolls editor to first match automatically
5. **Progress Animations:** Added gradient animations and smooth transitions to progress bars
6. **UI Refinement:** Removed redundant criteria icon from CategoryHeader, showing only "متوافق/مخالف" format
7. **Editor Utilities:** Added three toolbar buttons - clear highlights (manual), remove empty lines, save/restore content
8. **Visual Enhancement:** Gradient backgrounds (from-primary/10 via-accent/5 to-background) on dashboard cards
9. **Phrase Analysis:** Punctuation marks excluded from repeated phrase detection for accurate matching
10. **Editor Alignment Fix:** Removed all padding from ProseMirror editor - Arabic text now starts from absolute right edge
11. **Cursor Preservation:** Implemented cursor position save/restore during highlight updates to prevent jumping to end
12. **Metrics Layout:** "المطلوب" and "الحالي" now display in single line with bullet separator (•) in criteria cards
13. **Progress Bar Consistency:** Added animate-pulse effect to structure/content progress bars to match repeated phrases tab

### UX Enhancements Batch 2 (October 17, 2025)
14. **Auto-Scroll Prevention:** Fixed unwanted scroll-to-end behavior when editing - scroll position now preserved during all content updates
15. **Full-Width Editor:** Removed Card padding to allow editor to span full width from right edge to left edge when window is maximized
16. **Empty Lines Cleanup:** Enhanced "remove empty lines" button to properly clean all empty paragraphs, line breaks, and whitespace
17. **Punctuation-Insensitive Phrases:** Updated phrase detection to ignore all punctuation marks (Arabic & English) for accurate repeated phrase matching
18. **Category Highlight Glow:** Added visual feedback when all phrases in a category are highlighted - card gets ring-2 border and shadow-lg glow
19. **Icon Highlight Effect:** Highlight icon in category header glows with ring and scale animation when all phrases are selected

### UX Enhancements Batch 3 (October 17, 2025)
20. **Editor Spacing:** Increased ProseMirror editor padding from 0 to 1.5rem on all sides for better text readability and visual comfort
21. **Toolbar Reorganization:** Restructured toolbar into two distinct rows - top row contains additional tools (lists, alignment, links, code, utilities), bottom row contains basic formatting (Normal/H1-H4 heading buttons, bold, italic, underline, strikethrough)
22. **Heading Controls:** Extracted heading dropdown into individual buttons (Normal, H1, H2, H3, H4) displayed prominently in the bottom toolbar row for easier access
23. **Keyword Statistics:** Added real-time keyword statistics display below input fields with color-coded badges - green (#22c55e) for primary keyword, orange (#f97316) for sub-keywords, blue (#3b82f6) for company name
24. **Highlight Colors:** Customized company name highlight color from red to blue (#3b82f6) for better visual distinction from violations
25. **Criteria Labels:** Simplified criteria card labels from "المطلوب/الحالي" to "مطلوب/حالي" with increased font size (text-xs instead of text-[10px]) for better readability

### UX Enhancements Batch 4 (October 17, 2025)
26. **Repeated Phrases Scroll Fix:** Added `e.preventDefault()` in category highlight toggle to prevent unwanted scrolling when clicking highlight icon
27. **Batch Category Highlighting:** Enhanced category highlight to toggle all phrases in category simultaneously instead of one-by-one
28. **Duplicate Phrase Detection Fix:** Unified text normalization pipeline using shared `cleanText` function to eliminate punctuation-induced duplicates in repeated phrase detection
29. **Selection Stats Repositioning:** Moved word/character selection counter from bottom toolbar row to top toolbar row on the right side for better visibility
30. **Compact Criteria Metrics:** Replaced verbose labels "مطلوب" and "حالي" with concise symbols (✓ for required, → for current, ← for separator) in Structure & Content tab criteria cards

### Sub-Keyword Analysis Improvements (October 18, 2025)
31. **Enhanced Sub-Keyword Criteria Display:** Added clearer requirement section with descriptive header "الشروط المطلوبة" and dynamic status messages that reflect actual analysis state
32. **Conditional Status Messages:** Implemented conditional text for H2 heading presence - shows exact count when found ("موجودة في X عناوين H2") or clear absence message when not found ("غير موجودة في أي عنوان H2 - مطلوب عنوان واحد على الأقل")
33. **Reorganized Statistics Layout:** Grouped related metrics together - percentage requirements with actual percentage, separated by border, followed by word count requirements with actual count
34. **Responsive Keywords Panel:** Implemented responsive width for keywords panel - 22% on lg screens (≥1024px) for balanced layout, expanding to 25% on xl screens (≥1280px) for enhanced readability without compromising editor space

## System Architecture

### Frontend Architecture

**Framework & Build System:** React 18 with TypeScript, Vite, Wouter for routing, and TanStack Query v5 for server state management.

**UI Component System:** Shadcn/ui built on Radix UI, Tailwind CSS with custom Material Design 3 color system, RTL-first design with Arabic font stack (Tajawal, Cairo, IBM Plex Sans Arabic), and dark mode as primary theme.

**Text Editor:** Tiptap editor (replaced React Quill) with custom RTL extension for Arabic support, custom highlight decoration plugin using ProseMirror Decorations, and comprehensive formatting capabilities including headings, lists, text alignment, and rich text styles. It supports real-time keyword highlighting with block-level text processing, phrase detection across formatted text nodes, and normalized Arabic character matching including punctuation support. The editor features scrollbar positioned at far left for RTL layout, cursor position preservation during formatting and highlighting operations, auto-scroll to first match functionality, and utility buttons for content management (clear highlights, remove empty lines, save/restore content).

**Analysis Components:** A three-tab analysis interface (Structure & Content, Keywords, Repeated Phrases) providing real-time content validation against SEO criteria, color-coded status indicators, and interactive highlighting with click-to-locate functionality. Features include smart cursor navigation, comprehensive violation highlighting, category-based progress indicators with gradient animations, scroll-prevention on highlight buttons, and streamlined CategoryHeader showing only "متوافق/مخالف" counts without redundant criteria icon. Gradient backgrounds enhance visual hierarchy in dashboard cards.

### Backend Architecture

**Server Framework:** Express.js with TypeScript, following a RESTful API design pattern.

**Data Layer:** Drizzle ORM configured for PostgreSQL, utilizing Neon serverless PostgreSQL driver, with a schema-first approach and Zod validation. In-memory storage (MemStorage) is available for development.

### Design System

**Color Semantics:** Green for success, yellow for warning, red for errors/violations, blue for primary interactive elements, and bright yellow for secondary keyword highlighting.

**Typography:** Defined display and heading levels, with a monospace font for statistics.

### Content Analysis Logic

**Keyword Analysis Rules:** Enforces density percentages for primary and secondary keywords, position checks within content and headings, and prohibition of primary/secondary keywords in the same paragraph.

**Structure Validation:** Criteria for minimum word count, sentence and paragraph length guidelines, and H2/H3 heading hierarchy rules.

**Phrase Detection:** Analyzes 2-8 word phrase repetitions, with case-insensitive matching for Arabic text and punctuation-insensitive normalization, interactive selection, highlighting, and statistical summaries. Progress bars track repetition reduction with smooth transitions.

## External Dependencies

### Third-Party UI Libraries
- Radix UI primitives (`@radix-ui/*`)
- Lucide React
- Tiptap ecosystem (`@tiptap/*`)
- Shadcn/ui

### Backend Services
- Neon PostgreSQL (`@neondatabase/serverless`)
- Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- Connect-pg-simple

### Development Tools
- Vite plugins
- ESBuild

### Styling & Utilities
- Tailwind CSS
- Class Variance Authority (CVA)
- `clsx` & `tailwind-merge`
- `date-fns`

### Form Management
- React Hook Form
- `@hookform/resolvers`
- Zod

### HTTP & State
- TanStack React Query
- Express.js
- Wouter