'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  loadTransactions,
  addTransaction,
  deleteTransaction,
  toLocalISO,
} from '@/lib/budget';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadTransactions().then(txs => {
      setTransactions(txs);
      setHydrated(true);
    });
  }, []);

  const add = useCallback(
    async (payload: Omit<Transaction, 'id' | 'time'>) => {
      const time = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      const created = await addTransaction({ ...payload, time });
      if (created) {
        setTransactions(prev => [created, ...prev]);
      }
    },
    []
  );

  const remove = useCallback(async (id: number) => {
    const ok = await deleteTransaction(id);
    if (ok) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  }, []);

  const byDate = useCallback(
    (date: string) => transactions.filter(t => t.date === date),
    [transactions]
  );

  const byDateRange = useCallback(
    (from: string, to: string) =>
      transactions.filter(t => t.date >= from && t.date <= to),
    [transactions]
  );

  const today = toLocalISO(new Date());

  return { transactions, hydrated, add, remove, byDate, byDateRange, today };
}
