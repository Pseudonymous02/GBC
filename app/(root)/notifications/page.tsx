'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell, CheckCircle, X, ChevronRight, Filter, Mail, Smartphone, Volume2,
  Trash2, Edit3, TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_ACCOUNTS } from '@/constants';
import { formatAmountShort } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'success' | 'warning' | 'info' | 'error';
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1,  title: 'Transfer Complete',      body: '$28,500 salary deposit received to High Yield Portfolio.',    time: '2m ago',  read: false, type: 'success' },
  { id: 2,  title: 'Pending Investment',      body: '$500K transfer to new investment fund pending approval.',     time: '1h ago',  read: false, type: 'warning' },
  { id: 3,  title: 'Apple Dividend',          body: '$44K quarterly dividend deposited automatically.',            time: '3h ago',  read: true,  type: 'success' },
  { id: 4,  title: 'Bank Fee Applied',        body: '$12 monthly maintenance fee deducted.',                       time: '1d ago',  read: true,  type: 'info'    },
  { id: 5,  title: 'New Account Connected',   body: 'Premium Investment Account ****8888 linked successfully.',   time: '2d ago',  read: true,  type: 'success' },
  { id: 6,  title: 'Security Alert',          body: 'New device logged in from new location.',                     time: '3d ago',  read: false, type: 'warning' },
  { id: 7,  title: 'Rental Income',           body: '$11.5K quarterly rental payment received.',                   time: '5d ago',  read: true,  type: 'success' },
  { id: 8,  title: 'Tax Reminder',            body: 'Q1 2026 estimated taxes due in 14 days.',                     time: '1w ago',  read: false, type: 'warning' },
  { id: 9,  title: 'Portfolio Rebalance',     body: 'Automatic rebalancing completed per strategy.',               time: '2w ago',  read: true,  type: 'info'    },
  { id: 10, title: 'Etihad Dividend',         body: '$65K dividend from Etihad investment received.',              time: '3w ago',  read: true,  type: 'success' },
  { id: 11, title: 'Crypto Alert',            body: 'BTC position +12% - consider taking profits?',               time: '1mo ago', read: false, type: 'warning' },
  { id: 12, title: 'App Update',              body: 'GCB Mobile v2.3.1 now available with new charts.',           time: '1mo ago', read: true,  type: 'info'    },
];

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [user, setUser] = useState({ name: '', email: '' });
  const [filters, setFilters] = useState({ read: 'all', type: 'all' });
  const [prefs, setPrefs] = useState({ email: true, push: true, sound: true });
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // FIX 2: wrapped in try/catch so malformed localStorage JSON doesn't crash the page
    try {
      const stored = localStorage.getItem('user');
      if (!stored) {
        router.replace('/login');
        return;
      }
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  // FIX 1: render a structural skeleton instead of null to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex-1 min-h-screen p-6 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'UN';

  const unreadCount = notifications.filter(n => !n.read).length;
  const typeCounts = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredNotifications = notifications.filter(n => {
    // FIX 3: was inverted — n.read !== (filters.read === 'unread') kept the wrong set
    if (filters.read === 'unread' && n.read) return false;
    if (filters.read === 'read' && !n.read) return false;
    if (filters.type !== 'all' && n.type !== filters.type) return false;
    return true;
  });

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const toggleRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));

  const deleteNotification = (id: number) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  // FIX 4: wired up clear-all-read handler
  const clearAllRead = () =>
    setNotifications(prev => prev.filter(n => !n.read));

  const updatePrefs = () => {
    try {
      localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
    } catch { /* ignore */ }
    setEditingPrefs(false);
  };

  // FIX 5: all stats now use consistent Tailwind class strings — no mixing of inline style and className
  const NOTIFICATION_STATS = [
    {
      label: 'Unread',
      value: unreadCount.toString(),
      color: 'text-gray-900',
      bg: 'bg-yellow-50',
      icon: <Bell className="w-4 h-4 text-gray-900" />,
    },
    {
      label: 'Total',
      value: notifications.length.toString(),
      color: 'text-gray-900',
      bg: 'bg-yellow-50',
      icon: <Bell className="w-4 h-4 text-gray-900" />,
    },
    {
      label: 'Success',
      value: (typeCounts.success ?? 0).toString(),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
    },
    {
      label: 'Warnings',
      value: (typeCounts.warning ?? 0).toString(),
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      icon: <Bell className="w-4 h-4 text-orange-600" />,
    },
  ];

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Hero Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md shrink-0 bg-yellow-100 text-gray-900">
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-500 text-sm mt-0.5">{unreadCount} unread · {notifications.length} total</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors bg-yellow-100 text-gray-900 hover:bg-yellow-200"
                >
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {NOTIFICATION_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
              >
                {/* FIX 5: bg and color are now consistent Tailwind classes on all stats */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{stat.label}</p>
                  <p className={cn("text-lg font-bold", stat.color)}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Notifications List */}
            <div className="lg:col-span-2 space-y-4">

              {/* Filters */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-2">
                <select
                  value={filters.read}
                  onChange={(e) => setFilters({ ...filters, read: e.target.value })}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="success">Success</option>
                  <option value="warning">Warnings</option>
                  <option value="info">Info</option>
                  <option value="error">Errors</option>
                </select>
                <div className="flex-1" />
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900">
                  <Filter className="w-3.5 h-3.5" /> Filters
                </button>
              </div>

              {/* List */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto" ref={containerRef}>
                  {filteredNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={cn(
                        "flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                        !notification.read && "bg-amber-50/50 border-r-4 border-amber-400"
                      )}
                      onClick={() => toggleRead(notification.id)}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notification.type === 'success' ? 'bg-emerald-400' :
                        notification.type === 'warning' ? 'bg-amber-400' :
                        notification.type === 'error'   ? 'bg-red-400'    : 'bg-blue-400'
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={cn(
                            "font-semibold text-sm",
                            notification.read ? "text-gray-500" : "text-gray-900"
                          )}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full shrink-0 mt-1 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-2">{notification.body}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          {notification.time}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                            className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                          </button>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {filteredNotifications.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold">No notifications match your filters</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters above</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Panel */}
            <div className="space-y-4">

              {/* Preferences */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-4 h-4" /> Preferences
                </h3>
                {editingPrefs ? (
                  <div className="space-y-3">
                    {[
                      { key: 'email', label: 'Email notifications' },
                      { key: 'push',  label: 'Push notifications'  },
                      { key: 'sound', label: 'Sound alerts'        },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prefs[key as keyof typeof prefs]}
                          onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                    <div className="flex gap-2 pt-2">
                      <button onClick={updatePrefs} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl text-sm font-semibold shadow-sm transition-colors">
                        Save
                      </button>
                      <button onClick={() => setEditingPrefs(false)} className="flex-1 border border-gray-200 py-2 px-4 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { icon: <Mail      className="w-4 h-4 text-blue-500" />, label: 'Email', on: prefs.email },
                      { icon: <Smartphone className="w-4 h-4 text-blue-500" />, label: 'Push',  on: prefs.push  },
                      { icon: <Volume2   className="w-4 h-4 text-blue-500" />, label: 'Sound', on: prefs.sound },
                    ].map(({ icon, label, on }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 flex items-center gap-2">{icon}{label}</span>
                        <span className={cn("w-3 h-3 rounded-full", on ? "bg-emerald-400" : "bg-gray-200")} />
                      </div>
                    ))}
                    <button
                      onClick={() => setEditingPrefs(true)}
                      className="w-full flex items-center gap-2 py-2 px-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Preferences
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/settings" className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 group transition-colors">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Notification Settings</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                  </Link>
                  {/* FIX 4: wired up onClick so button actually clears read notifications */}
                  <button
                    onClick={clearAllRead}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 group transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Clear All Read</span>
                    <CheckCircle className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-600" />
                  </button>
                </div>
              </div>

              {/* Account Snapshot */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-amber-100 p-5">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-amber-900">
                  <TrendingUp className="w-4 h-4" /> Portfolio
                </h3>
                <div className="space-y-2">
                  {MOCK_ACCOUNTS.slice(0, 2).map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-2.5 bg-white/60 backdrop-blur-sm rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-amber-900 truncate">{acc.name}</p>
                        <p className="text-[10px] text-amber-700">{acc.mask}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">
                        {formatAmountShort(acc.currentBalance ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}