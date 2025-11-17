# Atom Idle Game Save File Converter

## Overview

This is a web-based tool for converting and editing save files from the Atom Idle game. The application allows users to upload hex-encoded save files, decode them to JSON format, view and edit the game data, and export modified save files. The tool is designed as a utility with a developer-tool aesthetic, prioritizing clarity, data readability, and functional efficiency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- Built with React 18+ and TypeScript
- Vite as the build tool and development server
- Client-side only routing using Wouter
- All application logic runs in the browser without server-side data processing

**UI Component Strategy**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system
- Component variants using class-variance-authority (CVA)
- Design system follows a "developer tool aesthetic" with focus on data presentation

**Design System Decisions**
- Dark mode as default with light mode support via theme toggle
- Custom CSS variables for consistent theming across light/dark modes
- Monospace fonts (Fira Code) for code/data display
- Elevation system using semi-transparent overlays (`--elevate-1`, `--elevate-2`)
- Semantic color tokens for different data states (success, warning, error)

**State Management**
- React Query (@tanstack/react-query) for async state
- Local React state for component-level state
- No global state management library (Redux, Zustand, etc.)
- File processing and conversion happens entirely client-side

**Key Application Flow**
1. User uploads hex-encoded or JSON save file
2. File content decoded from hex to JSON (if needed)
3. Data displayed in read-only viewer and editable JSON editor
4. Stats extracted and displayed in dedicated cards
5. Modified data re-encoded to hex and exported as new save file

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- Development server integrates with Vite for HMR
- Production mode serves pre-built static assets
- Minimal backend logic - primarily serves as asset server

**API Design**
- RESTful endpoint structure under `/api` prefix
- Currently uses in-memory storage (MemStorage class)
- Prepared for database integration but not actively used
- Session management prepared (connect-pg-simple) but not implemented

**File Processing**
- All save file encoding/decoding happens client-side
- Hex encoding/decoding uses browser Buffer API
- No server-side file processing or storage
- Files are processed entirely in browser memory

### Data Storage

**Database Setup**
- Drizzle ORM configured for PostgreSQL
- Schema defined but minimal (users table only)
- Database not actively used in current application flow
- Migration system in place via drizzle-kit

**Storage Interface**
- IStorage interface defines CRUD contract
- MemStorage implementation for development
- Can be swapped for database-backed storage without changing business logic
- User authentication prepared but not implemented

**Data Model**
- Game save data structure: atoms, prestigePoints, generators (array), upgrades (array)
- Save files stored as hex-encoded JSON strings
- No persistent storage of user data currently

### Design System Architecture

**Theme Implementation**
- CSS custom properties for all color tokens
- Automatic dark/light mode switching
- Theme state persisted in localStorage
- Design guidelines documented in design_guidelines.md

**Component Composition**
- Atomic design pattern: primitive UI components composed into features
- Consistent elevation and border treatments across components
- Responsive design with mobile breakpoint at 768px
- Accessibility built-in via Radix UI primitives

**Typography System**
- Inter for UI text
- Fira Code for code and data display
- Defined hierarchy: page titles (32px), sections (20px), body (15px), code (14px)
- Tracking and weight variations for visual hierarchy

## External Dependencies

### Core Framework Dependencies
- **React 18+** - Frontend UI framework
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight client-side routing
- **TypeScript** - Type safety across entire codebase

### UI Component Libraries
- **Radix UI** - Headless accessible component primitives (dialogs, dropdowns, tabs, etc.)
- **shadcn/ui** - Pre-styled component collection built on Radix
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend Framework
- **Express.js** - Web server framework
- **Drizzle ORM** - TypeScript ORM for database operations
- **@neondatabase/serverless** - Neon Postgres serverless driver

### State & Data Management
- **TanStack Query (React Query)** - Async state management and caching
- **React Hook Form** - Form state and validation
- **Zod** - Schema validation and type inference

### Development Tools
- **@replit/vite-plugin-runtime-error-modal** - Development error overlay
- **@replit/vite-plugin-cartographer** - Replit-specific tooling
- **tsx** - TypeScript execution for Node.js

### Styling & Theming
- **class-variance-authority** - Type-safe component variant management
- **tailwind-merge** - Utility for merging Tailwind classes
- **clsx** - Conditional className composition

### Database & Sessions
- **PostgreSQL** - Relational database (configured but not actively used)
- **connect-pg-simple** - PostgreSQL session store for Express (prepared but not implemented)

### Build & Deployment
- **esbuild** - Server-side code bundling for production
- **PostCSS** - CSS processing with Tailwind
- **Autoprefixer** - CSS vendor prefixing