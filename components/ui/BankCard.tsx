import { Account } from '@/types';
// FIX 1: removed unused getAccountTypeColors import
import { cn, formatAmount } from '@/lib/utils';
import Image from 'next/image';

interface BankCardProps {
  account: Account;
  showBalance?: boolean;
}

const CARD_GRADIENTS: Record<string, string> = {
  investment: 'from-slate-800 via-slate-700 to-slate-900',
  portfolio:  'from-slate-800 via-slate-700 to-slate-900',
  credit:     'from-rose-700 via-rose-600 to-red-800',
  depository: 'from-blue-700 via-blue-600 to-indigo-800',
  checking:   'from-blue-700 via-blue-600 to-indigo-800',
  savings:    'from-emerald-700 via-emerald-600 to-green-800',
  loan:       'from-amber-700 via-amber-600 to-orange-800',
  default:    'from-gray-700 via-gray-600 to-gray-900',
};

const CARD_NETWORK: Record<string, string> = {
  investment: '/icons/mastercard.svg',
  portfolio:  '/icons/mastercard.svg',
  credit:     '/icons/visa.svg',
  default:    '/icons/visa.svg',
};

function getGradient(account: Account): string {
  return (
    CARD_GRADIENTS[account.subtype ?? ''] ??
    CARD_GRADIENTS[account.type ?? ''] ??
    CARD_GRADIENTS.default
  );
}

function getNetwork(account: Account): string {
  return (
    CARD_NETWORK[account.subtype ?? ''] ??
    CARD_NETWORK[account.type ?? ''] ??
    CARD_NETWORK.default
  );
}

// FIX 2: handle empty/undefined mask gracefully — always shows 4 trailing digits or all bullets
function formatMask(mask?: string): string {
  if (!mask) return '•••• •••• •••• ••••';
  const digits = mask.replace(/\D/g, '').slice(-4);
  if (!digits) return '•••• •••• •••• ••••';
  return `•••• •••• •••• ${digits}`;
}

// FIX 5: capitalise account type for display
function formatType(type?: string): string {
  if (!type) return 'Account';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function BankCard({ account, showBalance = true }: BankCardProps) {
  const gradient = getGradient(account);
  const network  = getNetwork(account);

  return (
    <div
      className={cn(
        'relative w-full rounded-2xl overflow-hidden',
        // FIX 3: use aspect-[1.586] not aspect-[1.586/1]
        'aspect-[1.586]',
        'bg-gradient-to-br',
        gradient,
        'shadow-xl select-none'
      )}
    >
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-14 -left-8  w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none" />

      {/* Shine strip */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Card Content */}
      <div className="relative h-full flex flex-col justify-between p-5 sm:p-6">

        {/* Top row: institution name + chip */}
        <div className="flex items-start justify-between">
          <div>
            {/* FIX 5: capitalised account type */}
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              {formatType(account.type)}
            </p>
            <p className="text-sm font-bold text-white mt-0.5 leading-tight">
              {account.name}
            </p>
          </div>

          {/* EMV Chip */}
          <div className="w-9 h-7 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner flex items-center justify-center opacity-90">
            <div className="grid grid-cols-2 gap-[2px]">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[6px] h-[5px] bg-yellow-700/40 rounded-[1px]" />
              ))}
            </div>
          </div>
        </div>

        {/* Middle: card number */}
        <div className="mt-auto">
          {/* FIX 2: mask is now always defined */}
          <p className="font-mono text-sm sm:text-base tracking-[0.2em] text-white/80 font-medium">
            {formatMask(account.mask)}
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between mt-3">
          <div className="space-y-2">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Account Holder</p>
              <p className="text-xs font-semibold text-white/90 truncate max-w-[140px]">
                {account.officialName ?? account.name}
              </p>
            </div>

            {showBalance && (
              <div>
                <p className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Balance</p>
                <p className="text-sm font-bold text-white">
                  {formatAmount(account.currentBalance ?? 0)}
                </p>
              </div>
            )}
          </div>

          {/* FIX 4: guard against infinite onError loop with a flag */}
          <div className="flex items-center">
            <Image
              src={network}
              alt="Card network"
              width={48}
              height={30}
              className="drop-shadow-lg object-contain"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1';
                  img.src = '/icons/visa.svg';
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}