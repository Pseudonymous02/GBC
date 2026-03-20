'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Shield, LogOut, Mail, Phone, MapPin,
  CreditCard, TrendingUp, Bell, ChevronRight,
  CheckCircle, Edit3, Save, X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from '@/constants';
import { formatAmountShort, summarizeTransactions } from '@/lib/utils';

interface UserData {
  name:   string;
  email:  string;
  phone?: string;
  city?:  string;
}

const QUICK_LINKS = [
  { label: 'Dashboard',           href: '/'                    },
  { label: 'My Banks',            href: '/my-banks'            },
  { label: 'Transaction History', href: '/transaction-history' },
  { label: 'Transfer Funds',      href: '/payment-transfer'    },
];

export default function ProfilePage() {
  const router = useRouter();

  const [user,    setUser]    = useState<UserData>({ name: '', email: '' });
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState<UserData>({ name: '', email: '' });
  const [saved,   setSaved]   = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('user');
      if (!stored) { router.replace('/login'); return; }
      const parsed: UserData = JSON.parse(stored);
      setUser(parsed);
      setDraft(parsed);
    } catch {
      router.replace('/login');
    }
  }, [router]);

  if (!mounted) return null;

  const initials = user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const totalBalance = MOCK_ACCOUNTS.reduce((s, a) => s + (a.currentBalance ?? 0), 0);
  const { totalDeposits, totalWithdrawals } = summarizeTransactions(MOCK_TRANSACTIONS);

  const handleSave = () => {
    const updated = { ...user, ...draft };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.replace('/login');
  };

  const STATS = [
    { label: 'Portfolio Value', value: formatAmountShort(totalBalance),     icon: <TrendingUp className="w-4 h-4" />, iconColor: '#1a1a1a', bg: '#fffef0', textColor: '#1a1a1a' },
    { label: 'Total Deposits',  value: formatAmountShort(totalDeposits),    icon: <CreditCard className="w-4 h-4" />, iconColor: '#16a34a', bg: '#f0fdf4', textColor: '#16a34a' },
    { label: 'Withdrawals',     value: formatAmountShort(totalWithdrawals), icon: <CreditCard className="w-4 h-4" />, iconColor: '#dc2626', bg: '#fff5f5', textColor: '#dc2626' },
    { label: 'Transactions',    value: MOCK_TRANSACTIONS.length.toString(), icon: <Bell       className="w-4 h-4" />, iconColor: '#1a1a1a', bg: '#fffef0', textColor: '#1a1a1a' },
  ];

  return (
    <div className="flex-1 min-h-screen bg-[#f5f6fa]">
      {/* <Header /> */}

      <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

          {/* ── Hero Card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">

              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md shrink-0" style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                {initials}
              </div>

              {/* Name + email */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#1a1a1a' }}>{user.name || 'User'}</h1>
                <p className="text-gray-500 text-sm mt-0.5">{user.email || '—'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
                    <CheckCircle className="w-3 h-3" /> Verified Account
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border" style={{ backgroundColor: '#fffef0', color: '#1a1a1a', borderColor: '#e6dc00' }}>
                    Premium Investor
                  </span>
                </div>
              </div>

              {/* Edit / Save buttons */}
              <div className="flex gap-2 shrink-0">
                {editing ? (
                  <>
                    <button onClick={() => { setEditing(false); setDraft(user); }} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors" style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {saved && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-sm flex items-center gap-1.5 font-semibold" style={{ color: '#16a34a' }}>
                <CheckCircle className="w-4 h-4" /> Profile updated successfully.
              </motion.p>
            )}
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bg, color: stat.iconColor }}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{stat.label}</p>
                  <p className="text-base font-bold" style={{ color: stat.textColor }}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Main Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left */}
            <div className="lg:col-span-2 space-y-6">

              {/* Personal Info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">Personal Information</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Full Name',     key: 'name',  icon: <User   className="w-4 h-4" />, type: 'text'  },
                    { label: 'Email Address', key: 'email', icon: <Mail   className="w-4 h-4" />, type: 'email' },
                    { label: 'Phone Number',  key: 'phone', icon: <Phone  className="w-4 h-4" />, type: 'tel'   },
                    { label: 'City',          key: 'city',  icon: <MapPin className="w-4 h-4" />, type: 'text'  },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{field.label}</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{field.icon}</span>
                        <input
                          type={field.type}
                          value={draft[field.key as keyof UserData] ?? ''}
                          readOnly={!editing}
                          placeholder={editing ? `Enter your ${field.label.toLowerCase()}` : '—'}
                          onChange={(e) => setDraft((d) => ({ ...d, [field.key]: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm transition-all outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100"
                          style={editing
                            ? { borderColor: '#e5e7eb', backgroundColor: '#fff',    color: '#1a1a1a' }
                            : { borderColor: '#f3f4f6', backgroundColor: '#f9fafb', color: '#374151', cursor: 'default' }
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">Security</h2>
                <div className="space-y-3">
                  {[
                    { icon: <Shield className="w-4 h-4" style={{ color: '#16a34a' }} />, bg: '#f0fdf4', title: 'Two-Factor Authentication', sub: 'Enabled — your account is protected',      action: 'Manage'  },
                    { icon: <Shield className="w-4 h-4" style={{ color: '#e6dc00' }} />, bg: '#fffef0', title: '256-bit Encryption',         sub: 'All data encrypted at rest & in transit', action: 'Details' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.bg }}>{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{item.sub}</p>
                      </div>
                      <button className="text-xs font-semibold shrink-0" style={{ color: '#e6dc00' }}>{item.action}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-4">

              {/* Quick Links */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Quick Navigation</h3>
                <div className="space-y-1">
                  {QUICK_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{link.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Connected Accounts</h3>
                <div className="space-y-2">
                  {MOCK_ACCOUNTS.map((acc) => (
                    <div key={acc.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#fff498' }}>
                        <CreditCard className="w-3.5 h-3.5" style={{ color: '#1a1a1a' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 truncate">{acc.name}</p>
                        <p className="text-[10px] text-gray-400">{acc.mask}</p>
                      </div>
                      <span className="text-xs font-bold shrink-0" style={{ color: '#16a34a' }}>
                        {formatAmountShort(acc.currentBalance ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign Out */}
              <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Account</h3>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-sm rounded-xl transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}