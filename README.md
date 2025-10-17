# Code Collab - Real-time Collaborative Code Editor

A production-grade, real-time collaborative code editor built with React, TypeScript, Monaco Editor, and Supabase. Features beautiful handcrafted UI with organic animations and seamless real-time collaboration.

## 🚀 Features

### Core Functionality
- **Monaco Editor Integration**: Full-featured code editor with syntax highlighting, IntelliSense, and language support
- **Real-time Collaboration**: Live cursor tracking, code synchronization, and participant presence
- **Multi-language Support**: JavaScript, TypeScript, Python, C++, HTML, CSS, and more
- **File Management**: Create, edit, rename, and delete files with automatic language detection
- **Live Preview**: Real-time HTML/CSS/JS preview
- **Integrated Terminal**: Built-in terminal for code execution

### UI/UX Design
- **Handcrafted Theme**: Deep slate grays with warm terracotta and teal accents
- **Typography**: Work Sans for UI, Fira Code with ligatures for code
- **Organic Animations**: Framer Motion powered micro-interactions
- **Asymmetrical Layout**: Off-center editor with collapsible docks
- **Accessibility**: Proper focus management and keyboard navigation

### Real-time Features
- **Participant Tracking**: See who's online with unique color coding
- **Cursor Synchronization**: Live cursor positions across users
- **Code Broadcasting**: Real-time code changes with conflict resolution
- **Chat Integration**: Built-in messaging 
- **Presence Awareness**: Online/away status indicators

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **Monaco Editor** for code editing
- **Framer Motion** for animations
- **Supabase** for real-time collaboration

### Design System
The project uses a comprehensive design system with:
- HSL-based color tokens for consistent theming
- Semantic spacing and typography scales
- Custom component variants with proper accessibility
- Organic micro-animations and transitions

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for real-time features)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd inkwell-code
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🎨 Design System

### Color Palette
- **Background**: Deep slate grays (`hsl(215 25% 8%)`)
- **Primary Accent**: Desaturated teal (`hsl(179 58% 42%)`)
- **Secondary Accent**: Warm terracotta (`hsl(15 55% 58%)`)
- **Surfaces**: Layered slate grays for depth

### Typography
- **UI Font**: Work Sans (300-700 weights)
- **Code Font**: Fira Code with ligatures enabled
- **Semantic sizing**: CSS custom properties for consistency

### Components
All components follow the design system with:
- Consistent spacing using CSS custom properties
- Semantic color tokens instead of hardcoded values
- Proper accessibility with focus management
- Organic animations with spring physics

## 🔌 Real-time Collaboration

The editor uses Supabase Realtime for seamless collaboration:

### Presence System
- Tracks online participants with unique colors
- Shows live cursor positions across users
- Automatic presence updates on join/leave

### Code Synchronization
- Real-time code broadcasting with conflict resolution
- Operation-based transformation for consistency
- Automatic reconnection handling

### Room Management
- Dynamic room creation and joining
- Participant limits and permissions
- Persistent room state

## 📁 Project Structure

```
src/
├── components/
│   ├── docks/           # Collapsible panels (chat, preview, terminal)
│   ├── editor/          # Monaco editor integration
│   ├── icons/           # Hand-drawn SVG icons
│   ├── layout/          # Layout components
│   └── ui/              # Reusable UI components
├── hooks/
│   └── use-realtime-collaboration.ts  # Real-time collaboration logic
├── types/
│   └── collaboration.ts # TypeScript definitions
├── utils/
│   ├── file-manager.ts  # File operations and management
│   └── monaco-themes.ts # Custom editor themes
└── integrations/
    └── supabase/        # Supabase client and types
```

## 🚢 Deployment

### Frontend (Vercel)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Backend (Supabase)
1. Set up Supabase project
2. Configure realtime settings
3. Set up database tables (if needed)

## 🔧 Configuration

### Monaco Editor
Custom themes matching the design system:
- Dark theme with teal accents and terracotta strings
- Proper syntax highlighting for all supported languages
- Font ligature support with Fira Code

### Tailwind CSS
Extended configuration with:
- Custom color system using HSL tokens
- Semantic spacing and typography scales
- Animation utilities for organic motion
- Component-specific utilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the existing code style and design system
4. Test your changes thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Monaco Editor team for the excellent code editor
- Supabase for real-time infrastructure
- Work Sans and Fira Code font families
- Framer Motion for smooth animations
