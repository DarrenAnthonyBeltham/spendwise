import { useState } from 'react';
import { useAppOutletContext } from '../App';
import type { RecurringTransaction, Account} from '../types';
import CustomSelect from '../components/CustomSelect';
import { formatCurrency } from '../lib/helpers';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function RecurringPage() {
  const {
    recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction,
    postRecurringTransaction, accounts, categories,
  } = useAppOutletContext();

  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [category, setCategory] = useState(categories[0]?.name || ''); 
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [editingRecTxId, setEditingRecTxId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRecTxId, setSelectedRecTxId] = useState<string | null>(null);

  const accountMap = new Map(accounts.map((a: Account) => [a.id, a.name]));
  const categoryNameList = categories.map(c => c.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || !accountId || !category || dayOfMonth < 1 || dayOfMonth > 31) {
      alert('Please fill out all fields with valid data.'); return;
    }
    const recTxData = {
      accountId, amount: numericAmount, category, type, frequency: 'monthly' as const, dayOfMonth,
      tags: tags.split(',').map(t => t.trim()).filter(t => t), notes: notes.trim() || undefined,
    };
    if (editingRecTxId) { updateRecurringTransaction({ id: editingRecTxId, ...recTxData }); }
    else { addRecurringTransaction(recTxData); }
    resetForm();
  };

  const handleEdit = (recTx: RecurringTransaction) => {
    setEditingRecTxId(recTx.id); setAccountId(recTx.accountId); setCategory(recTx.category);
    setAmount(recTx.amount.toString()); setType(recTx.type); setDayOfMonth(recTx.dayOfMonth);
    setTags(recTx.tags?.join(', ') || ''); setNotes(recTx.notes || '');
  };

  const openDeleteModal = (id: string) => { setSelectedRecTxId(id); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setSelectedRecTxId(null); setIsDeleteModalOpen(false); };
  const handleConfirmDelete = () => { if (selectedRecTxId) { deleteRecurringTransaction(selectedRecTxId); } };

  const resetForm = () => {
     setAccountId(accounts[0]?.id || ''); setCategory(categories[0]?.name || ''); setAmount('');
     setType('expense'); setDayOfMonth(1); setTags(''); setNotes(''); setEditingRecTxId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Recurring Transactions</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{editingRecTxId ? 'Update' : 'Add New'} Recurring Transaction</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label htmlFor="rec-account" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label><CustomSelect value={accountMap.get(accountId) || ''} onChange={(val) => { const id = accounts.find((a: Account) => a.name === val)?.id || ''; setAccountId(id); }} options={accounts.map((a: Account) => a.name)} placeholder="Select Account"/></div>
          <div><label htmlFor="rec-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label><CustomSelect value={category} onChange={(val) => setCategory(val || '')} options={categoryNameList} placeholder="Select Category"/></div>
          <div><label htmlFor="rec-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label><input type="number" id="rec-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
          <div><label htmlFor="rec-type" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label><CustomSelect value={type} onChange={(val) => setType((val as 'income' | 'expense') || 'expense')} options={['expense', 'income']}/></div>
          <div><label htmlFor="rec-day" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Day of Month (1-31)</label><input type="number" id="rec-day" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(parseInt(e.target.value))} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
          <div><label htmlFor="rec-tags" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags (Optional)</label><input type="text" id="rec-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., bill, subscription" className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        </div>
        <div><label htmlFor="rec-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes (Optional)</label><textarea id="rec-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="e.g., Monthly Netflix subscription" className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"></textarea></div>
        <button type="submit" className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-md text-white">{editingRecTxId ? 'Update Transaction' : 'Add Recurring Transaction'}</button>
        {editingRecTxId && <button type="button" onClick={resetForm} className="w-full py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-slate-700 dark:text-slate-300">Cancel Edit</button>}
      </form>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Your Recurring Transactions</h3>
        <div className="space-y-4">
          {recurringTransactions.length === 0 ? (
            <p className="text-center py-10 text-slate-500 dark:text-slate-400">No recurring transactions set up.</p>
          ) : (
            recurringTransactions.map((rec: RecurringTransaction) => (
              <div key={rec.id} className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-white text-lg">{rec.category}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Day {rec.dayOfMonth} of each month</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{accountMap.get(rec.accountId)}</p>
                  {rec.tags && rec.tags.length > 0 && <div className="mt-1 text-xs">{rec.tags.map(tag => <span key={tag} className="inline-block bg-slate-200 dark:bg-slate-600 rounded px-1.5 py-0.5 mr-1 mb-1">{tag}</span>)}</div>}
                  {rec.notes && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 italic">Note: {rec.notes}</p>}
                </div>
                <div className="text-right sm:text-right shrink-0">
                   <p className={`font-medium text-lg ${rec.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>{rec.type === 'income' ? '+' : '-'}{formatCurrency(rec.amount)}</p>
                </div>
                <div className="flex gap-2 shrink-0 mt-2 sm:mt-0">
                  <button onClick={() => postRecurringTransaction(rec.id)} className="py-2 px-3 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700">Post Now</button>
                  <button onClick={() => handleEdit(rec)} className="p-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-md"><PencilSquareIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" /></button>
                  <button onClick={() => openDeleteModal(rec.id)} className="p-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-md"><TrashIcon className="h-5 w-5 text-red-500" /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Delete Recurring Transaction" message="Are you sure?" />
    </div>
  );
}