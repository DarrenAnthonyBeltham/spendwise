import { useMemo } from 'react';
import { useAppOutletContext } from '../App';
import type { Transaction } from '../types';
import { format, parseISO, startOfMonth } from 'date-fns';
import { formatCurrency } from '../lib/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function ReportsPage() {
  const { transactions, theme } = useAppOutletContext();

  const monthlySummary = useMemo(() => {
    const monthsMap = new Map<string, { month: string; income: number; expense: number; net: number }>();
    const sortedTransactions = [...transactions].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
    sortedTransactions.forEach((tx: Transaction) => {
      const monthKey = format(startOfMonth(parseISO(tx.date)), 'yyyy-MM'); const monthLabel = format(startOfMonth(parseISO(tx.date)), 'MMM yyyy');
      if (!monthsMap.has(monthKey)) { monthsMap.set(monthKey, { month: monthLabel, income: 0, expense: 0, net: 0 }); }
      const monthData = monthsMap.get(monthKey)!;
      if (tx.type === 'income') { monthData.income += tx.totalAmount; } else { monthData.expense += tx.totalAmount; }
      monthData.net = monthData.income - monthData.expense;
    }); return Array.from(monthsMap.values());
  }, [transactions]);

  const tooltipBackgroundColor = theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)';
  const tooltipBorderColor = theme === 'dark' ? '#334155' : '#cbd5e1';
  const textLabelColor = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const axisStrokeColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridStrokeColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const legendColor = theme === 'dark' ? '#94a3b8' : '#334155';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Reports</h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Monthly Net Income/Loss</h3>
        {monthlySummary.length < 1 ? (
          <p className="text-slate-500 dark:text-slate-400 h-[300px] flex items-center justify-center">Add transactions to generate reports.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySummary} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
              <XAxis dataKey="month" stroke={axisStrokeColor} />
              <YAxis stroke={axisStrokeColor} tickFormatter={(val) => formatCurrency(val)} />
              <Tooltip
                contentStyle={{ backgroundColor: tooltipBackgroundColor, borderColor: tooltipBorderColor, borderRadius: '0.5rem' }}
                itemStyle={{ color: textLabelColor }}
                labelStyle={{ color: textLabelColor, fontWeight: 'bold' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px' }} />
              <Bar dataKey="net" name="Net Income/Loss" fill="#8884d8">
                {monthlySummary.map((entry) => (<Cell key={`cell-${entry.month}`} fill={entry.net >= 0 ? '#16a34a' : '#dc2626'} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
         <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">More Reports Coming Soon...</h3>
         <p className="text-slate-600 dark:text-slate-400">Future reports could include Spending by Category Over Time, etc.</p>
       </div>
    </div>
  );
}