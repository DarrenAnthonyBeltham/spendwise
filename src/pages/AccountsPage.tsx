import { useState, useMemo } from 'react';
import { useAppOutletContext } from '../App';
import type { Account, Transaction } from '../types';
import { formatCurrency } from '../lib/helpers';
import EditAccountModal from '../components/EditAccountModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function AccountsPage() {
  const { accounts, addAccount, deleteAccount, transactions } =
    useAppOutletContext();
  const [accountName, setAccountName] = useState('');

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>();
    accounts.forEach((acc: Account) => balances.set(acc.id, 0));

    transactions.forEach((tx: Transaction) => {
      const currentBalance = balances.get(tx.accountId) || 0;
      const newBalance =
        tx.type === 'income'
          ? currentBalance + tx.totalAmount 
          : currentBalance - tx.totalAmount;
      balances.set(tx.accountId, newBalance);
    });
    return balances;
  }, [accounts, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountName.trim()) {
      addAccount(accountName.trim());
      setAccountName('');
    }
  };

  const openEditModal = (account: Account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAccount(null);
  };

  const openDeleteModal = (account: Account) => {
    setSelectedAccount(account);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccount(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccount) {
      deleteAccount(selectedAccount.id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-8">Accounts</h1>

      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl shadow-2xl space-y-4 mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">Add New Account</h2>
        <div>
          <label htmlFor="account-name" className="block text-sm font-medium text-slate-300">Account Name</label>
          <input type="text" id="account-name" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g. 'Checking'" required className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">Add Account</button>
      </form>

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl">
        <h3 className="text-xl font-semibold text-white mb-4">Your Accounts</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-600 text-slate-100">
              <tr>
                <th scope="col" className="px-4 py-3">Account Name</th>
                <th scope="col" className="px-4 py-3 text-right">Balance</th>
                <th scope="col" className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-slate-400">No accounts created yet.</td></tr>
              ) : (
                accounts.map((acc: Account) => {
                  const balance = accountBalances.get(acc.id) || 0;
                  return (
                    <tr key={acc.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="px-4 py-3">{acc.name}</td>
                      <td className={`px-4 py-3 text-right font-medium ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(balance)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEditModal(acc)} className="text-sky-400 hover:text-sky-300 mr-3"><PencilSquareIcon className="h-5 w-5" /></button>
                        <button onClick={() => openDeleteModal(acc)} className="text-red-500 hover:text-red-400"><TrashIcon className="h-5 w-5" /></button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAccount && <EditAccountModal isOpen={isEditModalOpen} onClose={closeEditModal} account={selectedAccount} />}
      {selectedAccount && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Delete Account" message={`Are you sure you want to delete the "${selectedAccount.name}" account? All associated transactions will also be permanently deleted.`} />}
    </div>
  );
}