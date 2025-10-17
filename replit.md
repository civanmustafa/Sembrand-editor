# Arabic SEO Content Analysis Tool

## Overview

This project is a professional Arabic SEO content analysis tool designed to assist content writers in verifying compliance with specific SEO writing guidelines. It offers real-time analysis of Arabic content, checking keyword distribution, structural requirements, repeated phrases, and adherence to content writing standards. The tool is tailored for Arabic RTL (right-to-left) content, implementing Material Design 3 principles, and features a rich text editor with comprehensive formatting and an analysis dashboard for immediate feedback on content quality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:** React 18 with TypeScript, Vite, Wouter for routing, and TanStack Query v5 for server state management.

**UI Component System:** Shadcn/ui built on Radix UI, Tailwind CSS with custom Material Design 3 color system, RTL-first design with Arabic font stack (Tajawal, Cairo, IBM Plex Sans Arabic), and dark mode as primary theme.

**Text Editor:** Tiptap editor (replaced React Quill) with custom RTL extension for Arabic support, custom highlight decoration plugin using ProseMirror Decorations, and comprehensive formatting capabilities including headings, lists, text alignment, and rich text styles. It supports real-time keyword highlighting with block-level text processing, phrase detection across formatted text nodes, and normalized Arabic character matching including punctuation support.

**Analysis Components:** A three-tab analysis interface (Structure & Content, Keywords, Repeated Phrases) providing real-time content validation against SEO criteria, color-coded status indicators, and interactive highlighting with click-to-locate functionality. Features include smart cursor navigation, comprehensive violation highlighting, and category-based progress indicators.

### Backend Architecture

**Server Framework:** Express.js with TypeScript, following a RESTful API design pattern.

**Data Layer:** Drizzle ORM configured for PostgreSQL, utilizing Neon serverless PostgreSQL driver, with a schema-first approach and Zod validation. In-memory storage (MemStorage) is available for development.

### Design System

**Color Semantics:** Green for success, yellow for warning, red for errors/violations, blue for primary interactive elements, and bright yellow for secondary keyword highlighting.

**Typography:** Defined display and heading levels, with a monospace font for statistics.

### Content Analysis Logic

**Keyword Analysis Rules:** Enforces density percentages for primary and secondary keywords, position checks within content and headings, and prohibition of primary/secondary keywords in the same paragraph.

**Structure Validation:** Criteria for minimum word count, sentence and paragraph length guidelines, and H2/H3 heading hierarchy rules.

**Phrase Detection:** Analyzes 2-8 word phrase repetitions, with case-insensitive matching for Arabic text, interactive selection, highlighting, and statistical summaries.

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