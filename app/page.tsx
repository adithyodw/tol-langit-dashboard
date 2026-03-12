'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#001233',
      }}
    >
      <div style={{ textAlign: 'center', color: '#ffffff' }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '56px',
            fontWeight: 500,
            marginBottom: '16px',
            color: '#d4b254',
          }}
        >
          TOL LANGIT Capital
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: '#8a8a8a',
            marginTop: '20px',
            marginBottom: '40px',
          }}
        >
          Institutional Trading Analytics Platform
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b7280',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#b89a3e',
              animation: 'pulse 2s infinite',
            }}
          />
          Initializing Platform...
        </div>
        <p
          style={{
            fontSize: '12px',
            color: '#2a3f6a',
            marginTop: '60px',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          Next.js 14 | PostgreSQL | Institutional Analytics Engine
        </p>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </main>
  );
}

