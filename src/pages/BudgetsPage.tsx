import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppContextType } from '../App';
import type { Budget, Transaction, Category } from '../types';
import { formatCurrency } from '../lib/helpers';
import CustomSelect from '../components/CustomSelect';
import { format, parse, parseISO } from 'date-fns';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function BudgetsPage() {
  const { budgets, addBudget, deleteBudget, categories, transactions } =
    useOutletContext<AppContextType>();

  const [currentMonth, setCurrentMonth] = useState(() => format(new Date(), 'yyyy-MM'));
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [amount, setAmount] = useState('');
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  const expenseCategories = useMemo((): string[] => {
    const uniqueCategories = new Set<string>();
    transactions.forEach((t: Transaction) => {
      if (t.type === 'expense') {
        t.splits.forEach(split => uniqueCategories.add(split.category));
      }
    });
    categories.forEach((cat: Category) => uniqueCategories.add(cat.name));
    return Array.from(uniqueCategories);
  }, [transactions, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0 || !category) {
      alert('Please enter a valid amount and category.');
      return;
    }
    addBudget(category, numericAmount, currentMonth, editingBudgetId || undefined);
    setAmount('');
    setCategory(categories[0]?.name || '');
    setEditingBudgetId(null);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudgetId(budget.id);
    setCategory(budget.category);
    setAmount(budget.amount.toString());
    setCurrentMonth(budget.month);
  };

  const openDeleteModal = (id: string) => {
    setSelectedBudgetId(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedBudgetId(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedBudgetId) {
      deleteBudget(selectedBudgetId);
    }
    closeDeleteModal(); // Close modal after confirm
  };

  const budgetsForMonth = useMemo(() => {
    return budgets.filter((b: Budget) => b.month === currentMonth);
  }, [budgets, currentMonth]);

  const isSameMonth = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
  };

  const spendingForBudgets = useMemo(() => {
    const spendingMap = new Map<string, number>();
    const monthStart = parse(currentMonth, 'yyyy-MM', new Date());

    transactions.forEach((tx: Transaction) => {
      if (tx.type === 'expense' && isSameMonth(parseISO(tx.date), monthStart)) {
        tx.splits.forEach(split => {
          const currentSpending = spendingMap.get(split.category) || 0;
          spendingMap.set(split.category, currentSpending + split.amount);
        });
      }
    });
    return spendingMap;
  }, [transactions, currentMonth]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Budgets</h1>

      <div className="mb-4">
        <label htmlFor="month-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Month</label>
        <input type="month" id="month-select" value={currentMonth} onChange={(e) => setCurrentMonth(e.target.value)} className="mt-1 block w-full md:w-1/2 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{editingBudgetId ? 'Update Budget' : `Add New Budget for ${format(parse(currentMonth, 'yyyy-MM', new Date()), 'MMMM yyyy')}`}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="budget-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
            <CustomSelect value={category} onChange={(val) => setCategory(val || '')} options={expenseCategories} placeholder="Select Category" />
          </div>
          <div>
            <label htmlFor="budget-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
            <input type="number" id="budget-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white"/>
          </div>
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-md text-white text-sm font-medium">{editingBudgetId ? 'Update Budget' : 'Add Budget'}</button>
        {editingBudgetId && <button type="button" onClick={() => { setEditingBudgetId(null); setAmount(''); setCategory(categories[0]?.name || ''); }} className="w-full py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-slate-700 dark:text-slate-300 text-sm font-medium">Cancel Edit</button>}
      </form>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Your Budgets for {format(parse(currentMonth, 'yyyy-MM', new Date()), 'MMMM yyyy')}</h3>
        {budgetsForMonth.length === 0 ? (
          <p className="text-center py-10 text-slate-500 dark:text-slate-400">No budgets set for this month.</p>
        ) : (
          budgetsForMonth.map((budget: Budget) => {
            const spent = spendingForBudgets.get(budget.category) || 0;
            const remaining = budget.amount - spent;
            const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0;
            const variance = spent - budget.amount;
            
            let progressColor = 'bg-green-500';
            if (progress > 75) progressColor = 'bg-yellow-500';
            if (progress >= 100) progressColor = 'bg-red-500';

            return (
              <div key={budget.id} className="text-slate-800 dark:text-white p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-lg">{budget.category}</span>
                  <div className="flex gap-3 items-center">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{formatCurrency(spent)} / {formatCurrency(budget.amount)}</span>
                    <button onClick={() => handleEdit(budget)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"><PencilSquareIcon className="h-5 w-5"/></button>
                    <button onClick={() => openDeleteModal(budget.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 mb-2 overflow-hidden">
                  <div className={`h-4 rounded-full ${progressColor} transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                </div>
                <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                  {variance > 0 ? (
                    <span className="text-red-500 dark:text-red-400">{formatCurrency(variance)} over budget</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">{formatCurrency(Math.abs(remaining))} remaining</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Delete Budget" message="Are you sure you want to delete this budget?" />
    </div>
  );
}