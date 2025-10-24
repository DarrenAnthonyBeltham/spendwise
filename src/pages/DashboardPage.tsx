import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { AppContextType } from '../App';
import type { Account, Transaction } from '../types';
import TransactionList from '../components/TransactionList';
import CustomSelect from '../components/CustomSelect';
import CustomDatePicker from '../components/CustomDatePicker';
import { formatCurrency } from '../lib/helpers';
import CreateFirstAccount from '../components/CreateFirstAccount';
import ConfirmationModal from '../components/ConfirmationModal';
import { TrashIcon } from '@heroicons/react/24/outline';
import SummaryCharts from '../components/SummaryCharts';
import TransactionForm from '../components/TransactionForm';

export default function DashboardPage() {
  const {
    transactions, accounts, categories, addTransaction, addCategory, deleteSelectedTransactions
  } = useOutletContext<AppContextType>();

  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const accountNameMap = useMemo(() => {
    const map = new Map<string, string>();
    map.set('all', 'All Accounts');
    accounts.forEach((acc: Account) => map.set(acc.id, acc.name));
    return map;
  }, [accounts]);

  const filterCategories = useMemo(() => {
    return ['all', ...categories];
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    return transactions.filter((tx: Transaction) => {
      const txDate = new Date(tx.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      const accountMatch = accountFilter === 'all' || tx.accountId === accountFilter;
      const categoryMatch = categoryFilter === 'all' || tx.splits.some(s => s.category === categoryFilter);
      const startDateMatch = !startDate || txDate >= startDate;
      const endDateMatch = !endDate || txDate <= endDate;

      const searchMatch = !searchQuery ||
        tx.splits.some(s => s.category.toLowerCase().includes(lowerSearchQuery)) ||
        tx.tags?.some(tag => tag.toLowerCase().includes(lowerSearchQuery)) ||
        tx.notes?.toLowerCase().includes(lowerSearchQuery);

      return accountMatch && categoryMatch && startDateMatch && endDateMatch && searchMatch;
    });
  }, [transactions, accountFilter, categoryFilter, dateRange, searchQuery]);

  const totalBalance = useMemo(() => {
    const relevantTransactions = accountFilter === 'all'
      ? transactions
      : transactions.filter(tx => tx.accountId === accountFilter);

    return relevantTransactions.reduce((acc: number, tx: Transaction) => {
      return tx.type === 'income' ? acc + tx.totalAmount : acc - tx.totalAmount;
    }, 0);
  }, [transactions, accountFilter]);

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  const handleSelectionChange = (id: string, isSelected: boolean) => {
    setSelectedTransactions(prev => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleConfirmBulkDelete = () => {
    deleteSelectedTransactions(Array.from(selectedTransactions));
    setSelectedTransactions(new Set());
    setIsBulkDeleteModalOpen(false);
  };

  if (accounts.length === 0) {
     return (
       <div className="space-y-8">
         <header>
           <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">SpendWise Dashboard</h1>
           <p className="text-center text-slate-300 text-lg mt-2">Your personal finance overview.</p>
         </header>
         <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
           <div className="xl:col-span-1"><CreateFirstAccount /></div>
           <div className="xl:col-span-2">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-slate-800 p-6 rounded-xl shadow-2xl h-[364px] flex items-center justify-center"><p className="text-slate-400">Create an account to see charts.</p></div>
               <div className="bg-slate-800 p-6 rounded-xl shadow-2xl h-[364px] flex items-center justify-center"><p className="text-slate-400">Create an account to see charts.</p></div>
             </div>
           </div>
         </div>
         <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mt-8"><h3 className="text-xl font-semibold text-white mb-4">Filter Transactions</h3><div className="text-center py-10 text-slate-400">Create an account first.</div></div>
         <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mt-8"><h3 className="text-xl font-semibold text-white mb-4">Transaction History</h3><div className="text-center py-10 text-slate-400">Create an account first.</div></div>
       </div>
     );
   }

  return (
     <div className="space-y-8">
       <header>
         <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">SpendWise Dashboard</h1>
         <p className="text-center text-slate-300 text-lg mt-2">Your personal finance overview.</p>
       </header>
       <div className="mb-8 bg-slate-800 p-6 rounded-xl shadow-2xl">
         <h2 className="text-3xl font-bold text-white text-center">
           {accountNameMap.get(accountFilter)} Balance:
           <span className={`ml-3 ${totalBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(totalBalance)}</span>
         </h2>
       </div>
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         <div className="xl:col-span-1"><TransactionForm addTransaction={addTransaction} categories={categories} addCategory={addCategory} accounts={accounts} /></div>
         <div className="xl:col-span-2"><SummaryCharts transactions={filteredTransactions} /></div>
       </div>
       <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mt-8">
         <h3 className="text-xl font-semibold text-white mb-4">Filter Transactions</h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           <div><label htmlFor="filter-account" className="block text-sm font-medium text-slate-300">Account</label><CustomSelect value={accountNameMap.get(accountFilter)!} onChange={(val) => { const id = [...accountNameMap.entries()].find(([_, name]) => name === val)?.[0] || 'all'; setAccountFilter(id); }} options={[...accountNameMap.values()]} placeholder="Select Account" /></div>
           <div><label htmlFor="filter-category" className="block text-sm font-medium text-slate-300">Category</label><CustomSelect value={categoryFilter} onChange={(val) => setCategoryFilter(val || 'all')} options={filterCategories} placeholder="Select Category" /></div>
           <div className="md:col-span-1"><label htmlFor="filter-start-date" className="block text-sm font-medium text-slate-300">Date Range</label><CustomDatePicker id="filter-date" startDate={dateRange.start} endDate={dateRange.end} onDateRangeChange={handleDateRangeChange} /></div>
           <div><label htmlFor="search-query" className="block text-sm font-medium text-slate-300">Search</label><input type="text" id="search-query" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tags/Notes..." className="mt-1 block w-full bg-slate-700 rounded-md py-2 px-3 text-white"/></div>
         </div>
       </div>
        {selectedTransactions.size > 0 && (
         <div className="mt-4 flex justify-end">
            <button onClick={() => setIsBulkDeleteModalOpen(true)} className="flex items-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium"><TrashIcon className="h-5 w-5" /> Delete Selected ({selectedTransactions.size})</button>
         </div>
       )}
       <TransactionList transactions={filteredTransactions} accounts={accounts} selectedTransactions={selectedTransactions} onSelectionChange={handleSelectionChange} />
       <ConfirmationModal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} onConfirm={handleConfirmBulkDelete} title={`Delete ${selectedTransactions.size} Transactions`} message="Are you sure?" />
     </div>
   );
}