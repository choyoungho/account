'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Transaction,
  TxType,
  loadTransactions,
  saveTransactions,
  toLocalISO,
} from '@/lib/budget';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
    setHydrated(true);
  }, []);

  const add = useCallback(
    (payload: Omit<Transaction, 'id' | 'time'>) => {
      const tx: Transaction = {
        ...payload,
        id: Date.now(),
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setTransactions(prev => {
        const next = [...prev, tx];
        saveTransactions(next);
        return next;
      });
    },
    []
  );

  const remove = useCallback((id: number) => {
    setTransactions(prev => {
      const next = prev.filter(t => t.id !== id);
      saveTransactions(next);
      return next;
    });
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
