import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Transaction } from '../types';
import { formatCurrency } from '../lib/helpers';

interface SummaryChartsProps {
  transactions: Transaction[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#E36397',
];

const SummaryCharts = ({ transactions }: SummaryChartsProps) => {
  const expenseData = useMemo(() => {
    const expenseMap = new Map<string, number>();
    transactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        tx.splits.forEach(split => {
          const currentAmount = expenseMap.get(split.category) || 0;
          expenseMap.set(split.category, currentAmount + split.amount);
        });
      });
    return Array.from(expenseMap, ([name, value]) => ({ name, value }));
  }, [transactions]);

  const incomeVsExpenseData = useMemo(() => {
    const totals = transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') {
          acc.income += tx.totalAmount; 
        } else {
          acc.expense += tx.totalAmount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
    return [
      { name: 'Income', value: totals.income },
      { name: 'Expense', value: totals.expense },
    ];
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          Expenses by Category
        </h3>
        {expenseData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%" cy="50%" labelLine={false} outerRadius={110} fill="#8884d8" dataKey="value"
              >
                {expenseData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend wrapperStyle={{ color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-slate-400 h-[300px] flex items-center justify-center">
            No expense data to display.
          </p>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          Income vs. Expense
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={incomeVsExpenseData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(val) => formatCurrency(val)} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
              itemStyle={{ color: '#f1f5f9' }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend wrapperStyle={{ color: '#f1f5f9' }} />
            <Bar dataKey="value" fill="#8884d8">
              <Cell key="income" fill="#22c55e" />
              <Cell key="expense" fill="#ef4444" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SummaryCharts;