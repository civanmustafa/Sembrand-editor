# Arabic SEO Content Analysis Tool

## Overview

This project is a professional Arabic SEO content analysis tool designed to assist content writers in verifying compliance with specific SEO writing guidelines. It offers real-time analysis of Arabic content, checking keyword distribution, structural requirements, repeated phrases, and adherence to content writing standards. The tool is tailored for Arabic RTL (right-to-left) content, implementing Material Design 3 principles, and features a rich text editor with comprehensive formatting and an analysis dashboard for immediate feedback on content quality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 2025)

### UX Enhancements Batch
1. **Editor Scrollbar:** Repositioned to far left edge for RTL layout consistency
2. **Cursor Stability:** Preserved cursor position during highlight activation and text formatting operations
3. **Scroll Prevention:** Added preventDefault on highlight buttons to prevent unwanted card scrolling
4. **Auto-Navigation:** Clicking highlight icons scrolls editor to first match automatically
5. **Progress Animations:** Added gradient animations and smooth transitions to progress bars
6. **UI Refinement:** Removed redundant criteria icon from CategoryHeader, showing only "متوافق/مخالف" format
7. **Editor Utilities:** Added three toolbar buttons - clear highlights (manual), remove empty lines, save/restore content
8. **Visual Enhancement:** Gradient backgrounds (from-primary/10 via-accent/5 to-background) on dashboard cards
9. **Phrase Analysis:** Punctuation marks excluded from repeated phrase detection for accurate matching

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