# Arabic SEO Content Analysis Tool

## Overview

This is a professional Arabic SEO content analysis tool built to help content writers verify compliance with specific SEO writing guidelines. The application provides real-time analysis of Arabic content, checking keyword distribution, structural requirements, repeated phrases detection, and adherence to content writing standards.

The tool is designed specifically for Arabic RTL (right-to-left) content and implements Material Design 3 principles adapted for Arabic interfaces. It features a rich text editor with comprehensive formatting capabilities and an analysis dashboard that provides immediate feedback on content quality.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### October 15, 2025 - Structure Criteria Category & UI Refinements

**Structure Criteria Category**
- Created new "معايير الهيكل" (Structure Criteria) category with 5 criteria
- Moved word count, summary paragraph, second paragraph, and paragraph length to new category
- Added new "طول الجمل" (Sentence Length) criterion with 25-word maximum average
- Sentence length detection highlights sentences exceeding 25 words in red
- Category header shows aggregate violations with progress bar

**UI Compactness Improvements**
- Redesigned CriteriaCard with same-line "المطلوب/الحالي" (Required/Current) display
- Abbreviated labels: "المطلوب:" and "الحالي:" for space efficiency
- Removed tab text labels, showing icons only (FileText and Repeat icons)
- Increased spacing between Clear Highlights button and word/character count box
- Category icons positioned directly before titles with minimal gap

**Progress Bar Enhancements**
- Reversed progress bar fill direction for proper RTL alignment using transform
- Repeated Phrases progress bars now track reduction in total repetitions
- Progress starts empty (0%) and fills as repetitions are removed from content
- Display shows "{removed_repetitions} من {initial_repetitions} تكرار محذوف"
- Uses useRef to track initial repetition counts per category

**Bug Fixes**
- Fixed highlight cancellation bug by reordering setState calls in handleViolationClick
- Ensured setHighlights executes before clearing other states to prevent early returns

### October 15, 2025 - Enhanced Navigation & Violation Detection

**Smart Cursor Navigation**
- Company name highlighting now moves cursor only without scrolling the keyword input card
- Normal keywords (primary/sub) maintain full navigation with cursor movement and scrolling
- Enhanced handleKeywordClick with moveCursorOnly parameter for fine-grained control
- Improved user experience: company name stays visible in keyword card while cursor highlights occurrences

**Comprehensive Violation Highlighting**
- Added click-to-highlight for all heading violations (H2, H3, H4, H2-H3 gaps)
- Each violation criterion now highlights ALL violating instances simultaneously
- New violation extraction functions: violatingH2s, violatingH3s, violatingH4s, violatingGaps
- Enhanced CriteriaCard onClick handlers with proper parameter passing (shouldScroll, moveCursorOnly)

**Interrogative H2 Detection Enhancement**
- Real-time detection of interrogative H2 headings starting with question words
- Question words: ما، من، متى، أين، كيف، لماذا، هل، أليس، ألا، أم
- Criteria now requires headings to START with question words (not just contain them)
- More accurate validation aligned with SEO best practices

**Repeated Word Detection**
- Click-to-highlight for paragraphs containing repeated words
- Click-to-highlight for headings containing repeated words
- Visual feedback shows all instances with word repetitions
- Helps writers identify and fix redundant content

**Structural Improvements**
- Headings now properly excluded from "paragraph endings" validation
- Last H2 and conclusion paragraph criteria support cursor-only navigation with moveCursorOnly
- Enhanced handleViolationClick supports shouldScroll and moveCursorOnly for complex navigation scenarios

### October 15, 2025 - Latest UI/UX Enhancements

**Selection Statistics**
- Added word count and character count display for selected text in editor toolbar
- Real-time updates show statistics as user selects text
- Empty state message when no text is selected

**Multi-Violation Highlighting System**
- Fixed violation highlighting to mark ALL violating paragraphs instead of just first one
- System now supports highlighting multiple violations simultaneously
- Enhanced handleViolationClick to accept arrays of violations
- Improved user experience when clicking on criteria with multiple violations

**Category-Based Progress Indicators**
- Created new CategoryHeader component for Structure & Content tab
- Progress bars moved from individual criteria cards to category headers
- Category headers show aggregate violation counts across all criteria in category
- Visual design: gradient background with right-aligned emoji and RTL text layout
- Three main categories: "معايير العناوين والتسلسل", "معايير الجودة اللغوية والنحوية", "معايير الخاتمة"

**Repeated Phrases Progress Enhancement**
- Modified progress calculation to use total repetition counts instead of phrase counts
- Progress bars now show: "{highlighted_repetitions} من {total_repetitions} تكرار مميز"
- More accurate representation of highlighted content volume
- Helps users understand duplicate content impact

### October 15, 2025 - Advanced UI/UX Enhancements

**Category-Level Highlighting System**
- Added highlight toggle icons to each phrase category in Repeated Phrases tab
- Eye/EyeOff icons on the right side enable/disable highlighting for all phrases in category
- Removed global "Highlight All" button in favor of category-specific controls
- Maintained persistent color coding (10 distinct colors) for each phrase across editor

