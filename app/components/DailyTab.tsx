'use client';

import { useCallback } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { sumBy, toLocalISO } from '@/lib/budget';
import { generateDailyReport, downloadReport } from '@/lib/report';
import SummaryBar from './SummaryBar';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

export default function DailyTab() {
  const { transactions, today, add, remove } = useTransactions();

  const todayTxs     = transactions.filter(t => t.date === today);
  const todayIncome  = sumBy(todayTxs, 'income');
  const todayExpense = sumBy(todayTxs, 'expense');

  const handleDownload = useCallback(() => {
    const d = new Date();
    const iso = toLocalISO(d);
    const html = generateDailyReport(iso, transactions);
    const fname = `일간_재무보고서_${iso}.html`;
    downloadReport(html, fname);
  }, [transactions]);

  return (
    <div>
      {/* 섹션 헤더 */}
      <div className="ms-section-title" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="ms-section-title-bar" />
          <span className="ms-section-title-text">일일 입출력</span>
        </div>
        <button className="ms-btn-download" onClick={handleDownload}>
          ↓ 일간 리포트
        </button>
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
