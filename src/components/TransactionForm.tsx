import { useState } from 'react';
import type { Account, Transaction } from '../types';
import CustomSelect from './CustomSelect';

interface TransactionFormProps {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'totalAmount'>) => void;
  categories: string[];
  addCategory: (newCategory: string) => boolean;
  accounts: Account[];
}

const TransactionForm = ({
  addTransaction,
  categories,
  addCategory,
  accounts,
}: TransactionFormProps) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [newCategory, setNewCategory] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');

  const accountMap = new Map(accounts.map((a: Account) => [a.id, a.name]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (!accountId) {
      alert('Please select or add an account first.');
      return;
    }
     if (!category) {
      alert('Please select or add a category first.');
      return;
    }

    const transactionData: Omit<Transaction, 'id' | 'totalAmount'> = {
      accountId,
      splits: [{ category: category, amount: numericAmount }],
      date,
      type,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      notes: notes.trim() || undefined,
    };

    addTransaction(transactionData);

    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(categories[0] || '');
    setType('expense');
    setTags('');
    setNotes('');
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
    <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl shadow-2xl space-y-4 w-full">
      <h2 className="text-2xl font-bold text-white mb-4">Add New Transaction</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Amount</label>
          <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" required />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-300">Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="account" className="block text-sm font-medium text-slate-300">Account</label>
           <CustomSelect
              value={accountMap.get(accountId) || 'Select Account'}
              onChange={(val) => {
                const id = accounts.find((a: Account) => a.name === val)?.id || '';
                setAccountId(id);
              }}
              options={accounts.map((a: Account) => a.name)}
              placeholder="Select Account"
            />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
          <CustomSelect
            value={category}
            onChange={(val) => setCategory(val || categories[0] || '')}
            options={categories}
            placeholder="Select Category"
          />
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
         <div>
          <label htmlFor="type" className="block text-sm font-medium text-slate-300">Type</label>
          <CustomSelect
            value={type}
            onChange={(val) => setType((val as 'income' | 'expense') || 'expense')}
            options={['expense', 'income']}
          />
        </div>
      </div>
       <div>
         <label htmlFor="tags" className="block text-sm font-medium text-slate-300">Tags (comma-separated)</label>
         <input type="text" id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., vacation, work" className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" />
       </div>
       <div>
         <label htmlFor="notes" className="block text-sm font-medium text-slate-300">Notes</label>
         <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Add any extra details..." className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white"></textarea>
       </div>

      <div className="pt-2">
        <label htmlFor="new-category" className="block text-sm font-medium text-slate-300">Add New Category</label>
        <div className="mt-1 flex gap-2">
          <input type="text" id="new-category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. 'Investments'" className="block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white" />
          <button type="button" onClick={handleAddNewCategory} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Add</button>
        </div>
      </div>

      <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 mt-4">Add Transaction</button>
    </form>
  );
};

export default TransactionForm;