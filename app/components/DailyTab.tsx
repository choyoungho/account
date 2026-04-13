'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { sumBy } from '@/lib/budget';
import SummaryBar from './SummaryBar';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function DailyTab() {
  const { transactions, today, add, remove } = useTransactions();

  const todayTxs = transactions.filter(t => t.date === today);
  const todayIncome  = sumBy(todayTxs, 'income');
  const todayExpense = sumBy(todayTxs, 'expense');

  return (
    <div>
      {/* 섹션 제목 */}
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 3, height: 18, background: 'var(--ms-blue)', borderRadius: 0,
        }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ms-text-1)' }}>
          일일 입출력
        </span>
      </div>

      <SummaryBar
        income={todayIncome}
        expense={todayExpense}
        incomeLabel="오늘 수입"
        expenseLabel="오늘 지출"
        balanceLabel="오늘 잔액"
      />

      <TransactionForm onAdd={add} />
      <TransactionList transactions={transactions} onDelete={remove} />
    </div>
  );
}
