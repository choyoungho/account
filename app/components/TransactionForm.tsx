'use client';

import { useState } from 'react';
import {
  TxType,
  INCOME_CATS,
  EXPENSE_CATS,
  toLocalISO,
} from '@/lib/budget';

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

  return (
    <div className="bg-white rounded-xl p-5 mb-4 shadow-sm">
      <h2 className="text-base font-bold text-gray-600 mb-3 flex items-center gap-1.5">
        ➕ 내역 추가
      </h2>

      {/* 유형 토글 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => handleTypeChange('income')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
            type === 'income'
              ? 'bg-green-50 border-green-500 text-green-700'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          💚 수입
        </button>
        <button
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
            type === 'expense'
              ? 'bg-red-50 border-red-500 text-red-600'
              : 'bg-white border-gray-200 text-gray-500'
          }`}
        >
          ❤️ 지출
        </button>
      </div>

      {/* 날짜 & 금액 */}
      <div className="grid grid-cols-2 gap-2.5 mb-2.5">
        <div>
          <label className="block text-xs text-gray-500 font-semibold mb-1">날짜</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold mb-1">금액 (원)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-colors"
          />
        </div>
      </div>

      {/* 카테고리 & 내용 */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div>
          <label className="block text-xs text-gray-500 font-semibold mb-1">카테고리</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-colors"
          >
            {cats.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 font-semibold mb-1">내용</label>
          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="간단한 설명"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm bg-gray-50 focus:border-indigo-500 focus:bg-white outline-none transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 text-white font-bold rounded-lg text-sm transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
      >
        추가하기
      </button>
    </div>
  );
}
