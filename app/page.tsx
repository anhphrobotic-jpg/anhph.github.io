/**
 * Home Page - Server Component
 * 
 * This is a temporary landing page that redirects to the main app.
 * The actual app will be loaded via client-side JavaScript
 * to preserve existing functionality during migration.
 * 
 * TODO: Progressively migrate to server-rendered React components
 */

import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚀 Research Workspace - Next.js Migration</h1>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #0ea5e9' }}>
        <h2>✅ Migration Status</h2>
        <ul style={{ marginTop: '1rem' }}>
          <li>✅ Next.js App Router initialized</li>
          <li>✅ Supabase clients configured</li>
          <li>✅ API routes created</li>
          <li>✅ Static assets preserved</li>
          <li>⏳ UI migration in progress</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>Available Pages:</h3>
        <ul style={{ marginTop: '1rem' }}>
          <li>
            <Link href="/notes" style={{ color: '#0ea5e9', textDecoration: 'underline' }}>
              📝 Notes (Supabase Demo)
            </Link>
          </li>
          <li>
            <Link href="/app" style={{ color: '#0ea5e9', textDecoration: 'underline' }}>
              📚 Main App (Legacy UI)
            </Link>
          </li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
        <h3>⚠️ Next Steps</h3>
        <ol style={{ marginTop: '1rem' }}>
          <li>Configure .env.local with Supabase credentials</li>
          <li>Run: npm install</li>
          <li>Run: npm run dev</li>
          <li>Test /notes page with Supabase connection</li>
          <li>Progressively migrate existing features</li>
        </ol>
      </div>
    </div>
  )
}
