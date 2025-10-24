import { useState } from 'react';
import { useAppOutletContext } from '../App';
import type { RecurringTransaction, Account } from '../types';
import CustomSelect from '../components/CustomSelect';
import { formatCurrency } from '../lib/helpers';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function RecurringPage() {
  const {
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    postRecurringTransaction,
    accounts,
    categories,
  } = useAppOutletContext();

  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [category, setCategory] = useState(categories[0] || '');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [editingRecTxId, setEditingRecTxId] = useState<string | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecTxId, setSelectedRecTxId] = useState<string | null>(null);

  const accountMap = new Map(accounts.map((a: Account) => [a.id, a.name]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || !accountId || !category || dayOfMonth < 1 || dayOfMonth > 31) {
      alert('Please fill out all fields with valid data.');
      return;
    }

    if (editingRecTxId) {
      updateRecurringTransaction({
        id: editingRecTxId,
        accountId,
        amount: numericAmount,
        category,
        type,
        frequency: 'monthly',
        dayOfMonth,
      });
    } else {
      addRecurringTransaction({
        accountId,
        amount: numericAmount,
        category,
        type,
        frequency: 'monthly',
        dayOfMonth,
      });
    }
    
    setAmount('');
    setEditingRecTxId(null);
  };

  const handleEdit = (recTx: RecurringTransaction) => {
    setEditingRecTxId(recTx.id);
    setAccountId(recTx.accountId);
    setCategory(recTx.category);
    setAmount(recTx.amount.toString());
    setType(recTx.type);
    setDayOfMonth(recTx.dayOfMonth);
  };

  const openDeleteModal = (id: string) => {
    setSelectedRecTxId(id);
    setIsDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setSelectedRecTxId(null);
    setIsDeleteModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    if (selectedRecTxId) {
      deleteRecurringTransaction(selectedRecTxId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-8">Recurring Transactions</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-6 rounded-xl shadow-2xl space-y-4 mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-4">
          {editingRecTxId ? 'Update' : 'Add New'} Recurring Transaction
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rec-account" className="block text-sm font-medium text-slate-300">
              Account
            </label>
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
            <label htmlFor="rec-category" className="block text-sm font-medium text-slate-300">
              Category
            </label>
            <CustomSelect
              value={category}
              onChange={(val) => setCategory(val || '')}
              options={categories}
              placeholder="Select Category"
            />
          </div>
          <div>
            <label htmlFor="rec-amount" className="block text-sm font-medium text-slate-300">
              Amount
            </label>
            <input
              type="number"
              id="rec-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
          <div>
            <label htmlFor="rec-type" className="block text-sm font-medium text-slate-300">
              Type
            </label>
            <CustomSelect
              value={type}
              onChange={(val) => setType((val as 'income' | 'expense') || 'expense')}
              options={['expense', 'income']}
            />
          </div>
          <div>
            <label htmlFor="rec-day" className="block text-sm font-medium text-slate-300">
              Day of Month (1-31)
            </label>
            <input
              type="number"
              id="rec-day"
              min="1"
              max="31"
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
              className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 transition-colors"
        >
          {editingRecTxId ? 'Update Transaction' : 'Add Recurring Transaction'}
        </button>
      </form>

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">Your Recurring Transactions</h3>
        <div className="space-y-4">
          {recurringTransactions.length === 0 ? (
            <p className="text-center py-10 text-slate-400">No recurring transactions set up.</p>
          ) : (
            recurringTransactions.map((rec: RecurringTransaction) => (
              <div key={rec.id} className="p-4 bg-slate-700 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-lg">{rec.category}</p>
                  <p className="text-sm text-slate-300">
                    Day {rec.dayOfMonth} of each month
                  </p>
                  <p className="text-sm text-slate-400">{accountMap.get(rec.accountId)}</p>
                </div>
                <div className="text-right">
                   <p className={`font-medium ${rec.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {rec.type === 'income' ? '+' : '-'}{formatCurrency(rec.amount)}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <button
                    onClick={() => postRecurringTransaction(rec.id)}
                    className="py-2 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Post Now
                  </button>
                  <button onClick={() => handleEdit(rec)} className="py-2 px-3 bg-slate-600 hover:bg-slate-500 rounded-md">
                    <PencilSquareIcon className="h-5 w-5 text-sky-400" />
                  </button>
                  <button onClick={() => openDeleteModal(rec.id)} className="py-2 px-3 bg-slate-600 hover:bg-slate-500 rounded-md">
                    <TrashIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Recurring Transaction"
        message="Are you sure you want to delete this recurring transaction? This action cannot be undone."
      />
    </div>
  );
}