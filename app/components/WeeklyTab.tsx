'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import {
  getWeekStart,
  getWeekDates,
  sumBy,
  formatMoney,
  toLocalISO,
} from '@/lib/budget';
import SummaryBar from './SummaryBar';
import CategoryChart from './CategoryChart';
import DateNav from './DateNav';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function WeeklyTab() {
  const { transactions, today } = useTransactions();
  const [offset, setOffset] = useState(0);

  const ws = getWeekStart(offset);
  const we = new Date(ws);
  we.setDate(ws.getDate() + 6);

  const weekLabel = `${ws.getMonth() + 1}/${ws.getDate()} ~ ${we.getMonth() + 1}/${we.getDate()}`;
  const dates = getWeekDates(offset);

  const weekTxs = useMemo(
    () => transactions.filter(t => t.date >= dates[0] && t.date <= dates[6]),
    [transactions, dates]
  );

  const totalIncome = sumBy(weekTxs, 'income');
  const totalExpense = sumBy(weekTxs, 'expense');

  // 카테고리별 집계
  const catMap = useMemo(() => {
    const m: Record<string, number> = {};
    weekTxs.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return m;
  }, [weekTxs]);

  return (
    <div>
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
      <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-600 mb-3">📋 일별 내역</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {['날짜', '수입', '지출', '잔액'].map(h => (
                <th key={h} className="text-left px-2.5 py-2 bg-gray-50 text-gray-500 text-xs font-bold border-b-2 border-gray-200">
                  {h}
                </th>
              ))}
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
              const label = `${d.getMonth() + 1}/${d.getDate()} (${DAY_NAMES[d.getDay()]})`;

              return (
                <tr key={dateStr} style={{ background: isToday ? '#f0f0ff' : undefined }}>
                  <td className="px-2.5 py-2.5 border-b border-gray-100">
                    <b>{label}</b>
                    {isToday && (
                      <span className="ml-1.5 text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">오늘</span>
                    )}
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-gray-100 font-semibold text-green-600">
                    {inc ? formatMoney(inc) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-gray-100 font-semibold text-red-500">
                    {exp ? formatMoney(exp) : '-'}
                  </td>
                  <td
                    className="px-2.5 py-2.5 border-b border-gray-100 font-bold"
                    style={{ color: bal >= 0 ? '#4f46e5' : '#e53e3e' }}
                  >
                    {bal >= 0 ? '+' : '-'}{formatMoney(bal)}
                  </td>
                </tr>
              );
            })}

            {/* 합계 행 */}
            <tr>
              <td className="px-2.5 py-2.5 font-bold bg-gray-50 border-t-2 border-gray-200">합계</td>
              <td className="px-2.5 py-2.5 font-bold text-green-600 bg-gray-50 border-t-2 border-gray-200">
                {formatMoney(totalIncome)}
              </td>
              <td className="px-2.5 py-2.5 font-bold text-red-500 bg-gray-50 border-t-2 border-gray-200">
                {formatMoney(totalExpense)}
              </td>
              <td
                className="px-2.5 py-2.5 font-bold bg-gray-50 border-t-2 border-gray-200"
                style={{ color: totalIncome - totalExpense >= 0 ? '#4f46e5' : '#e53e3e' }}
              >
                {totalIncome - totalExpense >= 0 ? '+' : '-'}{formatMoney(totalIncome - totalExpense)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 카테고리 차트 */}
      <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-600 mb-3">📊 카테고리별 지출</h2>
        <CategoryChart data={catMap} total={totalExpense} />
      </div>
    </div>
  );
}
