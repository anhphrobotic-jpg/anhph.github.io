# 🚀 Research Workspace - Next.js + Supabase Migration

**Status**: ✅ Migration Complete - Ready for Development

A Notion-like research management system built with Next.js App Router and Supabase.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Deployment](#deployment)
- [Migration Guide](#migration-guide)

## ✨ Features

### Current (Migrated)
- ✅ Next.js 14 App Router architecture
- ✅ Supabase PostgreSQL integration
- ✅ Server-side rendering (SSR)
- ✅ API routes for backend logic
- ✅ Notes management (demo feature)
- ✅ Preserved legacy UI during migration
- ✅ TypeScript support

### Coming Soon
- ⏳ Project management
- ⏳ Task tracking
- ⏳ Paper organization
- ⏳ Whiteboard collaboration
- ⏳ User authentication
- ⏳ File uploads (PDFs)
- ⏳ Block-based editor
- ⏳ Real-time collaboration

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Language**: TypeScript
- **Styling**: CSS (existing styles preserved)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Git

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/anhphrobotic-jpg/anhph2.github.io.git
cd anhph2.github.io
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment

Create \`.env.local\`:

\`\`\`env
# Get these from Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. Setup Database

Run in Supabase SQL Editor:

\`\`\`sql
-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow public access (temporary - add auth later)
CREATE POLICY "Public read" ON notes FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert" ON notes FOR INSERT TO anon WITH CHECK (true);
\`\`\`

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   ├── notes/               # Notes feature
│   │   ├── page.tsx         # Server component
│   │   └── NotesClient.tsx  # Client component
│   ├── app/                 # Legacy UI (preserved)
│   │   └── page.tsx
│   └── api/                 # API routes
│       └── notes/
│           └── route.ts     # REST API
├── utils/
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       └── server.ts        # Server Supabase client
├── public/                  # Static assets
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── data/
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.local (create this)
\`\`\`

## 💻 Development

### Available Scripts

\`\`\`bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
\`\`\`

### Key Concepts

#### Server Components (Default)
\`\`\`tsx
// app/notes/page.tsx
export default async function NotesPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('notes').select('*')
  return <div>{/* Render */}</div>
}
\`\`\`

#### Client Components (Interactive)
\`\`\`tsx
'use client'
import { useState } from 'react'

export default function NotesClient() {
  const [notes, setNotes] = useState([])
  // Handle user interactions
}
\`\`\`

#### API Routes (Backend)
\`\`\`ts
// app/api/notes/route.ts
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('notes').select('*')
  return NextResponse.json({ notes: data })
}
\`\`\`

### Adding New Features

1. **Create Database Table** in Supabase
2. **Add API Route** in `app/api/[feature]/route.ts`
3. **Create Server Component** for initial data fetch
4. **Add Client Component** for interactivity
5. **Update Navigation** in existing UI

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**

\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push
\`\`\`

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com/)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Deploy**
   - Vercel deploys automatically on every push
   - Production URL: `https://your-project.vercel.app`

### Environment Variables in Vercel

Add these in Vercel Dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📖 Migration Guide

See [NEXTJS_MIGRATION.md](./NEXTJS_MIGRATION.md) for detailed migration documentation.

### Migration Progress

- ✅ **Phase 1**: Next.js setup
- ✅ **Phase 2**: Supabase integration
- ✅ **Phase 3**: Basic CRUD operations
- ⏳ **Phase 4**: Feature migration
- ⏳ **Phase 5**: Authentication
- ⏳ **Phase 6**: Advanced features

## 🔐 Security

- ✅ Environment variables (no hardcoded secrets)
- ✅ Row Level Security (RLS) enabled
- ✅ Anon key used (not service role)
- ⚠️ **TODO**: Add user authentication
- ⚠️ **TODO**: Implement proper authorization
- ⚠️ **TODO**: Add rate limiting

## 🐛 Troubleshooting

### "Module not found" errors
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Supabase connection issues
- Verify environment variables in `.env.local`
- Check Supabase project is active
- Ensure RLS policies are configured

### Build failures
\`\`\`bash
rm -rf .next
npm run build
\`\`\`

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vercel Deployment](https://vercel.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - feel free to use this project however you want!

## 🎯 Roadmap

### Q1 2026
- [ ] Complete feature migration from static site
- [ ] Implement user authentication
- [ ] Add file upload support

### Q2 2026
- [ ] Real-time collaboration
- [ ] Advanced search functionality
- [ ] Mobile app (React Native)

### Q3 2026
- [ ] AI-powered features
- [ ] Team workspaces
- [ ] API for third-party integrations

---

**Built with ❤️ using Next.js and Supabase**
