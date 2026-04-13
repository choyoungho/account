'use client';

import { useState } from 'react';
import { TxType, INCOME_CATS, EXPENSE_CATS, toLocalISO } from '@/lib/budget';

interface TransactionFormProps {
  onAdd: (payload: {
    type: TxType;
    date: string;
    amount: number;
    category: string;
    desc: string;
  }) => void;
}

export default function TransactionForm({ onAdd }: TransactionFormProps) {
  const [type, setType] = useState<TxType>('income');
  const [date, setDate] = useState(toLocalISO(new Date()));
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(INCOME_CATS[0]);
  const [desc, setDesc] = useState('');

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  function handleTypeChange(t: TxType) {
    setType(t);
    setCategory(t === 'income' ? INCOME_CATS[0] : EXPENSE_CATS[0]);
  }

  function handleSubmit() {
    if (!date) { alert('날짜를 입력해주세요.'); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { alert('올바른 금액을 입력해주세요.'); return; }
    onAdd({ type, date, amount: amt, category, desc: desc.trim() || category });
    setAmount('');
    setDesc('');
  }

  const isIncome = type === 'income';

  return (
    <div className="ms-card" style={{ marginBottom: 16 }}>
      {/* 섹션 헤더 */}
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid var(--ms-border)',
        background: 'var(--ms-surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ms-text-1)' }}>
          내역 추가
        </span>
        {/* 수입/지출 토글 — MS ChoiceGroup 스타일 */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid var(--ms-border-2)', borderRadius: 2, overflow: 'hidden' }}>
          {(['income', 'expense'] as TxType[]).map(t => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              style={{
                padding: '4px 14px',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
                cursor: 'pointer',
                border: 'none',
                borderRight: t === 'income' ? '1px solid var(--ms-border-2)' : 'none',
                background: type === t
                  ? (t === 'income' ? 'var(--ms-green)' : 'var(--ms-red)')
                  : 'var(--ms-surface)',
                color: type === t ? '#fff' : 'var(--ms-text-2)',
                transition: 'background .1s, color .1s',
              }}
            >
              {t === 'income' ? '↑ 수입' : '↓ 지출'}
            </button>
          ))}
        </div>
      </div>

      {/* 폼 바디 */}
      <div style={{ padding: 16 }}>
        {/* 좌측 강조 바 */}
        <div style={{
          borderLeft: `3px solid ${isIncome ? 'var(--ms-green)' : 'var(--ms-red)'}`,
          paddingLeft: 12,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label className="ms-label">날짜</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="ms-input"
              />
            </div>
            <div>
              <label className="ms-label">금액 (원)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                className="ms-input"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label className="ms-label">카테고리</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="ms-input"
              >
                {cats.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="ms-label">내용</label>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="간단한 설명"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="ms-input"
              />
            </div>
          </div>

          <button
            className="ms-btn-primary"
            onClick={handleSubmit}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '8px 16px',
              background: isIncome ? 'var(--ms-green)' : 'var(--ms-red)',
              borderColor: isIncome ? 'var(--ms-green)' : 'var(--ms-red)',
            }}
          >
            {isIncome ? '↑' : '↓'} 추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
