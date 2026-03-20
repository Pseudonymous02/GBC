import { TrendingUp, TrendingDown, DollarSign, CreditCard, Activity, ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState, useId } from 'react';

// ── Icon + colour config per card variant ──────────────────────────────────

// FIX 1: renamed CardVariant values to match the `icon` strings passed from Home.tsx
type CardVariant = 'balance' | 'income' | 'expenses' | 'cards' | 'default';

const VARIANT_CONFIG: Record<CardVariant, {
  icon: LucideIcon;
  lightBg: string;
  darkBg: string;
  lightText: string;
  darkText: string;
  accentColor: string;
}> = {
  balance: {
    icon: DollarSign,
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/20',
    lightText: 'text-blue-600',
    darkText: 'dark:text-blue-400',
    accentColor: '#3B82F6',
  },
  income: {
    icon: TrendingUp,
    lightBg: 'bg-emerald-50',
    darkBg: 'dark:bg-emerald-950/20',
    lightText: 'text-emerald-600',
    darkText: 'dark:text-emerald-400',
    accentColor: '#10B981',
  },
  // FIX 1: was 'spending', Home.tsx passes 'expenses'
  expenses: {
    icon: TrendingDown,
    lightBg: 'bg-rose-50',
    darkBg: 'dark:bg-rose-950/20',
    lightText: 'text-rose-500',
    darkText: 'dark:text-rose-400',
    accentColor: '#EF4444',
  },
  // FIX 1: was 'activity', Home.tsx passes 'cards'
  cards: {
    icon: CreditCard,
    lightBg: 'bg-purple-50',
    darkBg: 'dark:bg-purple-950/20',
    lightText: 'text-purple-600',
    darkText: 'dark:text-purple-400',
    accentColor: '#8B5CF6',
  },
  default: {
    icon: DollarSign,
    lightBg: 'bg-blue-50',
    darkBg: 'dark:bg-blue-950/20',
    lightText: 'text-blue-600',
    darkText: 'dark:text-blue-400',
    accentColor: '#3B82F6',
  },
};

// ── Tiny SVG sparkline ─────────────────────────────────────────────────────

function Sparkline({
  points,
  color,
  gradientId,        // FIX 4: accept unique gradientId from parent
  trend,
}: {
  points: number[];
  color: string;
  gradientId: string;
  trend: 'up' | 'down';
}) {
  const W = 80, H = 32;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  });

  const pathD = `M${coords.join(' L')}`;
  const fillD = `M0,${H} L${coords.join(' L')} L${W},${H} Z`;
  const lastCoord = coords[coords.length - 1].split(',');

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible flex-shrink-0">
      <defs>
        {/* FIX 4: use unique gradientId instead of color-based id */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${gradientId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
      />
      <circle
        cx={lastCoord[0]}
        cy={lastCoord[1]}
        r="3"
        fill={color}
        className="drop-shadow-sm"
      />
    </svg>
  );
}

// ── Animated numeric counter ───────────────────────────────────────────────

function useCountUp(target: string, duration = 1000) {
  const [display, setDisplay] = useState('0');
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const numeric = parseFloat(target.replace(/[^0-9.-]/g, ''));
    const prefix = target.match(/^[^0-9-]*/)?.[0] ?? '';
    const suffix = target.match(/[^0-9.]+$/)?.[0] ?? '';

    if (isNaN(numeric)) {
      setDisplay(target);
      return;
    }

    const start = Date.now();

    // FIX 3: cancel any in-flight frame before scheduling a new one
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;

      const formatted = target.includes(',')
        ? prefix + current.toLocaleString('en-US', { maximumFractionDigits: target.includes('.') ? 2 : 0 }) + suffix
        : prefix + current.toFixed(target.includes('.') ? 2 : 0) + suffix;

      setDisplay(formatted);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, duration]);

  return display;
}

// ── StatsCard ──────────────────────────────────────────────────────────────

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  // FIX 1: prop is now `icon` to match what Home.tsx passes
  icon?: CardVariant;
  sparkline?: number[];
  subtitle?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon = 'default',       // FIX 1: was `variant`
  sparkline,
  subtitle,
  className = '',
}: StatsCardProps) {
  const config = VARIANT_CONFIG[icon] ?? VARIANT_CONFIG.default;
  const Icon = config.icon;
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;
  const animatedValue = useCountUp(value);

  // FIX 2: generate unique IDs per card instance so aria-labelledby is never duplicated
  const uid = useId();
  const titleId = `stats-title-${uid}`;

  // FIX 4: unique gradient ID per card
  const gradientId = `sg-${uid.replace(/:/g, '')}`;

  const defaultSparkline = trend === 'up'
    ? [30, 35, 28, 45, 42, 55, 60, 58, 70]
    : [70, 65, 60, 50, 55, 42, 38, 35, 30];

  const points = sparkline ?? defaultSparkline;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl p-6 border bg-card text-card-foreground shadow-sm hover:shadow-xl focus-within:shadow-xl transition-all duration-300 cursor-default ring-1 ring-border/50',
        className
      )}
      tabIndex={0}
      role="group"
      aria-labelledby={titleId}    // FIX 2: unique id per instance
    >
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 lg:group-focus:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-accent/5 to-transparent" />

      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
        <div className={cn(
          'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 p-3 shadow-lg ring-1 ring-border/50 backdrop-blur-sm',
          config.lightBg,
          config.darkBg
        )}>
          <Icon className={cn('w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0', config.lightText, config.darkText)} />
        </div>

        <div className={cn(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm ring-1 ring-border/50 backdrop-blur-sm ml-auto',
          trend === 'up'
            ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/90'
        )}>
          <TrendIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="tracking-tight">{change}</span>
        </div>
      </div>

      {/* Value + sparkline */}
      <div className="flex items-baseline justify-between gap-3 mb-2 sm:mb-3">
        {/* FIX 5: removed dead bg-clip-text gradient that had no visual effect */}
        <h3
          id={titleId}
          className="text-2xl sm:text-3xl lg:text-[28px] xl:text-[32px] font-black leading-none tracking-tight tabular-nums text-foreground"
          aria-label={`Current ${title.toLowerCase()}: ${animatedValue}`}
        >
          {animatedValue}
        </h3>
        <div className="flex-shrink-0 mb-1 sm:mb-0.5">
          <Sparkline points={points} color={config.accentColor} gradientId={gradientId} trend={trend} />
        </div>
      </div>

      {/* Labels */}
      <p className="text-base sm:text-lg font-semibold text-muted-foreground leading-tight tracking-tight">
        {title}
      </p>
      {subtitle && (
        <p className="text-xs sm:text-sm text-muted-foreground/80 mt-0.5 leading-relaxed">
          {subtitle}
        </p>
      )}

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/40 to-transparent scale-x-0 group-hover:scale-x-100 lg:group-focus:scale-x-100 origin-left transition-transform duration-700" />
    </div>
  );
}