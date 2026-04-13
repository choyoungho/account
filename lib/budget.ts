// ─── 타입 ─────────────────────────────────────────────
export type TxType = 'income' | 'expense';

export interface Transaction {
  id: number;
  type: TxType;
  date: string;       // YYYY-MM-DD
  amount: number;
  category: string;
  desc: string;
  time: string;       // HH:MM
}

// ─── 카테고리 ──────────────────────────────────────────
export const INCOME_CATS = ['급여', '용돈', '부수입', '투자수익', '기타수입'];
export const EXPENSE_CATS = [
  '식비', '교통비', '쇼핑', '의료비', '문화/여가',
  '교육', '주거/관리비', '통신비', '경조사', '저축', '기타지출',
];

export const CAT_ICONS: Record<string, string> = {
  급여: '💼', 용돈: '💵', 부수입: '💡', 투자수익: '📈', 기타수입: '🎁',
  식비: '🍚', 교통비: '🚌', 쇼핑: '🛍️', 의료비: '💊', '문화/여가': '🎬',
  교육: '📚', '주거/관리비': '🏠', 통신비: '📱', 경조사: '🎊', 저축: '🏦', 기타지출: '📝',
};

// ─── 날짜 유틸 ────────────────────────────────────────
export function toLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatMoney(n: number): string {
  return '₩' + Math.abs(n).toLocaleString('ko-KR');
}

export function formatHeaderDate(d: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

export function getWeekStart(offset: number): Date {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow + 1 + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getWeekDates(offset: number): string[] {
  const ws = getWeekStart(offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws);
    d.setDate(ws.getDate() + i);
    return toLocalISO(d);
  });
}

export function sumBy(txs: Transaction[], type: TxType): number {
  return txs.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);
}

// ─── localStorage ────────────────────────────────────
const LS_KEY = 'budget_txs_next';

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveTransactions(txs: Transaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(txs));
}
