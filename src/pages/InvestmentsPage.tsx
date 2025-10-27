import { useState } from 'react';
import { useAppOutletContext } from '../App';
import type { Investment } from '../types';
import { formatCurrency } from '../lib/helpers';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function InvestmentsPage() {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useAppOutletContext();

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState<Investment | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numQuantity = parseFloat(quantity); const numPurchasePrice = parseFloat(purchasePrice); const numCurrentValue = parseFloat(currentValue);
    if (!name.trim() || !numQuantity || numQuantity <= 0 || !numPurchasePrice || numPurchasePrice < 0 || !numCurrentValue || numCurrentValue < 0) { alert('Please enter valid investment details.'); return; }
    const investmentData = { name: name.trim(), quantity: numQuantity, purchasePrice: numPurchasePrice, currentValue: numCurrentValue };
    if (editingInvestment) { updateInvestment({ ...editingInvestment, ...investmentData }); } else { addInvestment(investmentData); }
    resetForm();
  };
  const handleEdit = (inv: Investment) => { setEditingInvestment(inv); setName(inv.name); setQuantity(inv.quantity.toString()); setPurchasePrice(inv.purchasePrice.toString()); setCurrentValue(inv.currentValue.toString()); };
  const openDeleteModal = (inv: Investment) => { setInvestmentToDelete(inv); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setInvestmentToDelete(null); setIsDeleteModalOpen(false); };
  const handleConfirmDelete = () => { if (investmentToDelete) { deleteInvestment(investmentToDelete.id); } };
  const resetForm = () => { setEditingInvestment(null); setName(''); setQuantity(''); setPurchasePrice(''); setCurrentValue(''); };
  const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Investments</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{editingInvestment ? 'Update Investment' : 'Add New Investment'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label htmlFor="inv-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label><input type="text" id="inv-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Apple Stock, Bitcoin" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
          <div><label htmlFor="inv-quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quantity</label><input type="number" step="any" id="inv-quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
          <div><label htmlFor="inv-purchase" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total Purchase Price</label><input type="number" step="any" id="inv-purchase" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="1500" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
          <div><label htmlFor="inv-current" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Total Value</label><input type="number" step="any" id="inv-current" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} placeholder="1800" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        </div>
        <button type="submit" className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-md text-white">{editingInvestment ? 'Update Investment' : 'Add Investment'}</button>
        {editingInvestment && <button type="button" onClick={resetForm} className="w-full py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-slate-700 dark:text-slate-300">Cancel Edit</button>}
      </form>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-semibold text-slate-900 dark:text-white">Your Investments</h3><span className="text-lg font-medium text-green-600 dark:text-green-400">Total Value: {formatCurrency(totalCurrentValue)}</span></div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
              <tr>
                <th scope="col" className="px-4 py-3">Name</th><th scope="col" className="px-4 py-3 text-right">Quantity</th><th scope="col" className="px-4 py-3 text-right">Purchase Value</th><th scope="col" className="px-4 py-3 text-right">Current Value</th><th scope="col" className="px-4 py-3 text-right">Gain/Loss</th><th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400">No investments added yet.</td></tr>
              ) : (
                investments.map((inv: Investment) => {
                  const gainLoss = inv.currentValue - inv.purchasePrice;
                  return (
                    <tr key={inv.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{inv.name}</td>
                      <td className="px-4 py-3 text-right">{inv.quantity}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(inv.purchasePrice)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(inv.currentValue)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${gainLoss >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>{formatCurrency(gainLoss)}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button onClick={() => handleEdit(inv)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 mr-3"><PencilSquareIcon className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(inv)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {investmentToDelete && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Delete Investment" message={`Delete "${investmentToDelete.name}"?`} />}
    </div>
  );
}