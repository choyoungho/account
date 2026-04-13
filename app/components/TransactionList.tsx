'use client';

import { Transaction, CAT_ICONS, formatMoney, toLocalISO } from '@/lib/budget';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: number) => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const today = toLocalISO(new Date());
  const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜별 그룹핑 (최신순)
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
      <div className="text-center py-10 text-gray-300">
        <div className="text-4xl mb-2.5">📭</div>
        <p className="text-sm">아직 기록된 내역이 없습니다.<br />첫 번째 내역을 추가해보세요!</p>
      </div>
    );
  }

  return (
    <div>
      {Array.from(grouped.entries()).map(([date, txs]) => {
        const d = new Date(date + 'T00:00:00');
        const isToday = date === today;
        const dateLabel = isToday
          ? `오늘 (${d.getMonth() + 1}/${d.getDate()} ${DAY_NAMES[d.getDay()]})`
          : `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${DAY_NAMES[d.getDay()]}`;

        return (
          <div key={date} className="mb-2">
            <div className="text-xs text-gray-400 font-bold py-1.5 tracking-wide">
              {dateLabel}
            </div>
            {txs.map(t => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-3.5 py-3 bg-white rounded-xl mb-1.5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* 아이콘 */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: t.type === 'income' ? '#ebfaf1' : '#fff5f5' }}
                >
                  {CAT_ICONS[t.category] ?? (t.type === 'income' ? '💚' : '❤️')}
                </div>

                {/* 설명 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{t.desc}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{t.category}</div>
                </div>

                {/* 금액 */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="text-sm font-bold"
                    style={{ color: t.type === 'income' ? '#38a169' : '#e53e3e' }}
                  >
                    {t.type === 'income' ? '+' : '-'}{formatMoney(t.amount)}
                  </div>
                  <div className="text-xs text-gray-300 mt-0.5">{t.time}</div>
                </div>

                {/* 삭제 */}
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-gray-300 hover:text-red-400 text-base px-1 transition-colors flex-shrink-0"
                  title="삭제"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
