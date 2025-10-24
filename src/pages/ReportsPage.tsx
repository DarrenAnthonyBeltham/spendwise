import { useMemo } from 'react';
import { useAppOutletContext } from '../App';
import type { Transaction } from '../types';
import { format, parseISO, startOfMonth } from 'date-fns';
import { formatCurrency } from '../lib/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ReportsPage() {
  const { transactions } = useAppOutletContext();

  const monthlySummary = useMemo(() => {
    const monthsMap = new Map<string, { month: string; income: number; expense: number; net: number }>();
    const sortedTransactions = [...transactions].sort(
      (a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );

    sortedTransactions.forEach((tx: Transaction) => {
      const monthKey = format(startOfMonth(parseISO(tx.date)), 'yyyy-MM');
      const monthLabel = format(startOfMonth(parseISO(tx.date)), 'MMM yyyy');

      if (!monthsMap.has(monthKey)) {
        monthsMap.set(monthKey, { month: monthLabel, income: 0, expense: 0, net: 0 });
      }
      const monthData = monthsMap.get(monthKey)!;

      if (tx.type === 'income') {
        monthData.income += tx.totalAmount;
      } else {
        monthData.expense += tx.totalAmount;
      }
      monthData.net = monthData.income - monthData.expense;
    });
    return Array.from(monthsMap.values());
  }, [transactions]);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-8">Reports</h1>

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Monthly Net Income/Loss</h3>
        {monthlySummary.length < 2 ? (
          <p className="text-slate-400 h-[300px] flex items-center justify-center">Add transactions over multiple months to see a report.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySummary} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" tickFormatter={(val) => formatCurrency(val)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ color: '#f1f5f9' }} />
              <Bar dataKey="net" name="Net Income/Loss" fill="#8884d8">
                {monthlySummary.map((entry) => (
                  <Cell key={`cell-${entry.month}`} fill={entry.net >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

       <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
         <h3 className="text-xl font-semibold text-white mb-4">More Reports Coming Soon...</h3>
         <p className="text-slate-400">Future reports could include:</p>
         <ul className="list-disc list-inside text-slate-400 pl-4 mt-2">
           <li>Spending Over Time by Category</li>
           <li>Detailed Income vs. Expense Table</li>
           <li>Category-Specific Spending Trends</li>
         </ul>
       </div>
    </div>
  );
}

import { Cell } from 'recharts';