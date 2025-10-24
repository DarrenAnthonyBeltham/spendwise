import { useState } from 'react';
import type { Transaction } from '../App';
import CustomSelect from './CustomSelect';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  categories: string[];
  addCategory: (newCategory: string) => boolean;
}

const TransactionForm = ({
  addTransaction,
  categories,
  addCategory,
}: TransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    addTransaction({
      amount: numericAmount,
      category,
      date,
      type,
    });

    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(categories[0]);
    setType('expense');
  };

  const handleAddNewCategory = () => {
    const success = addCategory(newCategory);
    if (success) {
      setCategory(newCategory.trim());
      setNewCategory('');
    } else {
      alert('Category is empty or already exists.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 p-6 rounded-xl shadow-2xl space-y-4 w-full"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Add New Transaction</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            required
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-300">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300">
            Category
          </label>
          <CustomSelect
            value={category}
            onChange={(val) => setCategory(val || categories[0])}
            options={categories}
            placeholder="Select Category"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-300">
            Type
          </label>
          <CustomSelect
            value={type}
            onChange={(val) => setType((val as 'income' | 'expense') || 'expense')}
            options={['expense', 'income']}
          />
        </div>
      </div>

      <div className="pt-2">
        <label
          htmlFor="new-category"
          className="block text-sm font-medium text-slate-300"
        >
          Add New Category
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            id="new-category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. 'Investments'"
            className="block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
          <button
            type="button"
            onClick={handleAddNewCategory}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-800 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 transition-colors mt-4"
      >
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionForm;