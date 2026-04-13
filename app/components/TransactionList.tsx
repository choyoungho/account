'use client';

import { Transaction, CAT_ICONS, formatMoney, toLocalISO } from '@/lib/budget';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const today = toLocalISO(new Date());

  const grouped = new Map<string, Transaction[]>();
  [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .forEach(t => {
      const arr = grouped.get(t.date) ?? [];
      arr.push(t);
      grouped.set(t.date, arr);
    });

  if (grouped.size === 0) {
    return (
      <div className="ms-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>📋</div>
        <p style={{ color: 'var(--ms-text-3)', fontSize: 13 }}>
          아직 기록된 내역이 없습니다.<br />
          위 폼에서 첫 번째 내역을 추가해보세요!
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from(grouped.entries()).map(([date, txs]) => {
        const d = new Date(date + 'T00:00:00');
        const isToday = date === today;
        const dateLabel = isToday
          ? `오늘  ${d.getMonth() + 1}/${d.getDate()} (${DAY_NAMES[d.getDay()]})`
          : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${DAY_NAMES[d.getDay()]})`;

        const dayIncome  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const dayExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        return (
          <div key={date} className="ms-card" style={{ overflow: 'hidden' }}>
            {/* 날짜 헤더 */}
            <div style={{
              padding: '7px 14px',
              background: isToday ? 'var(--ms-blue-xlight)' : 'var(--ms-surface-2)',
              borderBottom: `1px solid ${isToday ? 'var(--ms-blue-light)' : 'var(--ms-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{
                fontSize: 12, fontWeight: 600,
                color: isToday ? 'var(--ms-blue)' : 'var(--ms-text-2)',
              }}>
                {isToday && (
                  <span style={{
                    marginRight: 6, background: 'var(--ms-blue)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 1,
                  }}>TODAY</span>
                )}
                {dateLabel}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ms-text-3)' }}>
                {dayIncome > 0 && <span style={{ color: 'var(--ms-green)', marginRight: 8 }}>+{formatMoney(dayIncome)}</span>}
                {dayExpense > 0 && <span style={{ color: 'var(--ms-red)' }}>-{formatMoney(dayExpense)}</span>}
              </span>
            </div>

            {/* 거래 목록 — MS DetailsList 스타일 */}
            <table className="ms-table" style={{ margin: 0 }}>
              <tbody>
                {txs.map((t, i) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: i < txs.length - 1 ? '1px solid var(--ms-border)' : 'none' }}
                  >
                    {/* 아이콘 */}
                    <td style={{ width: 40, padding: '8px 8px 8px 14px' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 2,
                        background: t.type === 'income' ? 'var(--ms-green-light)' : 'var(--ms-red-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14,
                      }}>
                        {CAT_ICONS[t.category] ?? (t.type === 'income' ? '↑' : '↓')}
                      </div>
                    </td>

                    {/* 설명 */}
                    <td style={{ padding: '8px 8px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ms-text-1)' }}>
                        {t.desc}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ms-text-3)', marginTop: 1 }}>
                        {t.category} · {t.time}
                      </div>
                    </td>

                    {/* 금액 */}
                    <td style={{ padding: '8px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      <span style={{
                        fontSize: 14, fontWeight: 700,
                        color: t.type === 'income' ? 'var(--ms-green)' : 'var(--ms-red)',
                      }}>
                        {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                      </span>
                    </td>

                    {/* 삭제 */}
                    <td style={{ width: 40, padding: '8px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => onDelete(t.id)}
                        title="삭제"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--ms-text-3)', fontSize: 14, padding: '2px 4px',
                          borderRadius: 2, lineHeight: 1,
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ms-red)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ms-text-3)')}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
