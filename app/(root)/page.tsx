'use client';

import { getStoredAccounts, getStoredTransactions } from '@/lib/utils';
import { countTransactionCategories } from '@/lib/utils';
import StatsCard from '@/components/ui/StatsCard';
import CategoryChart from '@/components/ui/CategoryChart';
import TransactionItem from '@/components/ui/TransactionItem';
import BankCard from '@/components/ui/BankCard';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { Transaction, Account } from '@/types';

export default function Home() {
  // FIX 5: use proper Account type instead of any[]
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // FIX 4: read stored user name instead of hardcoding it
  const [userName, setUserName] = useState('Norita Miranda');

  useEffect(() => {
    setAccounts(getStoredAccounts());
    setTransactions(getStoredTransactions());
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUserName(parsed.name);
      }
    } catch { /* ignore */ }
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  const totalIncome = transactions.reduce((sum, txn) => txn.amount > 0 ? sum + txn.amount : sum, 0);
  const totalExpenses = Math.abs(transactions.reduce((sum, txn) => txn.amount < 0 ? sum + txn.amount : sum, 0));
  // FIX 2: pass categories to CategoryChart instead of discarding
  const categories = countTransactionCategories(transactions);
  const recentTxns = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const stats = [
    {
      title: 'Total Balance',
      value: `$${totalBalance.toLocaleString()}`,
      change: '+2.5%',
      trend: 'up' as const,
      icon: 'balance' as const,
    },
    {
      title: 'Total Income',
      value: `$${totalIncome.toLocaleString()}`,
      change: '+12.1%',
      trend: 'up' as const,
      icon: 'income' as const,
    },
    {
      title: 'Total Expenses',
      value: `$${totalExpenses.toLocaleString()}`,
      change: '-8.3%',
      trend: 'down' as const,
      icon: 'expenses' as const,
    },
    {
      title: 'Bank Accounts',
      value: accounts.length.toString(),
      change: '0',
      trend: 'up' as const,
      icon: 'cards' as const,
    },
  ];

  return (
    <div className="flex-1 min-h-screen">
      <div className="home-content">
        {/* UI Hint: Dashboard overview */}
        <div className="mb-4">
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm" title="This is a demo dashboard. All data is simulated.">
            
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div>
            <h1 className="header-box-title">Dashboard</h1>
            {/* FIX 4: use dynamic user name */}
            <p className="text-16 text-gray-600 mt-2">
              Welcome back, {userName}! Here&apos;s what&apos;s happening with your finances.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                // FIX 3: put index to use with a stagger animation
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                {/* FIX 1: pass stat.icon instead of hardcoded "balance" */}
                <StatsCard
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  trend={stat.trend}
                  icon={stat.icon}
                />
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* FIX 2: pass computed categories to CategoryChart */}
            <CategoryChart transactions={transactions} categories={categories} />

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-chart p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <a href="/transaction-history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View all →
                </a>
              </div>
              <ul className="space-y-3 max-h-96 overflow-y-auto">
                {recentTxns.map((txn) => (
                  <TransactionItem key={txn.id} transaction={txn} />
                ))}
              </ul>
            </div>
          </div>

          {/* Connected Banks */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Connected Banks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FIX 5: no more (account: any) cast */}
              {accounts.map((account) => (
                <div key={account.id} className="p-6 border rounded-xl hover:shadow-lg transition-all">
                  <BankCard account={account} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}