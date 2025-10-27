import { useState } from 'react';
import type { Transaction, Account } from '../types';
import { formatCurrency } from '../lib/helpers';
import { useAppOutletContext } from '../App';
import EditTransactionModal from './EditTransactionModal';
import ConfirmationModal from './ConfirmationModal';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TransactionListProps {
  transactions: Transaction[];
  accounts: Account[];
  selectedTransactions: Set<string>;
  onSelectionChange: (id: string, isSelected: boolean) => void;
  showTags: boolean;
  showNotes: boolean;
}

const TransactionList = ({ transactions, accounts, selectedTransactions, onSelectionChange, showTags, showNotes }: TransactionListProps) => {
  const { deleteTransaction } = useAppOutletContext();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const accountMap = new Map(accounts.map((acc: Account) => [acc.id, acc.name]));

  const openEditModal = (tx: Transaction) => { setSelectedTx(tx); setIsEditModalOpen(true); };
  const closeEditModal = () => { setIsEditModalOpen(false); setSelectedTx(null); };
  const openDeleteModal = (tx: Transaction) => { setSelectedTx(tx); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setSelectedTx(null); setIsDeleteModalOpen(false); };

  const handleConfirmDelete = () => { if (selectedTx) { deleteTransaction(selectedTx.id); } };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
     transactions.forEach(tx => onSelectionChange(tx.id, e.target.checked));
  };

  const isAllSelected = transactions.length > 0 && selectedTransactions.size === transactions.length;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mt-8">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Transaction History</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-slate-700 dark:text-slate-300">
          <thead className="border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-xs">
            <tr>
              <th scope="col" className="px-1 py-3"><input type="checkbox" className="rounded border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 focus:ring-sky-500 text-sky-600" checked={isAllSelected} onChange={handleSelectAll} /></th>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Account</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" className="px-4 py-3 text-right">Amount</th>
              {showTags && <th scope="col" className="px-4 py-3">Tags</th>}
              {showNotes && <th scope="col" className="px-4 py-3">Notes</th>}
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td colSpan={showTags && showNotes ? 9 : showTags || showNotes ? 8 : 7} className="text-center py-10 text-slate-500 dark:text-slate-400">No transactions found for the selected filters.</td></tr>
            ) : (
              transactions.map((tx: Transaction) => (
                <tr key={tx.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                   <td className="px-1 py-3"><input type="checkbox" className="rounded border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 focus:ring-sky-500 text-sky-600" checked={selectedTransactions.has(tx.id)} onChange={(e) => onSelectionChange(tx.id, e.target.checked)} /></td>
                  <td className="px-4 py-3 whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{accountMap.get(tx.accountId) || 'N/A'}</td>
                  <td className="px-4 py-3">{tx.splits.map(s => s.category).join(', ')}</td>
                  <td className="px-4 py-3 capitalize">{tx.type}</td>
                  <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${tx.type === 'income' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>{tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.totalAmount)}</td>
                  {showTags && <td className="px-4 py-3 text-xs">{tx.tags?.map(tag => <span key={tag} className="inline-block bg-slate-200 dark:bg-slate-600 rounded px-1.5 py-0.5 mr-1 mb-1 text-slate-600 dark:text-slate-300">{tag}</span>)}</td>}
                  {showNotes && <td className="px-4 py-3 text-xs max-w-[200px] truncate" title={tx.notes}>{tx.notes}</td>}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEditModal(tx)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 mr-3"><PencilSquareIcon className="h-5 w-5" /></button>
                    <button onClick={() => openDeleteModal(tx)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTx && <EditTransactionModal isOpen={isEditModalOpen} onClose={closeEditModal} transaction={selectedTx} />}
      {selectedTx && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Delete Transaction" message={`Are you sure you want to delete this ${selectedTx.type}?`} />}
    </div>
  );
};

export default TransactionList;