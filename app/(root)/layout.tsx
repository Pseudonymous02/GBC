'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { Inter, IBM_Plex_Serif } from 'next/font/google';
import '../globals.css';
import Sidebar from '@/components/ui/Sidebar';
import Header from '@/components/ui/Header';

const inter        = Inter({ subsets: ['latin'], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-ibm-plex-serif' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${ibmPlexSerif.variable} font-sans`}>
        <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">

          {/* ── Mobile overlay backdrop ── */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ── Sidebar ── */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* ── Main content ── */}
          <div className="flex flex-col flex-1 min-w-0 min-h-0 w-full">
           {/* Security Notice Banner */}
<div className="w-full flex items-center gap-3 px-4 py-2.5 z-[100]" style={{ backgroundColor: '#1c1917' }}>
  {/* Shield icon */}
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="#e6dc00" />
  </svg>

  {/* Label + message */}
  <div className="flex items-center gap-2 flex-1 min-w-0">
    <span className="text-[#e6dc00] text-[11px] font-semibold tracking-widest uppercase shrink-0">
      Secured
    </span>
    <span className="w-px h-3 bg-stone-600 shrink-0" />
    <span className="text-stone-300 text-xs truncate">
      No official representative will ever request your password, PIN, OTP, or card details.
    </span>
  </div>

  {/* Encryption badge */}
  <div className="flex items-center gap-1.5 shrink-0">
    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
    <span className="text-green-400 text-[11px] font-medium hidden sm:inline">256-bit encrypted</span>
  </div>
</div>
            <Header onMobileToggle={() => setSidebarOpen(o => !o)} />
            <main className="flex-1 w-full min-h-0 overflow-y-auto px-2 sm:px-4 md:px-8 py-4 md:py-8">
              {children}
            </main>
          </div>

        </div>
      </body>
    </html>
  );
}