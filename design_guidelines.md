# تصميم أداة تحليل محتوى SEO العربي

## Design Approach
**Selected System**: Material Design 3 adapted for Arabic RTL interfaces
**Rationale**: This utility-focused SEO analysis tool requires clarity, data density, and professional presentation. Material Design's structured approach to information hierarchy and component systems perfectly suits the complex criteria checking, metrics display, and multi-tab interface needed for Arabic content analysis.

## Core Design Principles
1. **Data Clarity**: Information-dense layouts with clear visual hierarchy
2. **Status Communication**: Immediate visual feedback through color-coded states
3. **RTL Optimization**: Fully mirrored interface for Arabic reading flow
4. **Professional Aesthetic**: Clean, minimal design that emphasizes functionality

## Color Palette

### Dark Mode (Primary)
**Background Layers**:
- Base: 220 15% 8%
- Surface: 220 15% 12%
- Surface Variant: 220 12% 16%
- Elevated: 220 15% 18%

**Semantic Colors**:
- Success/Achieved: 142 76% 45% (for green highlighting & checkmarks)
- Warning/Close: 38 92% 55% (for yellow highlighting & near-achievement)
- Error/Violation: 0 84% 55% (for red highlighting & failures)
- Primary Action: 217 91% 60% (blue for interactive elements)
- Secondary Keywords: 48 96% 65% (bright yellow for secondary term highlighting)

**Text Colors**:
- Primary Text: 220 10% 95%
- Secondary Text: 220 8% 70%
- Disabled: 220 5% 45%

### Light Mode (Secondary)
- Base: 220 15% 98%
- Surface: 0 0% 100%
- Success: 142 71% 35%
- Warning: 38 92% 45%
- Error: 0 72% 45%
- Primary: 217 91% 50%

## Typography

### Arabic Font Stack
**Primary**: 'Tajawal', 'Cairo', 'IBM Plex Sans Arabic', system-ui, sans-serif
**Monospace** (for word counts/stats): 'IBM Plex Mono', 'Courier New', monospace

### Type Scale
- **Display** (Tab Headers): 28px/36px, weight 600
- **H1** (Section Titles): 24px/32px, weight 600
- **H2** (Criteria Categories): 20px/28px, weight 500
- **Body Large** (Content Text): 16px/24px, weight 400
- **Body** (Labels, Descriptions): 14px/20px, weight 400
- **Caption** (Helper Text, Counts): 12px/16px, weight 400
- **Code** (Stats, Numbers): 14px/20px, monospace, weight 500

## Layout System

**Container Strategy**:
- Max-width: 1400px for main content area
- Gutter padding: p-6 on desktop, p-4 on mobile
- Component spacing: Primarily use gap-4, gap-6, gap-8 for consistent rhythm

**Grid Structure**:
- Editor Panel: 60% width on desktop, full on mobile
- Analysis Sidebar: 40% width on desktop, tabs on mobile
- Criteria Cards: Full width stacked layout for better RTL readability

**Spacing Primitives**:
Primary units: 2, 4, 6, 8, 12, 16 (as in p-2, gap-4, mt-6, mb-8, px-12, py-16)

## Component Library

### Editor Interface
**Rich Text Editor**:
- Background: Surface Variant color
- Border: 1px solid with 10% white opacity
- Rounded corners: rounded-lg
- Padding: p-6
- Min-height: 500px on desktop
- Arabic text direction: RTL
- Line-height: 1.8 for readability

### Keyword Input System
**Main Keyword Input**:
- Label positioned above (RTL aligned)
- Input field with prominent border (2px Primary color)
- Click-to-highlight functionality indicated by cursor pointer
- Active state: ring-2 with Success color

**Secondary Keywords**:
- Tag-based interface with add/remove buttons
- Each tag clickable with Warning color background on hover
- Visual indicator showing highlight color (yellow dot)

### Analysis Tabs
**Tab Navigation**:
- Horizontal tabs on desktop, dropdown on mobile
- Active tab: bottom border 3px Primary color
- Badge indicators showing violation counts in Error color
- Icons from Heroicons for each tab (Document, ChartBar, etc.)

### Criteria Cards
**Structure**:
- Card background: Surface color
- Border-right: 4px status indicator (Success/Warning/Error)
- Padding: p-6
- Shadow: subtle elevation with shadow-sm

**Status Display**:
- Title (H2 typography) with inline status badge
- Current vs Required metrics in monospace
- Progress bar when applicable (rounded-full, h-2)
- Color-coded background overlay (5% opacity of status color)

### Repeated Phrases Section
**Phrase Groups**:
- Accordion-style collapsible sections for 2-word, 3-word, etc.
- Checkbox for bulk selection
- Individual phrase items with occurrence count badge
- "Select All" and "Clear Selection" action buttons per group

**Phrase Display**:
- Monospace font for phrase text
- Count badge: rounded-full px-3 py-1 with subtle background
- Hover state: background lightening effect

### Metric Display Components
**Word Count Widget**:
- Large number display: Display typography
- Label below in Caption size
- Circular progress indicator wrapping the count
- Color transitions: Red < 600, Yellow 600-799, Green ≥ 800

**Heading Analyzer**:
- Tree-view structure showing H2 → H3 → H4 hierarchy
- Indentation via pr-4 per level
- Line connectors using border-right pseudo-elements
- Violation highlighting with Error background

### Action Buttons
**Primary Actions**: 
- Filled buttons with Primary color, rounded-lg, px-6 py-3
- White text, subtle hover lift effect

**Secondary Actions**:
- Outline buttons with transparent background, border Primary
- Hover: background with 10% Primary opacity

**Icon Buttons** (for tag removal, etc.):
- Minimal style, rounded-full p-2
- Hover: background with 10% opacity

## Visual Feedback Patterns

### Highlighting System
- Main keyword: bg-success with 20% opacity, 500ms fade-in transition
- Secondary keywords: bg-warning with 25% opacity
- Smooth scrolling to highlighted terms on click

### Status Indicators
- Checkmark icon for achieved criteria (Success color)
- Warning triangle for close/near achievements (Warning color)  
- X icon for violations (Error color)
- All icons from Heroicons outline set

### Loading States
- Skeleton screens using Surface Variant backgrounds with pulse animation
- Inline spinners for action feedback (24px, Primary color)

## Accessibility & RTL Considerations

**RTL Implementation**:
- All layouts mirrored: flex-row-reverse, text-right as defaults
- Icons positioned on left (which is right in RTL)
- Progress bars fill from right to left
- Dropdown menus open aligned to right edge

**Color Contrast**:
- All text maintains WCAG AAA standards (7:1 minimum)
- Status colors tested against both light and dark backgrounds
- Focus rings: 2px offset with Primary color at 60% opacity

## Animations
**Minimal, Purposeful Only**:
- Tab switching: 200ms ease-in-out transition
- Highlight reveal: 300ms fade-in
- Card expansion: 250ms ease-out
- No decorative animations - focus on functional feedback

## No Images Required
This is a pure utility application - no hero images or decorative graphics needed. All visual interest comes from typography, color-coded statuses, and clean data presentation.