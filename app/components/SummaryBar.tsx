'use client';

import { formatMoney } from '@/lib/budget';

interface SummaryBarProps {
  income: number;
  expense: number;
  incomeLabel?: string;
  expenseLabel?: string;
  balanceLabel?: string;
}

export default function SummaryBar({
  income,
  expense,
  incomeLabel = '수입',
  expenseLabel = '지출',
  balanceLabel = '잔액',
}: SummaryBarProps) {
  const balance = income - expense;

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-4">
      <div className="bg-white rounded-xl p-3.5 text-center shadow-sm">
        <div className="text-xs text-gray-500 font-semibold mb-1">{incomeLabel}</div>
        <div className="text-base font-bold text-green-600">{formatMoney(income)}</div>
      </div>
      <div className="bg-white rounded-xl p-3.5 text-center shadow-sm">
        <div className="text-xs text-gray-500 font-semibold mb-1">{expenseLabel}</div>
        <div className="text-base font-bold text-red-500">{formatMoney(expense)}</div>
      </div>
      <div className="bg-white rounded-xl p-3.5 text-center shadow-sm">
        <div className="text-xs text-gray-500 font-semibold mb-1">{balanceLabel}</div>
        <div
          className="text-base font-bold"
          style={{ color: balance < 0 ? '#e53e3e' : '#4f46e5' }}
        >
          {balance < 0 ? '-' : ''}{formatMoney(balance)}
        </div>
      </div>
    </div>
  );
}
