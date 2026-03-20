'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Mail, Phone, MapPin, Shield, Lock, Moon, Sun, Bell,
  CheckCircle, X, Edit3, Save, Eye, EyeOff, Copy,
  Download, Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_ACCOUNTS } from '@/constants';
import { formatAmountShort, cn } from '@/lib/utils';

interface UserData {
  name:   string;
  email:  string;
  phone?: string;
  city?:  string;
}

interface Tab { id: string; label: string; icon: React.ReactNode; }

const TABS: Tab[] = [
  { id: 'account',       label: 'Account',       icon: <User   className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell   className="w-4 h-4" /> },
  { id: 'security',      label: 'Security',      icon: <Shield className="w-4 h-4" /> },
  { id: 'appearance',    label: 'Appearance',    icon: <Moon   className="w-4 h-4" /> },
  { id: 'privacy',       label: 'Privacy',       icon: <Lock   className="w-4 h-4" /> },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user,              setUser]              = useState<UserData>({ name: '', email: '' });
  const [activeTab,         setActiveTab]         = useState('account');
  const [editing,           setEditing]           = useState(false);
  const [draft,             setDraft]             = useState<UserData>({ name: '', email: '' });
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, push: true, sound: true });
  const [darkMode,          setDarkMode]          = useState(false);
  const [mounted,           setMounted]           = useState(false);
  const [saved,             setSaved]             = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUser  = localStorage.getItem('user');
    const storedPrefs = localStorage.getItem('notificationPrefs');
    const storedDark  = localStorage.getItem('darkMode') === 'true';

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setDraft(parsed);
    } else {
      router.replace('/login');
    }

    if (storedPrefs) setNotificationPrefs(JSON.parse(storedPrefs));
    setDarkMode(storedDark);
    if (storedDark) document.documentElement.classList.add('dark');
  }, [router]);

  if (!mounted) return null;

  const initials = user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'US';

  const handleSave = () => {
    const updated = { ...user, ...draft };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  };

  const updateNotificationPrefs = (prefs: typeof notificationPrefs) => {
    setNotificationPrefs(prefs);
    localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
  };

  
  // ── Checkbox accent via CSS custom property ──
  const checkboxClass = 'w-5 h-5 rounded border-gray-300 accent-[#fff498] cursor-pointer';

  const renderTabContent = () => {
    switch (activeTab) {

      // ── Account ────────────────────────────────────────────────────────
      case 'account':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { label: 'Full Name',     key: 'name',  icon: <User   className="w-4 h-4" />, type: 'text'  },
                { label: 'Email Address', key: 'email', icon: <Mail   className="w-4 h-4" />, type: 'email' },
                { label: 'Phone Number',  key: 'phone', icon: <Phone  className="w-4 h-4" />, type: 'tel'   },
                { label: 'City',          key: 'city',  icon: <MapPin className="w-4 h-4" />, type: 'text'  },
              ].map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{field.label}</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{field.icon}</span>
                    <input
                      type={field.type}
                      value={(draft as unknown as Record<string, string>)[field.key] ?? ''}
                      disabled={!editing}
                      placeholder={editing ? `Update your ${field.label.toLowerCase()}` : '—'}
                      onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                      
                      className="w-full pl-11 pr-4 py-3 border rounded-2xl text-sm shadow-sm transition-all outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                      style={editing
                        ? { borderColor: '#e5e7eb', backgroundColor: '#fff',    color: '#1a1a1a' }
                        : { borderColor: '#f3f4f6', backgroundColor: '#f9fafb', color: '#374151', cursor: 'not-allowed' }
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              {editing ? (
                <>
                  <button onClick={() => { setEditing(false); setDraft(user); }} className="flex items-center gap-1.5 px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 flex-1 transition-colors">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={handleSave} className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-semibold shadow flex-1 transition-all" style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} className="w-full flex items-center justify-center gap-2 py-3 px-6 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        );

      // ── Notifications ──────────────────────────────────────────────────
      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', sub: 'Receive email summaries and alerts'  },
                { key: 'push',  label: 'Push Notifications',  sub: 'Real-time alerts on your devices'    },
                { key: 'sound', label: 'Sound Effects',       sub: 'Play sounds for new notifications'   },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={notificationPrefs[item.key as keyof typeof notificationPrefs]}
                    onChange={(e) => updateNotificationPrefs({ ...notificationPrefs, [item.key]: e.target.checked })}
                    className={checkboxClass}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.sub}</p>
                  </div>
                </label>
              ))}
            </div>
            <Link href="/notifications" className="w-full flex items-center justify-center gap-2 py-3 px-6 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all">
              <Bell className="w-4 h-4" /> View All Notifications
            </Link>
          </div>
        );

      // ── Security ───────────────────────────────────────────────────────
      case 'security':
        return (
          <div className="space-y-6">
            {/* 2FA Banner */}
            <div className="p-6 rounded-2xl border" style={{ backgroundColor: '#fffef0', borderColor: '#e6dc00' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fff498' }}>
                  <Shield className="w-5 h-5" style={{ color: '#1a1a1a' }} />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: '#1a1a1a' }}>2FA Not Enabled</h3>
                  <p className="text-sm text-gray-600">Add two-factor authentication for extra security</p>
                </div>
              </div>
              <button className="w-full py-3 px-6 rounded-xl font-semibold shadow transition-all text-sm" style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                Enable 2FA
              </button>
            </div>

            {/* Active session */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#16a34a' }}>
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold" style={{ color: '#16a34a' }}>Active Session</h4>
                    <p className="text-sm text-gray-600">Chrome · Windows · Your City</p>
                  </div>
                  <button className="p-1.5 hover:bg-green-100 rounded-lg transition-colors" style={{ color: '#16a34a' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 text-xs font-mono bg-gray-900 text-gray-400 rounded-xl border border-gray-800">
                <div className="flex items-center justify-between py-1">
                  <span>Session Token</span>
                  <button className="p-1 hover:bg-gray-800 rounded"><Copy className="w-3 h-3" /></button>
                </div>
                <div className="bg-gray-800 px-2 py-1 rounded text-[10px] truncate">g1k2h3j4...</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center py-3 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all group">
                <EyeOff className="w-5 h-5 text-gray-500 mb-1" />
                <span className="text-xs font-semibold text-gray-700">Clear Sessions</span>
              </button>
              <button className="flex flex-col items-center py-3 px-4 border border-red-200 rounded-xl hover:bg-red-50 transition-all text-red-600">
                <Trash2 className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Delete Account</span>
              </button>
            </div>
          </div>
        );

      // ── Appearance ─────────────────────────────────────────────────────
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
              <h3 className="font-bold text-lg text-gray-900 mb-4">Theme</h3>
              <div className="flex gap-4 p-4 bg-white rounded-xl border shadow-sm">
                {[
                  { label: 'Dark Mode',  active: darkMode,  icon: <Sun  className="w-6 h-6 mx-auto mb-2 text-gray-500" />, action: toggleDarkMode },
                  { label: 'Light Mode', active: !darkMode, icon: <Moon className="w-6 h-6 mx-auto mb-2 text-gray-500" />, action: () => { if (darkMode) toggleDarkMode(); } },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={opt.action}
                    className="flex-1 p-4 rounded-xl border-2 font-semibold transition-all text-sm"
                    style={opt.active
                      ? { borderColor: '#e6dc00', backgroundColor: '#fffef0', color: '#1a1a1a' }
                      : { borderColor: '#e5e7eb', color: '#374151' }
                    }
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Notification Style', options: ['Modern (Recommended)', 'Classic', 'Minimal'] },
                { label: 'App Language',        options: ['English (US)', 'Español', 'Français']        },
              ].map((sel) => (
                <div key={sel.label} className="bg-white p-5 rounded-xl border shadow-sm">
                  <h4 className="font-semibold mb-3 text-sm text-gray-800">{sel.label}</h4>
                  <select className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none transition-all">
                    {sel.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 py-4 px-8 border-2 border-dashed border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all">
              <Download className="w-4 h-4" /> Download Theme Data
            </button>
          </div>
        );

      // ── Privacy ────────────────────────────────────────────────────────
      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-gray-100 shadow-sm bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Export</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {['Transactions', 'Portfolio'].map((label) => (
                  <button key={label} className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-all h-24">
                    <Download className="w-6 h-6 text-gray-500 mb-2" />
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 text-center">Exports are CSV format and delivered within 24h</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-5">Privacy Settings</h3>
              {[
                { label: 'Share Anonymized Data',    sub: 'Help improve GCB (no personal info shared)' },
                { label: 'Receive Privacy Updates',  sub: 'Get notified of privacy policy changes'      },
              ].map((item) => (
                <label key={item.label} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl mb-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" className={checkboxClass} />
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.sub}</p>
                  </div>
                </label>
              ))}

              {/* Delete Account — kept red */}
              <div className="p-6 rounded-2xl text-center" style={{ backgroundColor: '#dc2626' }}>
                <Trash2 className="w-12 h-12 mx-auto mb-4 text-white opacity-75" />
                <h4 className="font-bold text-lg text-white mb-2">Delete Account</h4>
                <p className="text-sm text-white/80 mb-6">This action is permanent and cannot be undone</p>
                <button className="w-full bg-white/20 py-3 px-8 rounded-xl font-semibold text-white hover:bg-white/30 transition-all">
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-6 lg:space-y-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* ── Hero ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md shrink-0" style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1a1a1a' }}>Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account preferences and privacy settings</p>
                {saved && (
                  <motion.p initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-3 flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl font-semibold border" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>
                    <CheckCircle className="w-4 h-4" /> Settings saved successfully
                  </motion.p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">

            {/* ── Tab Nav ── */}
            <div className="lg:col-span-1 space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-4 rounded-xl transition-all border"
                    style={isActive
                      ? { backgroundColor: '#fff498', borderColor: '#e6dc00', color: '#1a1a1a', boxShadow: '0 2px 8px rgba(230,220,0,0.2)' }
                      : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#374151' }
                    }
                  >
                    <span
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                      style={isActive ? { backgroundColor: '#e6dc00' } : { backgroundColor: '#f3f4f6' }}
                    >
                      {tab.icon}
                    </span>
                    <span className="font-semibold text-sm text-left">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* ── Tab Content ── */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="min-h-[600px]"
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}