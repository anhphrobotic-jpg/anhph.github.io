# Next.js Migration Guide

## 🎯 Overview

This project has been migrated from a static HTML/CSS/JavaScript website to a **Next.js 14 App Router** application with **Supabase** integration.

## ✅ Migration Status

- ✅ Next.js App Router structure created
- ✅ Supabase client/server setup
- ✅ API routes for notes management
- ✅ Static assets moved to `/public`
- ✅ Existing UI preserved at `/app`
- ✅ Demo notes page at `/notes`
- ⏳ Progressive migration of features to React

## 📁 Project Structure

```
/app                    # Next.js App Router
  /layout.tsx          # Root layout
  /page.tsx            # Home page
  /globals.css         # Global styles
  /notes               # Notes feature (Supabase demo)
    /page.tsx          # Server component
    /NotesClient.tsx   # Client component
  /app                 # Legacy static app
    /page.tsx          # Preserved UI
  /api                 # API routes
    /notes
      /route.ts        # REST API for notes

/utils
  /supabase
    /client.ts         # Browser client
    /server.ts         # Server client

/public                # Static assets
  /css                 # Stylesheets
  /js                  # JavaScript files
  /assets              # Images, icons
  /data                # JSON data
```

## 🚀 Quick Start

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment Variables

Create `.env.local` in the project root:

\`\`\`env
# Public (client-side) - safe to expose
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-side only
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
\`\`\`

**Get these values from Supabase Dashboard:**
- Project Settings → API
- Copy Project URL and anon/public key

### 3. Setup Supabase Database

Run this SQL in Supabase SQL Editor:

\`\`\`sql
-- Create notes table
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for public SELECT access
CREATE POLICY "Allow public read access"
ON notes FOR SELECT
TO anon
USING (true);

-- Create policy for public INSERT access
CREATE POLICY "Allow public insert access"
ON notes FOR INSERT
TO anon
WITH CHECK (true);
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

### 5. Test Features

- **Home**: http://localhost:3000
- **Notes (Supabase Demo)**: http://localhost:3000/notes
- **Legacy App**: http://localhost:3000/app

## 🔑 Key Files Explained

### Supabase Clients

**utils/supabase/client.ts** - Browser client
- Use in Client Components (`'use client'`)
- Uses `NEXT_PUBLIC_*` environment variables
- Subject to Row Level Security

**utils/supabase/server.ts** - Server client
- Use in Server Components (default)
- Use in API routes
- Uses server-side environment variables

### API Routes

**app/api/notes/route.ts**
- GET: Fetch all notes
- POST: Create new note
- Uses Supabase server client
- Returns JSON responses

### Pages

**app/notes/page.tsx** - Server Component
- Fetches data on server
- No client-side JavaScript needed for initial render
- Passes data to client component

**app/notes/NotesClient.tsx** - Client Component
- Handles interactivity
- Form submission
- Optimistic UI updates

## 🚢 Deployment to Vercel

### 1. Push to GitHub

\`\`\`bash
git add .
git commit -m "Migrate to Next.js with Supabase"
git push origin main
\`\`\`

### 2. Configure Vercel Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 3. Deploy

Vercel will automatically detect Next.js and deploy.

## 📝 Next Steps

### Phase 1: Database Schema (DONE)
- ✅ Create notes table
- ✅ Enable RLS
- ✅ Add public policies

### Phase 2: Core Features (TODO)
- [ ] Migrate projects management
- [ ] Migrate tasks management
- [ ] Migrate papers management
- [ ] Migrate whiteboards

### Phase 3: Advanced Features (TODO)
- [ ] User authentication (Supabase Auth)
- [ ] File uploads (Supabase Storage)
- [ ] Real-time updates (Supabase Realtime)
- [ ] Block-based editor
- [ ] PDF viewer integration

### Phase 4: Optimization (TODO)
- [ ] Server-side rendering
- [ ] Static generation where possible
- [ ] Image optimization
- [ ] Code splitting

## 🔐 Security Notes

- ✅ No hardcoded secrets
- ✅ Environment variables only
- ✅ Row Level Security enabled
- ✅ Anon key used (not service role)
- ⚠️ Add authentication before production
- ⚠️ Implement proper authorization

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env.local` exists
- Check variable names match exactly
- Restart dev server after changes

### Database connection errors
- Verify Supabase project is active
- Check API URL and key in Supabase dashboard
- Ensure table exists and RLS is configured

### Build errors
- Run `npm install` to ensure dependencies
- Delete `.next` folder and rebuild
- Check TypeScript errors: `npm run lint`

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Deployment](https://vercel.com/docs)

## 🎓 Learning Path

1. ✅ Understand App Router basics
2. ✅ Learn Server vs Client Components
3. ✅ Master Supabase integration
4. ⏳ Build authentication flow
5. ⏳ Implement real-time features
6. ⏳ Optimize for production
