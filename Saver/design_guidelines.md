# Design Guidelines: Game Save File Converter Tool

## Design Approach
**Selected Approach:** Design System with Developer Tool Aesthetic  
**Justification:** This is a utility-focused file conversion tool requiring clear information hierarchy, data readability, and functional efficiency. Drawing inspiration from developer tools like VS Code, GitHub's interface, and Linear's clean design patterns.

**Core Principles:**
- Clarity over decoration
- Immediate visual feedback for operations
- Professional, trustworthy appearance
- Data-first presentation

## Color Palette

**Dark Mode Primary:**
- Background: 220 15% 12%
- Surface: 220 15% 16%
- Surface Elevated: 220 15% 20%
- Border: 220 10% 25%

**Light Mode Primary:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Surface Elevated: 220 20% 97%
- Border: 220 10% 88%

**Accent & Status:**
- Primary Blue: 215 85% 55% (CTAs, active states)
- Success Green: 142 70% 45% (successful conversions)
- Warning Amber: 38 92% 50% (validation warnings)
- Error Red: 0 72% 55% (errors)
- Neutral Gray: 220 10% 60% (secondary text)

**Code/Data Display:**
- Syntax Background: 220 15% 18% (dark) / 220 20% 96% (light)
- Text Primary: 220 10% 95% (dark) / 220 15% 20% (light)
- Text Secondary: 220 8% 70% (dark) / 220 10% 50% (light)

## Typography

**Font Families:**
- UI Text: 'Inter', -apple-system, system-ui, sans-serif
- Code/Data: 'Fira Code', 'Monaco', 'Courier New', monospace

**Hierarchy:**
- Page Title: 2rem (32px), font-weight 700, tracking tight
- Section Headers: 1.25rem (20px), font-weight 600
- Body Text: 0.938rem (15px), font-weight 400
- Code/Data: 0.875rem (14px), font-weight 400, line-height 1.6
- Labels: 0.813rem (13px), font-weight 500, uppercase tracking

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 (p-2, gap-4, mb-6, px-8, py-12, mt-16, space-y-24)

**Grid Structure:**
- Container: max-w-7xl with px-6 lg:px-8
- Two-Column Layout: grid-cols-1 lg:grid-cols-2 gap-6
- Three-Column Stats: grid-cols-1 md:grid-cols-3 gap-4

## Component Library

**Header Section:**
- Full-width container with border-b
- Tool title + brief description
- No hero image (utility tool focus)
- Height: py-8 to py-12

**File Upload Zones:**
- Large dashed border dropzone (border-2 border-dashed)
- Drag-and-drop area with upload icon
- File name display after upload
- Clear visual distinction between "Old Format" and "New Format Template" upload areas
- States: default, hover, active, success

**Data Display Panels:**
- Card-based design with rounded borders (rounded-lg)
- Syntax-highlighted JSON viewer
- Collapsible sections for generators, upgrades, achievements
- Line numbers for code blocks
- Copy-to-clipboard buttons

**Conversion Controls:**
- Prominent "Convert" button (primary blue, large size)
- Secondary "Download" button (appears after conversion)
- "Clear All" reset button (ghost/outline variant)
- Operation status indicators

**Editable Template Section:**
- Monaco-style code editor appearance
- Syntax highlighting for JSON
- Line-by-line editing capability
- Save template button

**Side-by-Side Comparison:**
- Split view with vertical divider
- "Original" vs "Converted" labels
- Highlighted differences (subtle yellow background)
- Synchronized scrolling (optional)

**Stats Dashboard (within decoded data):**
- Grid of stat cards showing: Atoms count, Prestige points, Generator counts, Upgrade levels
- Number formatting with separators
- Scientific notation display for large numbers
- Icon placeholders for each stat type

**Footer:**
- Minimal footer with usage instructions link
- File format documentation
- Background color matches surface

## Visual Enhancements

**Transitions:** Fast, subtle (150-200ms duration)
**Shadows:** Minimal elevation (shadow-sm for cards, shadow-md for modals)
**Borders:** Consistent 1px borders, rounded corners (rounded-lg standard)
**Icons:** Heroicons outline style for UI actions
**Loading States:** Spinner + progress bar for file processing

## Images

**No Hero Image Required** - This is a utility tool where immediate functionality takes priority

**Icon Usage:**
- Upload icon in dropzones
- File type icons next to uploaded file names
- Status icons (checkmark, warning, error) for operations
- Copy icon for clipboard actions

## Interaction Patterns

- Instant visual feedback on file upload (success border color change)
- Animated conversion progress indicator
- Toast notifications for success/error states
- Disabled states for buttons when operations in progress
- Clear error messages with actionable guidance