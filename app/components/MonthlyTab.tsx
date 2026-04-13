'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { sumBy, formatMoney } from '@/lib/budget';
import SummaryBar from './SummaryBar';
import CategoryChart from './CategoryChart';
import MonthCalendar from './MonthCalendar';
import DateNav from './DateNav';

export default function MonthlyTab() {
  const { transactions } = useTransactions();
  const [offset, setOffset] = useState(0);

  const base   = new Date();
  const target = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const year   = target.getFullYear();
  const month  = target.getMonth();

  const monthLabel = `${year}년 ${month + 1}월`;

  const monthTxs = useMemo(
    () => transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [transactions, year, month]
  );

  const totalIncome  = sumBy(monthTxs, 'income');
  const totalExpense = sumBy(monthTxs, 'expense');

  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const result: { start: Date; end: Date }[] = [];
    let cur = new Date(firstDay);
    while (cur <= lastDay) {
      const wStart = new Date(cur);
      const wEnd   = new Date(cur);
      while (wEnd.getDay() !== 0 && wEnd < lastDay) wEnd.setDate(wEnd.getDate() + 1);
      const safeEnd = wEnd > lastDay ? new Date(lastDay) : new Date(wEnd);
      result.push({ start: wStart, end: safeEnd });
      cur = new Date(safeEnd); cur.setDate(cur.getDate() + 1);
      if (cur > lastDay) break;
    }
    return result;
  }, [year, month]);

  const catMap = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return m;
  }, [monthTxs]);

  const section = (title: string, children: React.ReactNode) => (
    <div className="ms-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
      <div style={{
        padding: '8px 14px',
        background: 'var(--ms-surface-2)',
        borderBottom: '1px solid var(--ms-border)',
        fontSize: 13, fontWeight: 600, color: 'var(--ms-text-1)',
      }}>
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 18, background: 'var(--ms-blue)' }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ms-text-1)' }}>월말 정산</span>
      </div>

      <DateNav
        label={monthLabel}
        onPrev={() => setOffset(o => o - 1)}
        onNext={() => setOffset(o => o + 1)}
      />

      <SummaryBar
        income={totalIncome}
        expense={totalExpense}
        incomeLabel="월 수입"
        expenseLabel="월 지출"
        balanceLabel="월 잔액"
      />

      {/* 주별 정산 */}
      {section('주별 정산',
        <table className="ms-table">
          <thead>
            <tr>
              <th>주차</th>
              <th style={{ textAlign: 'right' }}>수입</th>
              <th style={{ textAlign: 'right' }}>지출</th>
              <th style={{ textAlign: 'right' }}>잔액</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, i) => {
              const txs  = monthTxs.filter(t => {
                const td = new Date(t.date + 'T00:00:00');
                return td >= w.start && td <= w.end;
              });
              const winc = sumBy(txs, 'income');
              const wexp = sumBy(txs, 'expense');
              const wbal = winc - wexp;
              return (
                <tr key={i}>
                  <td>
                    <b>{i + 1}주차</b>
                    <span style={{ marginLeft: 6, color: 'var(--ms-text-3)', fontSize: 12 }}>
                      ({w.start.getDate()}~{w.end.getDate()}일)
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--ms-green)', fontVariantNumeric: 'tabular-nums', fontWeight: winc ? 600 : 400 }}>
                    {winc ? formatMoney(winc) : '-'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--ms-red)', fontVariantNumeric: 'tabular-nums', fontWeight: wexp ? 600 : 400 }}>
                    {wexp ? formatMoney(wexp) : '-'}
                  </td>
                  <td style={{
                    textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: wbal >= 0 ? 'var(--ms-blue)' : 'var(--ms-red)',
                  }}>
                    {wbal >= 0 ? '+' : '-'}{formatMoney(wbal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="ms-table-total">
              <td>월 합계</td>
              <td style={{ textAlign: 'right', color: 'var(--ms-green)', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(totalIncome)}</td>
              <td style={{ textAlign: 'right', color: 'var(--ms-red)', fontVariantNumeric: 'tabular-nums' }}>{formatMoney(totalExpense)}</td>
              <td style={{
                textAlign: 'right', fontVariantNumeric: 'tabular-nums',
                color: totalIncome - totalExpense >= 0 ? 'var(--ms-blue)' : 'var(--ms-red)',
              }}>
                {totalIncome - totalExpense >= 0 ? '+' : '-'}{formatMoney(totalIncome - totalExpense)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      {/* 카테고리 */}
      {section('카테고리별 지출',
        <div style={{ padding: 16 }}>
          <CategoryChart data={catMap} total={totalExpense} />
        </div>
      )}

      {/* 달력 */}
      {section('일별 지출 달력',
        <div style={{ padding: 12 }}>
          <MonthCalendar year={year} month={month} transactions={monthTxs} />
        </div>
      )}
    </div>
  );
}
