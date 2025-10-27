import { useState } from 'react';
import { useAppOutletContext } from '../App';
import type { Debt } from '../types';
import { formatCurrency } from '../lib/helpers';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function DebtsPage() {
  const { debts, addDebt, updateDebt, deleteDebt } = useAppOutletContext();

  const [name, setName] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [debtToDelete, setDebtToDelete] = useState<Debt | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numInitialAmount = parseFloat(initialAmount); const numCurrentBalance = parseFloat(currentBalance); const numInterestRate = interestRate ? parseFloat(interestRate) : undefined;
    if (!name.trim() || !numInitialAmount || numInitialAmount <= 0 || !numCurrentBalance || numCurrentBalance < 0 || (numInterestRate !== undefined && numInterestRate < 0)) { alert('Please enter valid debt details.'); return; }
    const debtData = { name: name.trim(), initialAmount: numInitialAmount, currentBalance: numCurrentBalance, interestRate: numInterestRate };
    if (editingDebt) { updateDebt({ ...editingDebt, ...debtData }); } else { addDebt(debtData); }
    resetForm();
  };
  const handleEdit = (debt: Debt) => { setEditingDebt(debt); setName(debt.name); setInitialAmount(debt.initialAmount.toString()); setCurrentBalance(debt.currentBalance.toString()); setInterestRate(debt.interestRate?.toString() || ''); };
  const openDeleteModal = (debt: Debt) => { setDebtToDelete(debt); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setDebtToDelete(null); setIsDeleteModalOpen(false); };
  const handleConfirmDelete = () => { if (debtToDelete) { deleteDebt(debtToDelete.id); } };
  const resetForm = () => { setEditingDebt(null); setName(''); setInitialAmount(''); setCurrentBalance(''); setInterestRate(''); };
  const totalDebtBalance = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Debts</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{editingDebt ? 'Update Debt' : 'Add New Debt'}</h2>
        <div><label htmlFor="debt-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Debt Name</label><input type="text" id="debt-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Credit Card, Student Loan" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label htmlFor="debt-initial" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Initial Amount</label><input type="number" step="any" id="debt-initial" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} placeholder="10000" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
          <div><label htmlFor="debt-current" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Balance</label><input type="number" step="any" id="debt-current" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} placeholder="8500" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        </div>
        <div><label htmlFor="debt-rate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Interest Rate (%) (Optional)</label><input type="number" step="any" id="debt-rate" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} placeholder="19.9" className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        <button type="submit" className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-md text-white">{editingDebt ? 'Update Debt' : 'Add Debt'}</button>
        {editingDebt && <button type="button" onClick={resetForm} className="w-full py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-slate-700 dark:text-slate-300">Cancel Edit</button>}
      </form>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Debts</h3><span className="text-lg font-medium text-red-600 dark:text-red-400">Total Balance: {formatCurrency(totalDebtBalance)}</span></div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th><th scope="col" className="px-4 py-3 text-right">Initial Amount</th><th scope="col" className="px-4 py-3 text-right">Current Balance</th><th scope="col" className="px-4 py-3 text-right">Interest Rate</th><th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {debts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-500 dark:text-slate-400">No debts added yet.</td></tr>
              ) : (
                debts.map((debt: Debt) => (
                    <tr key={debt.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{debt.name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(debt.initialAmount)}</td>
                      <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-medium">{formatCurrency(debt.currentBalance)}</td>
                      <td className="px-4 py-3 text-right">{debt.interestRate !== undefined ? `${debt.interestRate.toFixed(2)}%` : 'N/A'}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(debt)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 mr-3"><PencilSquareIcon className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(debt)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {debtToDelete && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Delete Debt" message={`Delete "${debtToDelete.name}"?`} />}
    </div>
  );
}