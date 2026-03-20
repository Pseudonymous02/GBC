import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { countTransactionCategories } from '@/lib/utils';
import type { Transaction } from '@/types';

ChartJS.register(ArcElement, Tooltip, Legend);

// FIX 1: accept pre-computed categories so the parent (Home.tsx) can pass them in,
// avoiding a redundant double-computation. Falls back to computing internally if not provided.
interface CategoryCount {
  name: string;
  count: number;
}

interface CategoryChartProps {
  transactions: Transaction[];
  categories?: CategoryCount[];
  className?: string;
  maxCategories?: number;
}

const PALETTE = [
  '#3B82F6', // blue    — Investment
  '#10B981', // FIX 3: was '#fff498' (near-invisible yellow) — replaced with emerald green
  '#EF4444', // red     — Tax
  '#F59E0B', // amber   — Commodities
  '#6366F1', // indigo  — Aviation
  '#EC4899', // pink    — Entertainment / Luxury
  '#14B8A6', // teal    — Food
  '#8B5CF6', // violet  — Insurance
  '#F97316', // orange  — Transportation
  '#6B7280', // gray    — Bank Charge
];

// FIX 5: explicit alpha blend instead of string concatenation — works for any hex length
function withAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}

export default function CategoryChart({
  transactions,
  categories: categoriesProp,
  className = '',
  maxCategories = 6,
}: CategoryChartProps) {
  // FIX 1: use prop if provided, otherwise compute — avoids double work when parent passes it
  const allCategories = categoriesProp ?? countTransactionCategories(transactions);
  const top           = allCategories.slice(0, maxCategories);
  const total         = top.reduce((sum, c) => sum + c.count, 0);

  const data = {
    labels: top.map((c) => c.name),
    datasets: [
      {
        data: top.map((c) => c.count),
        backgroundColor: top.map((_, i) => PALETTE[i % PALETTE.length]),
        // FIX 5: explicit alpha via helper instead of bare string concatenation
        hoverBackgroundColor: top.map((_, i) => withAlpha(PALETTE[i % PALETTE.length], 0.8)),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
      },
    ],
  };

  // FIX 2: proper ChartOptions type instead of `any`
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (ctx) => {
            const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
            return `  ${ctx.label}: ${ctx.parsed} txns (${pct}%)`;
          },
        },
      },
    },
  };

  const topCat = top[0];
  const topPct = total > 0 ? Math.round((topCat?.count / total) * 100) : 0;

  if (!top.length) {
    return (
      <div className={`p-6 bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        <p className="text-sm text-gray-400 text-center py-12">No transaction data available.</p>
      </div>
    );
  }

  return (
    <div className={`p-6 bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Spending by Category</h3>
          <p className="text-xs text-gray-400 mt-0.5">{transactions.length} total transactions</p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full">
          Top {top.length}
        </span>
      </div>

      {/* Doughnut + centre label */}
      <div className="relative h-56">
        <Doughnut data={data} options={options} />

        {/* FIX 4: clarify that centre label is by transaction count, not spend amount */}
        {topCat && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-gray-900">{topPct}%</p>
            <p className="text-[11px] text-gray-400 font-medium text-center max-w-[70px] leading-tight">
              {topCat.name}
            </p>
            <p className="text-[10px] text-gray-300 font-medium mt-0.5">by count</p>
          </div>
        )}
      </div>

      {/* Legend rows */}
      <div className="mt-6 space-y-2.5">
        {top.map((cat, i) => {
          const pct   = total > 0 ? ((cat.count / total) * 100).toFixed(1) : '0';
          const color = PALETTE[i % PALETTE.length];
          return (
            <div key={cat.name} className="flex items-center gap-3">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs font-medium text-gray-700 flex-1 truncate">{cat.name}</span>
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                {cat.count} <span className="text-gray-300">·</span> {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}