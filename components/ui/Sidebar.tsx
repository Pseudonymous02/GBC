'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { sidebarLinks } from '@/constants';
import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { LogOut, ChevronRight, X } from 'lucide-react';
import { cn, formatAmountShort, getStoredTransactions } from '@/lib/utils';
import type { Transaction } from '@/types';
import { MOCK_ACCOUNTS } from '@/constants';

function RecentTransactionsPreview() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  useEffect(() => {
    try {
      const stored = getStoredTransactions();
      const sorted = (stored ?? []).slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTxns(sorted.slice(0, 3));
    } catch {
      setTxns([]);
    }
  }, []);

  if (txns.length === 0) return <p className="text-xs text-muted-foreground px-2">No recent activity</p>;

  return (
    <ul className="space-y-2">
      {txns.map((tx) => (
        <li key={tx.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{tx.name}</p>
            <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
          </div>
          <div className={cn('text-sm font-bold ml-3', tx.amount < 0 ? 'text-destructive' : 'text-emerald-600')}>
            {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}
          </div>
        </li>
      ))}
    </ul>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}


const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = useState('Norita Miranda');
  const [userEmail, setUserEmail] = useState('john@example.com');
  const [mounted, setMounted] = useState(false);

  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUserName(parsed.name);
        if (parsed?.email) setUserEmail(parsed.email);
      }
    } catch { /* ignore */ }
  }, []);

  const initials = useMemo(
    () =>
      userName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    [userName]
  );

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const handleClose = () => onClose?.();

  const totalBalance = MOCK_ACCOUNTS.reduce((s, a) => s + (a.currentBalance ?? 0), 0);

  // Focus trap for mobile drawer when open
  useEffect(() => {
    const container = sidebarRef.current;
    if (!container) return;

    function getFocusableElements(el: HTMLElement | null) {
      if (!el) return [];
      return Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((e) => !e.hasAttribute('disabled') && e.getAttribute('aria-hidden') !== 'true');
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusableElements(sidebarRef.current);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // wait a tick and focus the first focusable element in the sidebar
      setTimeout(() => {
        const containerEl = sidebarRef.current;
        const focusable = getFocusableElements(containerEl);
        if (focusable.length) focusable[0].focus();
        else if (containerEl) containerEl.focus();
      }, 0);
      document.addEventListener('keydown', handleKeyDown);
      // prevent body scroll when drawer open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // restore previous focus
      if (previouslyFocusedRef.current instanceof HTMLElement) previouslyFocusedRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 md:hidden",
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={handleClose}
        aria-hidden={isOpen ? 'false' : 'true'}
      />

      <aside
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? 'true' : undefined}
        aria-hidden={isOpen ? 'false' : 'true'}
        tabIndex={-1}
        className={cn(
          'flex flex-col shadow-2xl',
          // FIX 1: w-[min(288px,80vw)] caps the drawer at 80% of viewport width on very small screens
          // FIX 2: z-[60] ensures the open drawer renders above any dropdown/popover using z-50
          'fixed inset-y-0 left-0 z-[60] md:z-auto md:static md:inset-auto md:shadow-none',
          'w-[min(288px,80vw)] md:w-72 bg-card border-r border-border transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div ref={sidebarRef} className="flex flex-col h-full">
          <div className="p-4 sm:p-5 md:p-6 gap-5 lg:gap-6 overflow-y-auto -webkit-overflow-scrolling-touch flex-1 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50 md:border-none">
            <Link
              href="/"
              className="flex items-center gap-3 group p-2 rounded-xl hover:bg-accent transition-colors btn-focus"
              onClick={handleClose}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-md ring-1 ring-border/50 overflow-hidden shrink-0 group-hover:shadow-lg transition-all">
                <Image
                  src="/icons/logo.png"
                  alt="GCB logo"
                  width={22}
                  height={22}
                  className="drop-shadow-md"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground font-ibm-plex-serif hidden md:block">
                GCB
              </span>
            </Link>

            <button
              onClick={handleClose}
              aria-label="Close sidebar"
              className="md:hidden p-2 rounded-xl hover:bg-accent focus:bg-accent transition-all btn-focus"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Portfolio Snapshot */}
          <div className={cn(
            "mx-1 p-4 rounded-2xl shadow-md ring-1 ring-border/50 overflow-hidden transition-all md:hover:shadow-xl",
            "bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20"
          )}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1.5 text-foreground/70">
              Portfolio Value
            </p>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {mounted ? formatAmountShort(totalBalance) : '—'}
            </p>
            <p className="text-xs mt-1 text-muted-foreground">
              {MOCK_ACCOUNTS.length} account{MOCK_ACCOUNTS.length !== 1 ? 's' : ''} connected
            </p>
          </div>



          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1 min-h-0 overflow-y-auto -webkit-overflow-scrolling-touch">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-2 pb-2 hidden md:block">
              Navigation
            </p>
            {sidebarLinks.map((link) => {
              const isActive =
                pathname === link.route ||
                (link.route !== '/' && pathname.startsWith(link.route));

              return (
                <Link
                  key={link.label}
                  href={link.route}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 btn-focus relative overflow-hidden',
                    // FIX: justify-start always in the drawer — labels are always visible here
                    'justify-start hover:bg-accent hover:shadow-md hover:shadow-accent/10',
                    isActive && 'bg-accent/50 shadow-md shadow-accent/20 ring-2 ring-accent/30'
                  )}
                  onClick={handleClose}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all shadow-sm ring-1 ring-border/50 overflow-hidden",
                    isActive
                      ? "bg-brand shadow-brand/20 ring-brand/30"
                      : "bg-muted hover:bg-accent/20 group-hover:shadow-md"
                  )}>
                    <Image
                      src={link.imgURL}
                      alt={link.label}
                      width={18}
                      height={18}
                      className={cn(
                        'transition-all w-5 h-5',
                        isActive ? 'opacity-100 drop-shadow-md' : 'opacity-70 group-hover:opacity-90'
                      )}
                    />
                  </div>

                  {/* Labels always shown in the drawer — the drawer is always full-width */}
                  <span className={cn(
                    "text-sm font-semibold flex-1 min-w-0 truncate",
                    isActive ? "text-foreground font-bold" : "text-foreground/80"
                  )}>
                    {link.label}
                  </span>

                  {isActive && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand rounded-full shadow-lg" />
                  )}

                  <ChevronRight className={cn(
                    "w-4 h-4 shrink-0 opacity-0 group-hover:opacity-70 transition-all",
                    isActive && "opacity-100 text-brand"
                  )} />
                </Link>
              );
            })}
          </nav>

          {/* Profile Footer */}
          <div className="border-t border-border/50 pt-4 space-y-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent focus:bg-accent transition-all btn-focus group"
              onClick={handleClose}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-border/50 overflow-hidden bg-brand text-brand-text shrink-0">
                {mounted ? initials : ''}
              </div>
              {/* Always show name/email in the drawer */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate leading-tight">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/5 focus:bg-destructive/5 transition-all btn-focus group text-destructive"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0 transition-colors group-hover:bg-destructive/20">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold flex-1 text-left">Sign out</span>
            </button>
          </div>


          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
