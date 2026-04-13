'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { sumBy, formatMoney, toLocalISO } from '@/lib/budget';
import SummaryBar from './SummaryBar';
import CategoryChart from './CategoryChart';
import MonthCalendar from './MonthCalendar';
import DateNav from './DateNav';

export default function MonthlyTab() {
  const { transactions } = useTransactions();
  const [offset, setOffset] = useState(0);

  const base = new Date();
  const target = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  const year = target.getFullYear();
  const month = target.getMonth(); // 0-indexed

  const monthLabel = `${year}년 ${month + 1}월`;

  const monthTxs = useMemo(
    () =>
      transactions.filter(t => {
        const d = new Date(t.date + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      }),
    [transactions, year, month]
  );

  const totalIncome = sumBy(monthTxs, 'income');
  const totalExpense = sumBy(monthTxs, 'expense');

  // ─── 주차별 정산 ──────────────────────────────────────
  const weeks = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const result: { start: Date; end: Date }[] = [];
    let cur = new Date(firstDay);

    while (cur <= lastDay) {
      const wStart = new Date(cur);
      const wEnd = new Date(cur);
      while (wEnd.getDay() !== 0 && wEnd < lastDay) wEnd.setDate(wEnd.getDate() + 1);
      if (wEnd > lastDay) { /* trim */ }
      result.push({ start: new Date(wStart), end: new Date(wEnd > lastDay ? lastDay : wEnd) });
      cur = new Date(wEnd > lastDay ? lastDay : wEnd);
      cur.setDate(cur.getDate() + 1);
      if (cur > lastDay) break;
    }
    return result;
  }, [year, month]);

  // 카테고리별 집계
  const catMap = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return m;
  }, [monthTxs]);

  return (
    <div>
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
      <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-600 mb-3">📅 주별 정산</h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {['주차', '수입', '지출', '잔액'].map(h => (
                <th key={h} className="text-left px-2.5 py-2 bg-gray-50 text-gray-500 text-xs font-bold border-b-2 border-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((w, i) => {
              const txs = monthTxs.filter(t => {
                const td = new Date(t.date + 'T00:00:00');
                return td >= w.start && td <= w.end;
              });
              const winc = sumBy(txs, 'income');
              const wexp = sumBy(txs, 'expense');
              const wbal = winc - wexp;
              return (
                <tr key={i}>
                  <td className="px-2.5 py-2.5 border-b border-gray-100">
                    <b>{i + 1}주차</b>
                    <span className="text-xs text-gray-400 ml-1">
                      ({w.start.getDate()}~{w.end.getDate()}일)
                    </span>
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-gray-100 font-semibold text-green-600">
                    {winc ? formatMoney(winc) : '-'}
                  </td>
                  <td className="px-2.5 py-2.5 border-b border-gray-100 font-semibold text-red-500">
                    {wexp ? formatMoney(wexp) : '-'}
                  </td>
                  <td
                    className="px-2.5 py-2.5 border-b border-gray-100 font-bold"
                    style={{ color: wbal >= 0 ? '#4f46e5' : '#e53e3e' }}
                  >
                    {wbal >= 0 ? '+' : '-'}{formatMoney(wbal)}
                  </td>
                </tr>
              );
            })}

            {/* 합계 */}
            <tr>
              <td className="px-2.5 py-2.5 font-bold bg-gray-50 border-t-2 border-gray-200">월 합계</td>
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
        <h2 className="text-base font-bold text-gray-600 mb-3">📋 카테고리별 월 지출</h2>
        <CategoryChart data={catMap} total={totalExpense} />
      </div>

      {/* 달력 */}
      <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
        <h2 className="text-base font-bold text-gray-600 mb-3">📆 일별 지출 달력</h2>
        <MonthCalendar year={year} month={month} transactions={monthTxs} />
      </div>
    </div>
  );
}
