'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { getWeekStart, getWeekDates, sumBy, formatMoney, toLocalISO } from '@/lib/budget';
import SummaryBar from './SummaryBar';
import CategoryChart from './CategoryChart';
import DateNav from './DateNav';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function WeeklyTab() {
  const { transactions, today } = useTransactions();
  const [offset, setOffset] = useState(0);

  const ws = getWeekStart(offset);
  const we = new Date(ws); we.setDate(ws.getDate() + 6);
  const weekLabel = `${ws.getFullYear()}년 ${ws.getMonth() + 1}월 ${ws.getDate()}일 ~ ${we.getMonth() + 1}월 ${we.getDate()}일`;
  const dates = getWeekDates(offset);

  const weekTxs = useMemo(
    () => transactions.filter(t => t.date >= dates[0] && t.date <= dates[6]),
    [transactions, dates]
  );

  const totalIncome  = sumBy(weekTxs, 'income');
  const totalExpense = sumBy(weekTxs, 'expense');

  const catMap = useMemo(() => {
    const m: Record<string, number> = {};
    weekTxs.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return m;
  }, [weekTxs]);

  return (
    <div>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 18, background: 'var(--ms-blue)' }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ms-text-1)' }}>주간 정산</span>
      </div>

      <DateNav
        label={weekLabel}
        onPrev={() => setOffset(o => o - 1)}
        onNext={() => setOffset(o => o + 1)}
      />

      <SummaryBar
        income={totalIncome}
        expense={totalExpense}
        incomeLabel="주간 수입"
        expenseLabel="주간 지출"
        balanceLabel="주간 잔액"
      />

      {/* 일별 테이블 */}
      <div className="ms-card" style={{ marginBottom: 12, overflow: 'hidden' }}>
        <div style={{
          padding: '8px 14px',
          background: 'var(--ms-surface-2)',
          borderBottom: '1px solid var(--ms-border)',
          fontSize: 13, fontWeight: 600, color: 'var(--ms-text-1)',
        }}>
          일별 수입·지출
        </div>
        <table className="ms-table">
          <thead>
            <tr>
              <th>날짜</th>
              <th style={{ textAlign: 'right' }}>수입</th>
              <th style={{ textAlign: 'right' }}>지출</th>
              <th style={{ textAlign: 'right' }}>잔액</th>
            </tr>
          </thead>
          <tbody>
            {dates.map(dateStr => {
              const txs = transactions.filter(t => t.date === dateStr);
              const inc = sumBy(txs, 'income');
              const exp = sumBy(txs, 'expense');
              const bal = inc - exp;
              const d = new Date(dateStr + 'T00:00:00');
              const isToday = dateStr === today;
              const dow = d.getDay();
              const dayColor = dow === 6 ? 'var(--ms-red)' : dow === 0 ? 'var(--ms-blue)' : 'inherit';

              return (
                <tr key={dateStr} style={isToday ? { background: 'var(--ms-blue-xlight)' } : {}}>
                  <td style={{ color: dayColor }}>
                    {isToday && (
                      <span style={{
                        marginRight: 6, background: 'var(--ms-blue)', color: '#fff',
                        fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 1,
                      }}>TODAY</span>
                    )}
                    <span style={{ fontWeight: isToday ? 700 : 400 }}>
                      {d.getMonth() + 1}/{d.getDate()} ({DAY_NAMES[dow]})
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--ms-green)', fontVariantNumeric: 'tabular-nums', fontWeight: inc ? 600 : 400 }}>
                    {inc ? formatMoney(inc) : '-'}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--ms-red)', fontVariantNumeric: 'tabular-nums', fontWeight: exp ? 600 : 400 }}>
                    {exp ? formatMoney(exp) : '-'}
                  </td>
                  <td style={{
                    textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                    color: bal >= 0 ? 'var(--ms-blue)' : 'var(--ms-red)',
                  }}>
                    {bal >= 0 ? '+' : ''}{formatMoney(bal) !== '₩0' || bal === 0 ? (bal >= 0 ? '' : '-') + formatMoney(bal) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="ms-table-total">
              <td style={{ fontWeight: 700 }}>합계</td>
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
      </div>

      {/* 카테고리 차트 */}
      <div className="ms-card" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '8px 14px',
          background: 'var(--ms-surface-2)',
          borderBottom: '1px solid var(--ms-border)',
          fontSize: 13, fontWeight: 600, color: 'var(--ms-text-1)',
        }}>
          카테고리별 지출
        </div>
        <div style={{ padding: 16 }}>
          <CategoryChart data={catMap} total={totalExpense} />
        </div>
      </div>
    </div>
  );
}
