'use client';

import { getStoredAccounts, getStoredTransactions } from '@/lib/utils';
import BankCard from '@/components/ui/BankCard';
import Link from 'next/link';
import { Plus, Banknote, CreditCard, Shield, Settings, X, ArrowUpRight, ArrowDownLeft, TrendingUp, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { formatAmount, formatAmountShort, summarizeTransactions } from '@/lib/utils';

const CARD_TYPES = ['investment', 'credit', 'depository'];
const BANK_TYPES = ['checking', 'savings', 'portfolio', 'loan'];

export default function MyBanks() {
  const [accounts, setAccounts] = useState(getStoredAccounts());
  const [transactions, setTransactions] = useState(getStoredTransactions());
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeTab,        setActiveTab]        = useState<'cards' | 'banks'>('cards');
  const [selectedAccount,  setSelectedAccount]  = useState<string | null>(null);

  useEffect(() => {
    setAccounts(getStoredAccounts());
    setTransactions(getStoredTransactions());
  }, []);

  const cardAccounts = useMemo(
    () => accounts.filter((a) => CARD_TYPES.includes(a.type ?? '') || CARD_TYPES.includes(a.subtype ?? '')),
    [accounts]
  );
  const bankAccounts = useMemo(
    () => accounts.filter((a) => BANK_TYPES.includes(a.type ?? '') || BANK_TYPES.includes(a.subtype ?? '')),
    [accounts]
  );

  const displayedAccounts = activeTab === 'cards' ? cardAccounts : bankAccounts;
  const { totalDeposits, totalWithdrawals, net } = useMemo(() => summarizeTransactions(transactions), [transactions]);
  const totalBalance = useMemo(() => accounts.reduce((sum, a) => sum + (a.currentBalance ?? 0), 0), [accounts]);

  return (
    <div className="flex-1 min-h-screen bg-[#f5f6fa]">
      <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">

        {/* UI Hint: My Banks */}
        <div className="mb-4">
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm" title="Manage your demo bank accounts here.">
            💡 Tip: You can add, view, and remove demo accounts. No real connections are made.
          </div>
        </div>

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1a1a1a' }}>My Banks</h1>
            <p className="text-gray-500 mt-1 text-sm">
              {accounts.length} connected account{accounts.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              Total balance <span className="font-semibold text-gray-800">{formatAmountShort(totalBalance)}</span>
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowConnectModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all text-sm"
            style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}
            title="Add a new demo bank account."
          >
            <Plus className="w-4 h-4" />
            Connect New Bank
          </motion.button>
        </motion.div>

        {/* ── Summary Stats ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: 'Total Deposits',    value: formatAmountShort(totalDeposits),    icon: <ArrowDownLeft className="w-5 h-5" />, iconColor: '#1a1a1a', bg: '#fffef0', textColor: '#1a1a1a' },
            { label: 'Total Withdrawals', value: formatAmountShort(totalWithdrawals), icon: <ArrowUpRight  className="w-5 h-5" />, iconColor: '#e53e3e', bg: '#fff5f5', textColor: '#e53e3e' },
            { label: 'Net Portfolio',     value: formatAmountShort(net),              icon: <TrendingUp    className="w-5 h-5" />, iconColor: '#e6dc00', bg: '#fffef0', textColor: '#1a1a1a' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.07 }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bg, color: stat.iconColor }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <p className="text-lg font-bold" style={{ color: stat.textColor }}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Tabs ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1"
        >
          <div className="flex bg-gray-50 rounded-xl p-1 gap-1">
            {(['cards', 'banks'] as const).map((tab) => {
              const count    = tab === 'cards' ? cardAccounts.length : bankAccounts.length;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2.5 px-5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  style={isActive
                    ? { backgroundColor: '#fff498', color: '#1a1a1a', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : { color: '#667085' }
                  }
                >
                  {tab === 'cards' ? <CreditCard className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-bold"
                    style={isActive
                      ? { backgroundColor: '#e6dc00', color: '#1a1a1a' }
                      : { backgroundColor: '#eaecf0', color: '#667085' }
                    }
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Account Cards Grid ── */}
        <AnimatePresence mode="wait">
          {displayedAccounts.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayedAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div
                    className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-300 border"
                    style={selectedAccount === account.id
                      ? { borderColor: '#e6dc00', boxShadow: '0 4px 12px rgba(230,220,0,0.15)' }
                      : { borderColor: '#f2f4f7' }
                    }
                  >
                    <BankCard account={account} />

                    <div className="px-5 pb-5 pt-3 border-t border-gray-50">
                      <div className="flex gap-2">
                        <Link
                          href="/payment-transfer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xs font-semibold text-gray-700"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          Transfer
                        </Link>
                        <Link
                          href="/transaction-history"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-xs font-semibold text-gray-700"
                        >
                          <TrendingUp className="w-3.5 h-3.5" />
                          History
                        </Link>
                        <button
                          onClick={() => setSelectedAccount(selectedAccount === account.id ? null : account.id)}
                          className="p-2.5 rounded-xl border transition-all"
                          style={selectedAccount === account.id
                            ? { backgroundColor: '#fff498', borderColor: '#e6dc00', color: '#1a1a1a' }
                            : { borderColor: '#eaecf0', color: '#667085' }
                          }
                          title="Account Settings"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-2.5 rounded-xl border transition-all"
                          style={{ backgroundColor: '#fff498', borderColor: '#e6dc00', color: '#1a1a1a' }}
                          title="Security"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {selectedAccount === account.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
                              {[
                                { label: 'Account ID', value: account.mask,                                      valueStyle: { fontFamily: 'monospace', color: '#1a1a1a' } },
                                { label: 'Type',       value: account.subtype ?? account.type,                   valueStyle: { textTransform: 'capitalize' as const, color: '#1a1a1a' } },
                                { label: 'Available',  value: formatAmount(account.availableBalance ?? 0),       valueStyle: { color: '#16a34a', fontWeight: 600 } },
                                { label: 'Current',    value: formatAmount(account.currentBalance   ?? 0),       valueStyle: { color: '#1a1a1a', fontWeight: 600 } },
                              ].map((row) => (
                                <div key={row.label} className="flex justify-between">
                                  <span className="text-gray-400">{row.label}</span>
                                  <span style={row.valueStyle}>{row.value}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-5 bg-gray-100 rounded-full flex items-center justify-center">
                <Landmark className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No accounts here</h3>
              <p className="text-gray-500 text-sm mb-6">Connect a bank to see your {activeTab} here.</p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-7 py-3 rounded-2xl font-semibold shadow-md transition-all text-sm"
                style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}
                onClick={() => setShowConnectModal(true)}
              >
                Connect Bank
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Connect Modal ── */}
      <AnimatePresence>
        {showConnectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Connect Bank Account</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Choose how you'd like to connect</p>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                {[
                  { icon: <Banknote className="w-7 h-7" style={{ color: '#1a1a1a' }} />,  bg: '#fffef0', title: 'Plaid Secure Connect', desc: 'Connect 12,000+ banks instantly — Chase, Wells Fargo, Citi & more', badge: 'Recommended' },
                  { icon: <CreditCard className="w-7 h-7 text-gray-500" />,               bg: '#f9fafb', title: 'Manual Entry',         desc: 'Enter your routing and account numbers manually',                 badge: null },
                ].map((opt) => (
                  <motion.div
                    key={opt.title}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex items-start gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: opt.bg }}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm">{opt.title}</h3>
                        {opt.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}>
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 mt-1 transition-colors" />
                  </motion.div>
                ))}
              </div>

              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all text-sm font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all text-sm"
                    style={{ backgroundColor: '#fff498', color: '#1a1a1a' }}
                  >
                    Continue
                  </button>
                </div>
                <p className="text-center text-[11px] text-gray-400 mt-3">
                  🔒 Bank-level 256-bit encryption. Your credentials are never stored.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}