**RTL Editor Improvements**
- Completely redesigned toolbar alignment from left-to-right to right-to-left
- Integrated utility buttons (Clear Highlights, Remove Empty Lines) directly into editor toolbar
- Custom formatting buttons now properly aligned for Arabic content flow
- All editor controls follow consistent RTL visual hierarchy

**Statistics Dashboard Redesign**
- Removed "لوحة المعلومات" label for cleaner, more compact design
- Icons positioned on right side with RTL-aligned text (AlignLeft, Heading, List)
- Grid layout optimized for three-column statistics display
- Gradient background maintained for visual distinction

**Criteria Card Enhancements**
- Reduced card padding from p-6 to p-4 for more compact vertical layout
- Font sizes adjusted: title (text-lg to text-base), details (text-sm to text-xs)
- Added break-words to prevent text overflow in metrics
- Click-to-navigate functionality for violation criteria with auto-scroll to first occurrence

**Interactive Violation Navigation**
- Criteria titles become clickable for violation status items
- Clicking highlights and scrolls to first violation instance in editor
- Visual feedback with ring-2 ring-primary on active criteria
- Seamless integration with existing handleViolationClick mechanism

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query v5 for server state management

**UI Component System**
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom Material Design 3 color system
- RTL-first design with Arabic font stack (Tajawal, Cairo, IBM Plex Sans Arabic)
- Dark mode as primary theme with light mode support

**Text Editor**
- Slate.js framework for rich text editing
- Custom toolbar with Arabic-optimized formatting options
- Support for headings (H1-H4), lists, text formatting (bold, italic, underline)
- Real-time keyword highlighting and phrase detection

**Analysis Components**
- Three-tab analysis interface: Structure & Content, Keywords, Repeated Phrases
- Real-time content validation against SEO criteria
- Color-coded status indicators (success/warning/violation)
- Interactive keyword highlighting with click-to-locate functionality

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- RESTful API design pattern (routes prefixed with /api)
- Session-based architecture ready (connect-pg-simple for session store)

**Data Layer**
- Drizzle ORM configured for PostgreSQL
- Neon serverless PostgreSQL driver
- Schema-first approach with Zod validation
- In-memory storage fallback (MemStorage) for development

**Development Features**
- Hot module replacement via Vite middleware
- Custom error handling middleware
- Request/response logging
- Replit-specific development tools integration

### Design System

**Color Semantics**
- Success (Green): HSL 142 76% 45% - for achieved criteria
- Warning (Yellow): HSL 38 92% 55% - for near-achievement
- Error (Red): HSL 0 84% 55% - for violations
- Primary (Blue): HSL 217 91% 60% - for interactive elements
- Secondary Keywords (Bright Yellow): HSL 48 96% 65% - for highlighting

**Typography**
- Display level (28px/36px, weight 600) for tab headers
- H1 level (24px/32px, weight 600) for section titles
- Monospace font for word counts and statistics

### Content Analysis Logic

**Keyword Analysis Rules**
- Primary keyword: 0.7-0.9% density (7-9 occurrences per 1000 words)
- Secondary keywords: 0.1-0.2% density each
- Multi-keyword distribution formulas based on keyword count (2-6 keywords)
- Position checks: first paragraph, last paragraph, first heading, last heading
- Prohibition of primary and secondary keywords in same paragraph

**Structure Validation**
- Minimum 800 words (warning at 600+)
- First paragraph: 2-4 sentences (30-60 words)
- Second paragraph: 2-3 sentences (30-60 words)
- Standard paragraphs: 3-5 sentences (50-70 words each)
- H2/H3 hierarchy rules based on content length between headings

**Phrase Detection**
- Analysis of 2-8 word phrase repetitions
- Case-insensitive matching for Arabic text
- Interactive selection and highlighting
- Statistical summary of repetitions

## External Dependencies

### Third-Party UI Libraries
- Radix UI primitives (@radix-ui/*) - Accessible UI components
- Lucide React - Icon system
- CMDK - Command menu interface
- Slate.js ecosystem (slate, slate-react, slate-history) - Rich text editing

### Backend Services
- Neon PostgreSQL (@neondatabase/serverless) - Serverless database
- Drizzle ORM (drizzle-orm, drizzle-kit) - Database toolkit
- Connect-pg-simple - PostgreSQL session store

### Development Tools
- Replit-specific plugins for development experience
- Vite plugins for runtime error overlay and development banners
- ESBuild for server-side bundling

### Styling & Utilities
- Tailwind CSS with PostCSS
- Class Variance Authority (CVA) - Component variant management
- clsx & tailwind-merge - Utility class management
- date-fns - Date manipulation

### Form Management
- React Hook Form - Form state management
- @hookform/resolvers - Form validation resolvers
- Zod - Schema validation (used with drizzle-zod)

### HTTP & State
- TanStack React Query - Server state management
- Express.js - HTTP server framework
- Wouter - Lightweight routing