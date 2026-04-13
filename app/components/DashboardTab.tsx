'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import {
  getWeekDates,
  sumBy,
  formatMoney,
  toLocalISO,
  CAT_ICONS,
} from '@/lib/budget';

// ─── 색상 팔레트 ──────────────────────────────────────
const PIE_COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#ea580c', '#d97706',
  '#16a34a', '#0891b2', '#0284c7', '#6366f1', '#a855f7', '#ec4899',
];

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

// ─── 커스텀 툴팁 ──────────────────────────────────────
function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-bold text-gray-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.fill }}>
            {formatMoney(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function PieCustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value, percent } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-bold text-gray-700">{CAT_ICONS[name] ?? '📝'} {name}</p>
      <p className="text-gray-600">{formatMoney(value)}</p>
      <p className="text-indigo-500 font-semibold">{(percent * 100).toFixed(1)}%</p>
    </div>
  );
}

// ─── 커스텀 범례 ──────────────────────────────────────
function PieLegend({ data, total }: { data: { name: string; value: number }[]; total: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
          />
          <span className="truncate text-gray-600">
            {CAT_ICONS[d.name] ?? '📝'} {d.name}
          </span>
          <span className="ml-auto font-semibold text-gray-500 flex-shrink-0">
            {total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────
export default function DashboardTab() {
  const { transactions } = useTransactions();

  const today = toLocalISO(new Date());
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // ── 이번 달 거래 ──
  const monthTxs = useMemo(
    () => transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    }),
    [transactions, year, month]
  );

  // ── 이번 주 거래 ──
  const weekDates = useMemo(() => getWeekDates(0), []);
  const weekTxs = useMemo(
    () => transactions.filter(t => t.date >= weekDates[0] && t.date <= weekDates[6]),
    [transactions, weekDates]
  );

  // ── 전체 요약 수치 ──
  const monthIncome  = sumBy(monthTxs, 'income');
  const monthExpense = sumBy(monthTxs, 'expense');
  const monthBalance = monthIncome - monthExpense;
  const weekIncome   = sumBy(weekTxs, 'income');
  const weekExpense  = sumBy(weekTxs, 'expense');

  // ── 주간 막대차트 데이터 (요일별) ──
  const weekBarData = useMemo(() =>
    weekDates.map(dateStr => {
      const txs = transactions.filter(t => t.date === dateStr);
      const d = new Date(dateStr + 'T00:00:00');
      return {
        name: `${DAY_NAMES[d.getDay()]}(${d.getDate()})`,
        수입: sumBy(txs, 'income'),
        지출: sumBy(txs, 'expense'),
        isToday: dateStr === today,
      };
    }),
    [transactions, weekDates, today]
  );

  // ── 월간 막대차트 데이터 (주차별) ──
  const monthBarData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const weeks: { label: string; start: Date; end: Date }[] = [];
    let cur = new Date(firstDay);
    let wi = 1;
    while (cur <= lastDay) {
      const wStart = new Date(cur);
      const wEnd   = new Date(cur);
      while (wEnd.getDay() !== 0 && wEnd < lastDay) wEnd.setDate(wEnd.getDate() + 1);
      const safeEnd = wEnd > lastDay ? new Date(lastDay) : new Date(wEnd);
      weeks.push({ label: `${wi}주차`, start: wStart, end: safeEnd });
      cur = new Date(safeEnd);
      cur.setDate(cur.getDate() + 1);
      wi++;
      if (cur > lastDay) break;
    }
    return weeks.map(w => {
      const txs = monthTxs.filter(t => {
        const td = new Date(t.date + 'T00:00:00');
        return td >= w.start && td <= w.end;
      });
      return {
        name: w.label,
        수입: sumBy(txs, 'income'),
        지출: sumBy(txs, 'expense'),
      };
    });
  }, [monthTxs, year, month]);

  // ── 월간 카테고리별 지출 파이차트 데이터 ──
  const expensePieData = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'expense').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [monthTxs]);

  // ── 월간 수입 파이차트 데이터 ──
  const incomePieData = useMemo(() => {
    const m: Record<string, number> = {};
    monthTxs.filter(t => t.type === 'income').forEach(t => {
      m[t.category] = (m[t.category] ?? 0) + t.amount;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [monthTxs]);

  const yTickFormatter = (v: number) =>
    v >= 10000 ? `${(v / 10000).toFixed(0)}만` : String(v);

  const isEmpty = transactions.length === 0;

  return (
    <div>
      {/* ── 월 요약 카드 ── */}
      <div
        className="rounded-2xl p-5 mb-5 text-white shadow-lg"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        <div className="text-sm opacity-80 mb-1 font-medium">
          {year}년 {month + 1}월 현황
        </div>
        <div className="text-3xl font-bold mb-4">
          {monthBalance < 0 ? '-' : '+'}{formatMoney(monthBalance)}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <div className="text-xs opacity-70 mb-0.5">월 수입</div>
            <div className="text-lg font-bold">{formatMoney(monthIncome)}</div>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-3">
            <div className="text-xs opacity-70 mb-0.5">월 지출</div>
            <div className="text-lg font-bold">{formatMoney(monthExpense)}</div>
          </div>
        </div>
      </div>

      {/* ── 이번 주 요약 ── */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold mb-1">이번 주 수입</div>
          <div className="text-xl font-bold text-green-600">{formatMoney(weekIncome)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-xs text-gray-400 font-semibold mb-1">이번 주 지출</div>
          <div className="text-xl font-bold text-red-500">{formatMoney(weekExpense)}</div>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-16 text-gray-300">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-sm">아직 데이터가 없습니다.<br />일일 입출력 탭에서 내역을 추가해보세요!</p>
        </div>
      ) : (
        <>
          {/* ── 주간 수입/지출 막대차트 ── */}
          <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-600 mb-4">📊 이번 주 일별 수입·지출</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekBarData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#718096' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={yTickFormatter}
                  tick={{ fontSize: 11, fill: '#a0aec0' }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f7f7ff' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar dataKey="수입" fill="#38a169" radius={[4, 4, 0, 0]}>
                  {weekBarData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isToday ? '#276749' : '#38a169'}
                      opacity={entry.isToday ? 1 : 0.75}
                    />
                  ))}
                </Bar>
                <Bar dataKey="지출" fill="#e53e3e" radius={[4, 4, 0, 0]}>
                  {weekBarData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.isToday ? '#c53030' : '#e53e3e'}
                      opacity={entry.isToday ? 1 : 0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── 월간 주차별 막대차트 ── */}
          <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-600 mb-4">
              📅 {month + 1}월 주차별 수입·지출
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthBarData} barCategoryGap="35%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#718096' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={yTickFormatter}
                  tick={{ fontSize: 11, fill: '#a0aec0' }}
                  axisLine={false}
                  tickLine={false}
                  width={38}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f7f7ff' }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Bar dataKey="수입" fill="#38a169" radius={[4, 4, 0, 0]} opacity={0.85} />
                <Bar dataKey="지출" fill="#e53e3e" radius={[4, 4, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── 파이차트 2개 ── */}
          <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
            {/* 지출 파이차트 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-gray-600 mb-2">
                🔴 {month + 1}월 지출 분류
              </h2>
              {expensePieData.length === 0 ? (
                <p className="text-center text-gray-300 text-sm py-8">지출 내역 없음</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={82}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {expensePieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <PieTooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* 중앙 텍스트 대신 총액 */}
                  <p className="text-center text-sm text-gray-500 -mt-2 mb-1">
                    총 지출 <span className="font-bold text-red-500">{formatMoney(monthExpense)}</span>
                  </p>
                  <PieLegend data={expensePieData} total={monthExpense} />
                </>
              )}
            </div>

            {/* 수입 파이차트 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-base font-bold text-gray-600 mb-2">
                🟢 {month + 1}월 수입 분류
              </h2>
              {incomePieData.length === 0 ? (
                <p className="text-center text-gray-300 text-sm py-8">수입 내역 없음</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={incomePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={82}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {incomePieData.map((_, i) => (
                          <Cell
                            key={i}
                            fill={['#38a169','#48bb78','#68d391','#9ae6b4','#c6f6d5','#276749','#2f855a'][i % 7]}
                          />
                        ))}
                      </Pie>
                      <PieTooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-center text-sm text-gray-500 -mt-2 mb-1">
                    총 수입 <span className="font-bold text-green-600">{formatMoney(monthIncome)}</span>
                  </p>
                  <PieLegend data={incomePieData} total={monthIncome} />
                </>
              )}
            </div>
          </div>

          {/* ── 저축률 카드 ── */}
          {monthIncome > 0 && (
            <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
              <h2 className="text-base font-bold text-gray-600 mb-3">💡 이번 달 저축률</h2>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold" style={{ color: '#4f46e5' }}>
                  {Math.max(0, ((monthIncome - monthExpense) / monthIncome * 100)).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-400 mb-1">
                  ({formatMoney(Math.max(0, monthBalance))} 저축)
                </span>
              </div>
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, (monthBalance / monthIncome) * 100))}%`,
                    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
