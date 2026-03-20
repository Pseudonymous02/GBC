import { formatAmount, formatDateTime, getTransactionStatus } from '@/lib/utils';
import { Transaction } from '@/types';
import { Clock, CheckCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { transactionCategoryStyles } from '@/constants';

interface TransactionItemProps {
  transaction: Transaction;
  compact?: boolean; // for dashboard "recent" lists vs full history page
}

// Icon background colours per category
const ICON_BG: Record<string, string> = {
  Investment:    'bg-blue-100',
  'Real Estate': 'bg-green-100',
  Commodities:   'bg-yellow-100',
  Aviation:      'bg-indigo-100',
  Income:        'bg-emerald-100',
  'Bank Charge': 'bg-gray-100',
  Tax:           'bg-red-100',
  Insurance:     'bg-purple-100',
  Transportation:'bg-orange-100',
  Entertainment: 'bg-pink-100',
  Luxury:        'bg-rose-100',
  Food:          'bg-cyan-100',
};

const ICON_TINT: Record<string, string> = {
  Investment:    'text-blue-600',
  'Real Estate': 'text-green-600',
  Commodities:   'text-yellow-600',
  Aviation:      'text-indigo-600',
  Income:        'text-emerald-600',
  'Bank Charge': 'text-gray-500',
  Tax:           'text-red-600',
  Insurance:     'text-purple-600',
  Transportation:'text-orange-600',
  Entertainment: 'text-pink-600',
  Luxury:        'text-rose-600',
  Food:          'text-cyan-600',
};

export default function TransactionItem({ transaction, compact = false }: TransactionItemProps) {
  const status    = getTransactionStatus(new Date(transaction.date));
  const isPending = transaction.pending || status === 'Processing';
  const isCredit  = transaction.amount > 0;

  const category      = transaction.category ?? 'default';
  const chipStyle     = transactionCategoryStyles[category as keyof typeof transactionCategoryStyles]
                        ?? transactionCategoryStyles.default;
  const iconBg        = ICON_BG[category]   ?? 'bg-gray-100';
  const iconTint      = ICON_TINT[category] ?? 'text-gray-500';
  const { dateOnly, timeOnly } = formatDateTime(new Date(transaction.date));

  return (
    <li
      className={cn(
        'group flex items-center gap-3 rounded-xl transition-all duration-150',
        'border border-transparent hover:border-gray-100 hover:bg-gray-50/70',
        compact ? 'px-3 py-2.5' : 'px-4 py-3.5 md:px-4 md:py-3.5'
        )}
    >
      {/* ── Icon ── */}
      <div className={cn(
        'flex items-center justify-center shrink-0 rounded-xl',
        compact ? 'w-9 h-9' : 'w-11 h-11',
        iconBg,
      )}>
        <Image
          src={transaction.image ?? '/icons/dollar.svg'}
          alt={category}
          width={compact ? 16 : 20}
          height={compact ? 16 : 20}
          className={cn('object-contain', iconTint)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/dollar.svg';
          }}
        />
      </div>

      {/* ── Name + meta ── */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-semibold text-gray-900 truncate leading-tight',
          compact ? 'text-xs' : 'text-sm'
        )}>
          {transaction.name}
        </p>

        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Category chip */}
          <span className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
            chipStyle.chipBackgroundColor,
            // derive text colour from border colour class
            chipStyle.borderColor.replace('border-', 'text-')
          )}>
            {category}
          </span>

          {/* Date */}
          <span className="text-[11px] text-gray-400">
            {dateOnly}{!compact && ` · ${timeOnly}`}
          </span>
        </div>
      </div>

      {/* ── Amount + status ── */}
      <div className="text-right shrink-0 flex flex-col items-end gap-1">
        {/* Amount row */}
        <div className="flex items-center gap-1">
          {isCredit
            ? <ArrowDownLeft className="w-3 h-3 text-emerald-500" />
            : <ArrowUpRight  className="w-3 h-3 text-red-400"     />
          }
          <span className={cn(
            'font-bold',
            compact ? 'text-sm' : 'text-base',
            isCredit ? 'text-emerald-600' : 'text-red-500'
          )}>
            {isCredit ? '+' : '-'}{formatAmount(Math.abs(transaction.amount))}
          </span>
        </div>

        {/* Status badge */}
        {isPending ? (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
            <Clock className="w-2.5 h-2.5 text-amber-500" />
            <span className="text-[10px] font-semibold text-amber-600">Pending</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
            <CheckCircle className="w-2.5 h-2.5 text-emerald-500" />
            <span className="text-[10px] font-semibold text-emerald-600">Success</span>
          </div>
        )}
      </div>
    </li>
  );
}