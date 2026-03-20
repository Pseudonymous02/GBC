import { type ClassValue, clsx } from "clsx";
import { MOCK_ACCOUNTS, MOCK_TRANSACTIONS } from "@/constants";
import { generateGCBStatementPDF } from './bank-statement-pdf';
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import type { Transaction, AccountTypes, CategoryCount, Account } from '@/types';

export function getStoredAccounts(): Account[] {
  if (typeof window === 'undefined') return MOCK_ACCOUNTS;
  try {
    const stored = localStorage.getItem('accounts');
    return stored ? JSON.parse(stored) : MOCK_ACCOUNTS;
  } catch {
    return MOCK_ACCOUNTS;
  }
}

export function setStoredAccounts(accounts: Account[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }
}

export function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') return MOCK_TRANSACTIONS;
  try {
    const stored = localStorage.getItem('transactions');
    return stored ? JSON.parse(stored) : MOCK_TRANSACTIONS;
  } catch {
    return MOCK_TRANSACTIONS;
  }
}

export function setStoredTransactions(transactions: Transaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
// FIX 5: parameter type is `string | Date` — the function already handles both via `new Date()`
export const formatDateTime = (dateString: string | Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const d = new Date(dateString);

  return {
    dateTime: d.toLocaleString("en-US", dateTimeOptions),
    dateDay:  d.toLocaleString("en-US", dateDayOptions),
    dateOnly: d.toLocaleString("en-US", dateOptions),
    timeOnly: d.toLocaleString("en-US", timeOptions),
  };
};

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Formats large amounts with shorthand notation (e.g. $1.2M, $700.6K)
 * Useful for dashboard summary cards showing portfolio-scale values.
 */
export function formatAmountShort(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return formatAmount(amount);
}

// FIX 3: properly typed generic deep-clone with a doc comment noting its limitations
/**
 * Deep-clones a JSON-serialisable value via JSON round-trip.
 * NOTE: drops `undefined` values, converts `Date` to ISO strings,
 * and strips functions. Use structuredClone() for richer types.
 */
export const parseStringify = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

// FIX 1: guard against SSR — window is not available server-side
export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  if (typeof window === 'undefined') return '';

  const currentUrl = qs.parse(params);
  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };
    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };
    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

export function countTransactionCategories(
  transactions: Transaction[]
): CategoryCount[] {
  // FIX 2: use Map instead of a plain object to avoid hasOwnProperty pitfalls
  const categoryCounts = new Map<string, number>();

  for (const transaction of transactions ?? []) {
    const category = transaction.category;
    categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }

  const totalCount = transactions?.length ?? 0;

  const aggregatedCategories: CategoryCount[] = Array.from(
    categoryCounts.entries()
  ).map(([name, count]) => ({ name, count, totalCount }));

  aggregatedCategories.sort((a, b) => b.count - a.count);

  return aggregatedCategories;
}

/**
 * Filters transactions to a specific year.
 * Useful for yearly breakdown views in transaction history.
 */
export function filterTransactionsByYear(
  transactions: Transaction[],
  year: number
): Transaction[] {
  return transactions.filter((t) => new Date(t.date).getFullYear() === year);
}

/**
 * Filters transactions to a date range (inclusive).
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= startDate && d <= endDate;
  });
}

/**
 * Returns total deposits, total withdrawals, and net balance
 * for a given list of transactions.
 */
export function summarizeTransactions(transactions: Transaction[]): {
  totalDeposits: number;
  totalWithdrawals: number;
  net: number;
} {
  let totalDeposits = 0;
  let totalWithdrawals = 0;

  for (const t of transactions) {
    if (t.amount > 0) {
      totalDeposits += t.amount;
    } else {
      totalWithdrawals += Math.abs(t.amount);
    }
  }

  return {
    totalDeposits,
    totalWithdrawals,
    net: totalDeposits - totalWithdrawals,
  };
}

/**
 * Sorts transactions by date descending (most recent first).
 * Use this before rendering transaction lists.
 */
export function sortTransactionsByDate(
  transactions: Transaction[]
): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function extractCustomerIdFromUrl(url: string) {
  const parts = url.split("/");
  return parts[parts.length - 1];
}

export function encryptId(id: string) {
  // btoa is not available during SSR. Use Buffer in Node.js environments.
  if (typeof window === 'undefined') {
    return Buffer.from(id, 'utf-8').toString('base64');
  }
  return window.btoa(id);
}

export function decryptId(id: string) {
  if (typeof window === 'undefined') {
    return Buffer.from(id, 'base64').toString('utf-8');
  }
  return window.atob(id);
}

export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);
  return date > twoDaysAgo ? "Processing" : "Success";
};

/**
 * Downloads account statement as PDF (GCB format).
 */
// FIX 4: use Transaction[] instead of any[]
export function downloadAccountStatement(
  transactions: Transaction[],
  accountId: string
) {
  generateGCBStatementPDF(transactions, accountId);
}