export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  note?: string;
}

export interface Budget {
  category: string;
  limit: number;
}

export const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  'Food':       { icon: '🍔', color: '#f97316' },
  'Travel':     { icon: '✈️', color: '#06b6d4' },
  'Shopping':   { icon: '🛍️', color: '#a855f7' },
  'Salary':     { icon: '💼', color: '#22c55e' },
  'Bills':      { icon: '📄', color: '#ef4444' },
  'Health':     { icon: '💊', color: '#ec4899' },
  'Education':  { icon: '📚', color: '#3b82f6' },
  'Other':      { icon: '📦', color: '#94a3b8' }
};

export const CATEGORIES = Object.keys(CATEGORY_META);