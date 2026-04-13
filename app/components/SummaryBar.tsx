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

  const cards = [
    {
      label: incomeLabel,
      value: formatMoney(income),
      color: 'var(--ms-green)',
      bg: 'var(--ms-green-light)',
      icon: '↑',
    },
    {
      label: expenseLabel,
      value: formatMoney(expense),
      color: 'var(--ms-red)',
      bg: 'var(--ms-red-light)',
      icon: '↓',
    },
    {
      label: balanceLabel,
      value: (balance < 0 ? '-' : '') + formatMoney(balance),
      color: balance < 0 ? 'var(--ms-red)' : 'var(--ms-blue)',
      bg: balance < 0 ? 'var(--ms-red-light)' : 'var(--ms-blue-light)',
      icon: '=',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
      {cards.map(c => (
        <div key={c.label} className="ms-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 2,
              background: c.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: c.color, flexShrink: 0,
            }}>
              {c.icon}
            </div>
            <span style={{ fontSize: 12, color: 'var(--ms-text-2)', fontWeight: 600 }}>
              {c.label}
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: c.color, fontVariantNumeric: 'tabular-nums' }}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
