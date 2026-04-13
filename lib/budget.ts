import { supabase } from './supabase';

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

// ─── Supabase DB ─────────────────────────────────────
type DbRow = {
  id: number;
  type: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  time: string;
};

function rowToTx(row: DbRow): Transaction {
  return {
    id: row.id,
    type: row.type as TxType,
    date: row.date,
    amount: row.amount,
    category: row.category,
    desc: row.description,
    time: row.time,
  };
}

export async function loadTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('time', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data as DbRow[]).map(rowToTx);
}

export async function addTransaction(
  tx: Omit<Transaction, 'id'>
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ type: tx.type, date: tx.date, amount: tx.amount, category: tx.category, description: tx.desc, time: tx.time })
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return rowToTx(data as DbRow);
}

export async function deleteTransaction(id: number): Promise<boolean> {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) { console.error(error); return false; }
  return true;
}

export async function updateTransaction(
  id: number,
  tx: Omit<Transaction, 'id'>
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from('transactions')
    .update({ type: tx.type, date: tx.date, amount: tx.amount, category: tx.category, description: tx.desc, time: tx.time })
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return rowToTx(data as DbRow);
}
