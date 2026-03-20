'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Bell, Search, Sun, Moon, Menu, X, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MOCK_TRANSACTIONS } from '@/constants';

interface HeaderProps {
  onMobileToggle?: () => void;
}

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Transfer Complete', body: '$28,500 salary deposit received.', time: '2m ago', read: false, type: 'success' },
  { id: 2, title: 'Pending Investment', body: '$500,000 investment transfer pending.', time: '1h ago', read: false, type: 'warning' },
  { id: 3, title: 'Apple Dividend Received', body: '$44,000 dividend deposited to portfolio.', time: '3h ago', read: true, type: 'success' },
  { id: 4, title: 'Bank Fee Charged', body: '$12 monthly maintenance fee applied.', time: '1d ago', read: true, type: 'info' },
];

export default function Header({ onMobileToggle }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [userName, setUserName] = useState('Norita Miranda');

  const router = useRouter();
  const pathname = usePathname();

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  // FIX 4: ref on the whole search container, not just the input
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // FIX 2: read localStorage only after mount; separate redirect from data loading
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUserName(parsed.name);
      }
    } catch { /* ignore */ }
  }, []);

  // FIX 2: redirect in a separate effect so it doesn't re-run on every pathname change
  // and doesn't fire before mount (which would cause SSR issues)
  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem('user');
    if (!stored && pathname !== '/login') {
      router.replace('/login');
    }
  }, [mounted, pathname, router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      // FIX 4: check the whole search container so clicking results doesn't dismiss early
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDarkMode = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = notifications.filter((n) => !n.read).length;

  const searchResults = searchQuery.trim().length > 1
    ? MOCK_TRANSACTIONS.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const initials = userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  // FIX 1: render a structural skeleton instead of null to avoid hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-card/95 border-b border-border/50 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-sm h-[57px]">
        <div className="flex-1 max-w-md h-9 bg-muted/50 rounded-xl animate-pulse" />
        <div className="flex items-center gap-2 ml-4">
          <div className="w-9 h-9 bg-muted/50 rounded-xl animate-pulse" />
          <div className="w-9 h-9 bg-muted/50 rounded-xl animate-pulse" />
          <div className="w-28 h-9 bg-muted/50 rounded-xl animate-pulse hidden sm:block" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-xl supports-[backdrop-filter:blur(20px)]:bg-card/95 border-b border-border/50 px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shadow-sm">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onMobileToggle && (
          <button
            onClick={() => {
              // close any open dropdowns before toggling the sidebar on mobile
              setShowNotifs(false);
              setShowProfile(false);
              setSearchFocused(false);
              onMobileToggle();
            }}
            aria-label="Toggle mobile menu"
            className="sm:hidden p-2.5 rounded-xl hover:bg-accent hover:text-foreground transition-all btn-focus shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* FIX 4: ref moved to the container div so click-outside check covers the dropdown too */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-md sm:max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none flex-shrink-0" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            className="w-full pl-10 sm:pl-11 pr-10 py-2.5 bg-muted/50 border border-input rounded-xl text-sm placeholder:text-muted-foreground focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-2 focus-visible:outline-none transition-all btn-focus flex-1 min-w-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search dropdown */}
          {searchFocused && searchQuery.trim().length > 1 && (
            // FIX 3: z-[51] so dropdowns sit above the z-50 header
            <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-card border border-border rounded-2xl shadow-xl ring-1 ring-border/50 overflow-hidden z-[70] max-h-80 overflow-y-auto scroll-smooth-touch">
              {searchResults.length > 0 ? (
                <>
                  <div className="px-3 py-2.5 border-b border-border/50 bg-muted/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {searchResults.map((txn) => (
                    <Link
                      key={txn.id}
                      href="/transaction-history"
                      className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground transition-colors btn-focus first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => { setSearchQuery(''); setSearchFocused(false); }}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{txn.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{txn.category} · {txn.date}</p>
                      </div>
                      <span className={cn(
                        'text-sm font-bold ml-4 shrink-0 px-2 py-0.5 rounded-full',
                        txn.amount < 0 ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-600'
                      )}>
                        {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </>
              ) : (
                <div className="p-8 sm:p-10 text-center">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm font-semibold text-foreground mb-1">No transactions found</p>
                  <p className="text-xs text-muted-foreground">Try a different search term</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* FIX 5: show Sun in dark mode, Moon in light mode — clear iconography */}
        <button
          onClick={toggleDarkMode}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2.5 rounded-xl hover:bg-accent focus:bg-accent transition-all btn-focus group"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifs((v) => !v); setShowProfile(false); }}
            aria-label="Notifications"
            aria-expanded={showNotifs}
            className="relative p-2.5 rounded-xl hover:bg-accent focus:bg-accent transition-all btn-focus group"
          >
            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs font-bold flex items-center justify-center ring-2 ring-background shadow-md">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            // FIX 3: z-[51] so this renders above the z-50 header
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl ring-1 ring-border/50 overflow-hidden z-[70] max-h-[425px] flex flex-col">
              <div className="flex items-center justify-between p-4 sm:px-5 border-b border-border/50 bg-muted/50">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-lg transition-colors btn-focus"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border scroll-smooth-touch">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3.5 p-4 sm:px-5 py-3.5 hover:bg-accent transition-colors cursor-pointer relative",
                      !n.read && "bg-accent/50 border-l-4 border-primary"
                    )}
                    onClick={() => setNotifications((prev) =>
                      prev.map((x) => x.id === n.id ? { ...x, read: true } : x)
                    )}
                  >
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      {
                        'bg-emerald-500': n.type === 'success',
                        'bg-amber-500':   n.type === 'warning',
                        'bg-sky-500':     n.type === 'info',
                        'bg-destructive': n.type === 'error',
                      }
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-semibold text-sm leading-5', n.read ? 'text-muted-foreground' : 'text-foreground')}>
                        {n.title}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-1">{n.body}</p>
                      <p className="text-xs text-muted-foreground/80 mt-2">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 sm:px-4 border-t border-border/50 bg-muted/50">
                <Link
                  href="/notifications"
                  className="flex items-center justify-center text-xs font-semibold text-primary hover:text-primary/90 py-2 px-3 rounded-xl hover:bg-accent/50 transition-all btn-focus w-full"
                  onClick={() => setShowNotifs(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotifs(false); }}
            aria-label="User menu"
            aria-expanded={showProfile}
            className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-xl hover:bg-accent focus:bg-accent transition-all btn-focus group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md ring-2 ring-background/50 overflow-hidden bg-gradient-to-br from-primary to-primary/80">
              <span className="text-primary-foreground font-bold text-xs tracking-tight">
                {initials}
              </span>
            </div>
            <span className="text-sm font-semibold text-foreground truncate max-w-[120px] hidden sm:block">
              {userName.split(' ')[0]}
            </span>
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0',
              showProfile && 'rotate-180'
            )} />
          </button>

          {showProfile && (
            // FIX 3: z-[51] so this renders above the z-50 header
            <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-card border border-border rounded-2xl shadow-2xl ring-1 ring-border/50 overflow-hidden z-[70]">
              <div className="px-4 py-4 border-b border-border/50 bg-gradient-to-r from-muted to-background">
                <p className="text-sm font-bold text-foreground truncate">{userName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Premium Investor</p>
              </div>

              {[
                { icon: User,     label: 'Profile',  href: '/profile'  },
                { icon: Settings, label: 'Settings', href: '/settings' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setShowProfile(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent hover:text-foreground transition-all btn-focus"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <div className="border-t border-border/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/5 transition-all btn-focus"
                >
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}