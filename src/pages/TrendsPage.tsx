import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppContextType } from '../App';
import type { Transaction } from '../types';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import { formatCurrency } from '../lib/helpers';

export default function TrendsPage() {
  const { transactions } = useOutletContext<AppContextType>();

  const trendsData = useMemo(() => {
    const monthsMap = new Map<string, { month: string; income: number; expense: number }>();

    const sortedTransactions = [...transactions].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

    sortedTransactions.forEach((tx: Transaction) => {
      const monthKey = format(startOfMonth(parseISO(tx.date)), 'yyyy-MM');
      const monthLabel = format(startOfMonth(parseISO(tx.date)), 'MMM yyyy');

      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, { month: monthLabel, income: 0, expense: 0 });
      }

      const monthData = monthsMap.get(monthKey)!;

      if (tx.type === 'income') {
        monthData.income += tx.totalAmount;
      } else {
        monthData.expense += tx.totalAmount;
      }
    });

    return Array.from(monthsMap.values());
  }, [transactions]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-8">Trends</h1>

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl h-[500px]">
        <h3 className="text-xl font-semibold text-white mb-4">Income vs. Expense Over Time</h3>
        {trendsData.length < 2 ? (
           <p className="text-slate-400 h-full flex items-center justify-center">Not enough data to display a trend.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendsData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" angle={-45} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" tickFormatter={(val) => formatCurrency(val)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}