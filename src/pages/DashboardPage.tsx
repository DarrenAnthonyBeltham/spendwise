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
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import SummaryCharts from '../components/SummaryCharts';
import TransactionForm from '../components/TransactionForm';
import BulkEditModal from '../components/BulkEditModal';
import { format, parseISO, differenceInDays, startOfDay, endOfDay } from 'date-fns';

export default function DashboardPage() {
  const {
    transactions, accounts, categories, addTransaction, addCategory, deleteSelectedTransactions, updateSelectedTransactions,
    investments, debts, recurringTransactions, postRecurringTransaction
  } = useOutletContext<AppContextType>();

  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [showTags, setShowTags] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  const accountNameMap = useMemo(() => { const map = new Map<string, string>(); map.set('all', 'All Accounts'); accounts.forEach((acc: Account) => map.set(acc.id, acc.name)); return map; }, [accounts]);
  const categoryNameList = useMemo(() => ['all', ...categories.map(c => c.name)], [categories]);

  const filteredTransactions = useMemo(() => {
    const lowerSearchQuery = searchQuery.toLowerCase();
    const minAmount = amountRange.min ? parseFloat(amountRange.min) : -Infinity;
    const maxAmount = amountRange.max ? parseFloat(amountRange.max) : Infinity;

    return transactions.filter((tx: Transaction) => {
      const txDate = parseISO(tx.date);
      const startDate = dateRange.start ? startOfDay(parseISO(dateRange.start)) : null;
      const endDate = dateRange.end ? endOfDay(parseISO(dateRange.end)) : null;

      const accountMatch = accountFilter === 'all' || tx.accountId === accountFilter;
      const categoryMatch = categoryFilter === 'all' || tx.splits.some(s => s.category === categoryFilter);
      const startDateMatch = !startDate || txDate >= startDate;
      const endDateMatch = !endDate || txDate <= endDate;
      const amountMatch = tx.totalAmount >= minAmount && tx.totalAmount <= maxAmount;

      const searchMatch = !searchQuery ||
        tx.splits.some(s => s.category.toLowerCase().includes(lowerSearchQuery)) ||
        tx.tags?.some(tag => tag.toLowerCase().includes(lowerSearchQuery)) ||
        tx.notes?.toLowerCase().includes(lowerSearchQuery);

      return accountMatch && categoryMatch && startDateMatch && endDateMatch && searchMatch && amountMatch;
    });
  }, [transactions, accountFilter, categoryFilter, dateRange, searchQuery, amountRange]);

  const totalAccountBalance = useMemo(() => {
     return accounts.reduce((totalAccBalance, account) => {
        const accountBalance = transactions
            .filter(tx => tx.accountId === account.id)
            .reduce((acc: number, tx: Transaction) => tx.type === 'income' ? acc + tx.totalAmount : acc - tx.totalAmount, 0);
        return totalAccBalance + accountBalance;
     }, 0);
  }, [transactions, accounts]);

  const totalInvestmentValue = useMemo(() => investments.reduce((sum, inv) => sum + inv.currentValue, 0), [investments]);
  const totalDebtBalance = useMemo(() => debts.reduce((sum, debt) => sum + debt.currentBalance, 0), [debts]);
  const netWorth = useMemo(() => totalAccountBalance + totalInvestmentValue - totalDebtBalance, [totalAccountBalance, totalInvestmentValue, totalDebtBalance]);

  const savingsRateData = useMemo(() => {
    const currentMonthStart = format(new Date(), 'yyyy-MM-01');
    const monthlyTotals = transactions.filter(tx => tx.date >= currentMonthStart)
      .reduce((acc, tx) => { if (tx.type === 'income') acc.income += tx.totalAmount; else acc.expense += tx.totalAmount; return acc; }, { income: 0, expense: 0 });
    const savings = monthlyTotals.income - monthlyTotals.expense;
    const rate = monthlyTotals.income > 0 ? (savings / monthlyTotals.income) * 100 : 0;
    return { ...monthlyTotals, savings, rate };
  }, [transactions]);

  const upcomingRecurring = useMemo(() => {
      const today = new Date(); const currentDay = today.getDate(); const currentMonthStr = format(today, 'yyyy-MM');
      return recurringTransactions.filter(rtx => {
          const lastPostedMonth = rtx.lastPostedDate ? format(parseISO(rtx.lastPostedDate), 'yyyy-MM') : null;
          return rtx.dayOfMonth >= currentDay && lastPostedMonth !== currentMonthStr;
      }).sort((a, b) => a.dayOfMonth - b.dayOfMonth).slice(0, 5);
  }, [recurringTransactions]);

  const handleDateRangeChange = (start: string, end: string) => { setDateRange({ start, end }); };
  const handleSelectionChange = (id: string, isSelected: boolean) => { setSelectedTransactions(prev => { const next = new Set(prev); if (isSelected) next.add(id); else next.delete(id); return next; }); };
  const handleConfirmBulkDelete = () => { deleteSelectedTransactions(Array.from(selectedTransactions)); setSelectedTransactions(new Set()); setIsBulkDeleteModalOpen(false); };
  const handleBulkUpdate = (changes: Partial<Pick<Transaction, 'accountId' | 'tags'>> & { category?: string }) => { updateSelectedTransactions(Array.from(selectedTransactions), changes); setSelectedTransactions(new Set()); setIsBulkEditModalOpen(false); };

  if (accounts.length === 0) { return ( <CreateFirstAccount /> ); }

  return (
     <div className="space-y-8">
       <header>
         <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Dashboard</h1>
         <p className="text-slate-600 dark:text-slate-400 text-lg">Welcome back! Here's your financial overview.</p>
       </header>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Net Worth</h3>
            <p className={`text-3xl font-bold ${netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(netWorth)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Accts: {formatCurrency(totalAccountBalance)}</p>
         </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">This Month's Savings</h3>
            <p className={`text-3xl font-bold ${savingsRateData.savings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatCurrency(savingsRateData.savings)}</p>
             <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Savings Rate: {savingsRateData.rate.toFixed(1)}%</p>
         </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Investments</h3>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalInvestmentValue)}</p>
         </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Debts</h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalDebtBalance)}</p>
         </div>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-1">
             <TransactionForm addTransaction={addTransaction} categories={categories.map(c=>c.name)} addCategory={addCategory} accounts={accounts} />
             {upcomingRecurring.length > 0 && (
                <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Upcoming Recurring</h3>
                    <ul className="space-y-3">
                        {upcomingRecurring.map(rtx => {
                            const dueDate = new Date(); dueDate.setDate(rtx.dayOfMonth); const daysUntilDue = differenceInDays(dueDate, new Date());
                            return (<li key={rtx.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{rtx.category}</span>
                                        <span className={`ml-2 ${rtx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(rtx.amount)}</span>
                                        <span className="block text-xs text-slate-500 dark:text-slate-400">Due in {daysUntilDue} days (Day {rtx.dayOfMonth})</span>
                                    </div>
                                    <button onClick={() => postRecurringTransaction(rtx.id, format(dueDate, 'yyyy-MM-dd'))} className="py-1 px-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Post Now</button>
                                </li>)})}
                    </ul>
                </div>)}
         </div>
         <div className="lg:col-span-2"><SummaryCharts transactions={filteredTransactions} /></div>
       </div>
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 mt-8">
         <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Filter & Search Transactions</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <div><label htmlFor="filter-account" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label><CustomSelect value={accountNameMap.get(accountFilter)!} onChange={(val) => { const id = [...accountNameMap.entries()].find(([_, name]) => name === val)?.[0] || 'all'; setAccountFilter(id); }} options={[...accountNameMap.values()]} placeholder="Select Account" /></div>
           <div><label htmlFor="filter-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label><CustomSelect value={categoryFilter} onChange={(val) => setCategoryFilter(val || 'all')} options={categoryNameList} placeholder="Select Category" /></div>
           <div className="lg:col-span-2"><label htmlFor="filter-start-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date Range</label><CustomDatePicker id="filter-date" startDate={dateRange.start} endDate={dateRange.end} onDateRangeChange={handleDateRangeChange} /></div>
           <div className="sm:col-span-2 lg:col-span-4"><label htmlFor="search-query" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Search Tags/Notes/Category</label><input type="text" id="search-query" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:ring-sky-500 focus:border-sky-500"/></div>
           <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:col-span-4 lg:flex lg:justify-end">
                <div><label htmlFor="filter-amount-min" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Min Amount</label><input type="number" id="filter-amount-min" value={amountRange.min} onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))} placeholder="0.00" className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
                <div><label htmlFor="filter-amount-max" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Max Amount</label><input type="number" id="filter-amount-max" value={amountRange.max} onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))} placeholder="1000.00" className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
            </div>
         </div>
       </div>
        <div className="flex justify-between items-center mt-4">
            <div>
                 <label className="mr-4 text-sm text-slate-600 dark:text-slate-400"><input type="checkbox" checked={showTags} onChange={e => setShowTags(e.target.checked)} className="mr-1 rounded dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500"/> Show Tags</label>
                 <label className="text-sm text-slate-600 dark:text-slate-400"><input type="checkbox" checked={showNotes} onChange={e => setShowNotes(e.target.checked)} className="mr-1 rounded dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500"/> Show Notes</label>
            </div>
            {selectedTransactions.size > 0 && (
            <div className="flex gap-2">
                <button onClick={() => setIsBulkEditModalOpen(true)} className="flex items-center gap-2 py-2 px-4 bg-yellow-500 hover:bg-yellow-600 rounded-md text-white text-sm font-medium"><PencilSquareIcon className="h-5 w-5" /> Edit Selected ({selectedTransactions.size})</button>
                <button onClick={() => setIsBulkDeleteModalOpen(true)} className="flex items-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm font-medium"><TrashIcon className="h-5 w-5" /> Delete Selected ({selectedTransactions.size})</button>
            </div>)}
       </div>
       <TransactionList transactions={filteredTransactions} accounts={accounts} selectedTransactions={selectedTransactions} onSelectionChange={handleSelectionChange} showTags={showTags} showNotes={showNotes}/>
       <ConfirmationModal isOpen={isBulkDeleteModalOpen} onClose={() => setIsBulkDeleteModalOpen(false)} onConfirm={handleConfirmBulkDelete} title={`Delete ${selectedTransactions.size} Transactions`} message="Are you sure?" />
       {isBulkEditModalOpen && <BulkEditModal isOpen={isBulkEditModalOpen} onClose={() => setIsBulkEditModalOpen(false)} onUpdate={handleBulkUpdate} accounts={accounts} categories={categories.map(c=>c.name)} numSelected={selectedTransactions.size} />}
     </div>
   );
}