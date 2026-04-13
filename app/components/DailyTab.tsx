'use client';

import { useTransactions } from '@/hooks/useTransactions';
import { sumBy } from '@/lib/budget';
import SummaryBar from './SummaryBar';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function DailyTab() {
  const { transactions, today, add, remove } = useTransactions();

  const todayTxs = transactions.filter(t => t.date === today);
  const todayIncome = sumBy(todayTxs, 'income');
  const todayExpense = sumBy(todayTxs, 'expense');

  return (
    <div>
      <TransactionForm onAdd={add} />

      <SummaryBar
        income={todayIncome}
        expense={todayExpense}
        incomeLabel="오늘 수입"
        expenseLabel="오늘 지출"
        balanceLabel="오늘 잔액"
      />

      <TransactionList transactions={transactions} onDelete={remove} />
    </div>
  );
}
