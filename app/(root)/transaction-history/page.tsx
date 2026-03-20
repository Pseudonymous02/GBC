'use client';

import { getStoredTransactions } from '@/lib/utils';
import TransactionItem from '@/components/ui/TransactionItem';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { downloadAccountStatement } from '@/lib/utils';

import { useState, useEffect, useMemo } from 'react';
import type { Transaction } from '@/types';

export default function TransactionHistory() {
  const [view, setView] = useState<'all' | 'month'>('month');
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setTransactions(getStoredTransactions());
  }, []);

  // Filter transactions
  const filteredTxns = useMemo(() => {
    let txns = transactions;
    if (view === 'month') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      txns = txns.filter(txn => new Date(txn.date) > thirtyDaysAgo);
    }
    return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, view]);

  // Sort newest first
  filteredTxns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  
  const totalPages = Math.ceil(filteredTxns.length / ITEMS_PER_PAGE);
  const paginatedTxns = filteredTxns.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handlePrevious = () => {
  // Navigate to the previous page if possible
  setPage((p) => Math.max(1, p - 1));
};

const handleNext = () => {
  // Navigate to the next page if possible
  setPage((p) => Math.min(totalPages || 1, p + 1));
};
  
  const handleViewChange = (newView: 'all' | 'month') => {
    setView(newView);
    setPage(1);
  };


  return (
    <div className="flex-1 min-h-screen">
      <div className="p-8 space-y-8">
        {/* UI Hint: Transaction History */}
        <div className="mb-4">
          <div className="inline-flex items-center bg-blue-50 text-blue-800 px-3 py-1.5 rounded-md text-xs font-medium shadow-sm" title="View your demo transaction history.">
            📄 All transactions shown are for demonstration only.
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Link href="/" className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-2">Complete transaction records</p>
          </div>
        </motion.div>

        <div className="bg-white rounded-xl shadow-chart p-6">
          {/* Filter Buttons */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {view === 'month' ? 'Last 30 days' : 'All Transactions'}
              </h3>
              <p className="text-sm text-gray-500">
                {paginatedTxns.length} of {filteredTxns.length} transactions
              </p>
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => handleViewChange('month')}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  view === 'month'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                Last 30 days
              </button>
              <button 
                onClick={() => handleViewChange('all')}
                className={`px-4 py-2 rounded-md font-medium transition-all text-sm ${
                  view === 'all'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                All time
              </button>
             <button
  onClick={() => downloadAccountStatement(filteredTxns, 'acc_1')}
  disabled={filteredTxns.length === 0}
  className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium text-sm hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm ml-2"
>
  Download PDF
</button>
            </div>
          </div>

          {/* Transactions List */}
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {paginatedTxns.length > 0 ? (
              paginatedTxns.map((txn) => (
                <TransactionItem key={txn.id} transaction={txn} />
              ))
            ) : (
              <li className="flex flex-col items-center justify-center py-12 text-gray-500">
                <svg width="64" height="64" fill="none" viewBox="0 0 64 64" className="mb-4 opacity-40"><rect width="64" height="64" rx="16" fill="#F3F4F6"/><path d="M20 32h24M32 20v24" stroke="#A0AEC0" strokeWidth="2" strokeLinecap="round"/></svg>
                <span className="font-semibold text-base mb-1">No transactions found</span>
                <span className="text-sm text-gray-400">Try changing your filter or check back later.</span>
              </li>
            )}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 pt-8 border-t border-gray-200 flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}-{Math.min(page * ITEMS_PER_PAGE, filteredTxns.length)} of {filteredTxns.length}
              </span>
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 text-sm shadow-sm"
                  disabled={page === 1}
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </motion.button>
                <span className="px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg min-w-[80px] text-center">
                  Page {page} of {totalPages}
                </span>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-1 text-sm shadow-sm"
                  disabled={page === totalPages}
                  onClick={handleNext}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

