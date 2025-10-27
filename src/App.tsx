import { Routes, Route, useOutletContext } from 'react-router-dom';
import { useLocalStorage } from './hooks/useLocalStorage';
import Background from './components/Background';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import AccountsPage from './pages/AccountsPage';
import BudgetsPage from './pages/BudgetsPage';
import TrendsPage from './pages/TrendsPage';
import RecurringPage from './pages/RecurringPage';
import GoalsPage from './pages/GoalsPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import DebtsPage from './pages/DebtsPage';
import type {
  Transaction, Account, Budget, RecurringTransaction, Goal,
  Investment, Debt, AppContextType, Category, Theme
} from './types'; 
import { format } from 'date-fns';
import { useEffect } from 'react';

const INITIAL_CATEGORIES: Category[] = [
  { id: crypto.randomUUID(), name: 'Groceries' }, { id: crypto.randomUUID(), name: 'Utilities' }, { id: crypto.randomUUID(), name: 'Salary' }, { id: crypto.randomUUID(), name: 'Rent' }, { id: crypto.randomUUID(), name: 'Entertainment' }, { id: crypto.randomUUID(), name: 'Transport' }, { id: crypto.randomUUID(), name: 'Other' },
];

export type { AppContextType };

function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', INITIAL_CATEGORIES);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurringTransactions', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);
  const [investments, setInvestments] = useLocalStorage<Investment[]>('investments', []);
  const [debts, setDebts] = useLocalStorage<Debt[]>('debts', []);

  useEffect(() => { const root = window.document.documentElement; root.classList.remove('light', 'dark'); root.classList.add(theme); }, [theme]);
  useEffect(() => { const accountIds = new Set(accounts.map((acc: Account) => acc.id)); const cleanedTransactions = transactions.filter((tx: Transaction) => accountIds.has(tx.accountId)); if (cleanedTransactions.length !== transactions.length) { setTransactions(cleanedTransactions); } }, [accounts, transactions, setTransactions]);

  const addAccount = (name: string) => { if (name && !accounts.find((a: Account) => a.name.toLowerCase() === name.toLowerCase())) { const newAccount: Account = { id: crypto.randomUUID(), name }; setAccounts(prev => [...prev, newAccount]); } };
  const updateAccount = (updatedAccount: Account) => { setAccounts(prev => prev.map((acc: Account) => acc.id === updatedAccount.id ? updatedAccount : acc)); };
  const deleteAccount = (idToDelete: string) => { const updatedTransactions = transactions.filter((tx: Transaction) => tx.accountId !== idToDelete); const updatedAccounts = accounts.filter((acc: Account) => acc.id !== idToDelete); const updatedRecurring = recurringTransactions.filter((rtx: RecurringTransaction) => rtx.accountId !== idToDelete); setTransactions(updatedTransactions); setAccounts(updatedAccounts); setRecurringTransactions(updatedRecurring); };
  const addTransaction = (txData: Omit<Transaction, 'id' | 'totalAmount'>) => { const totalAmount = txData.splits.reduce((sum, split) => sum + split.amount, 0); const newTransaction: Transaction = { ...txData, id: crypto.randomUUID(), totalAmount }; setTransactions((prev) => [...prev, newTransaction].sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())); };
  const updateTransaction = (updatedTxData: Transaction) => { const totalAmount = updatedTxData.splits.reduce((sum, split) => sum + split.amount, 0); const updatedTx = { ...updatedTxData, totalAmount }; setTransactions(prev => prev.map((tx: Transaction) => tx.id === updatedTx.id ? updatedTx : tx).sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime())); };
  const deleteTransaction = (id: string) => { setTransactions(prev => prev.filter((tx: Transaction) => tx.id !== id)); };
  const deleteSelectedTransactions = (ids: string[]) => { const idSet = new Set(ids); setTransactions(prev => prev.filter((tx: Transaction) => !idSet.has(tx.id))); };
  const updateSelectedTransactions = (ids: string[], changes: Partial<Pick<Transaction, 'accountId' | 'tags'>> & { category?: string }) => { const idSet = new Set(ids); setTransactions(prev => prev.map((tx: Transaction) => { if (idSet.has(tx.id)) { let updatedSplits = tx.splits; if (changes.category && tx.splits.length === 1) { updatedSplits = [{ ...tx.splits[0], category: changes.category }]; } return { ...tx, accountId: changes.accountId ?? tx.accountId, tags: changes.tags ?? tx.tags, splits: updatedSplits }; } return tx; })); };
  const addCategory = (name: string) => { const trimmedName = name.trim(); if (trimmedName && !categories.find((c: Category) => c.name.toLowerCase() === trimmedName.toLowerCase())) { const newCategory: Category = { id: crypto.randomUUID(), name: trimmedName }; setCategories((prev) => [...prev, newCategory]); return true; } return false; };
  const updateCategory = (updatedCategory: Category) => { setCategories(prev => prev.map((c: Category) => c.id === updatedCategory.id ? updatedCategory : c)); };
  const deleteCategory = (id: string) => { const categoryToDelete = categories.find(c => c.id === id); if (!categoryToDelete) return; const isUsed = transactions.some((tx: Transaction) => tx.splits.some(s => s.category === categoryToDelete.name)) || budgets.some((b: Budget) => b.category === categoryToDelete.name) || recurringTransactions.some((rtx: RecurringTransaction) => rtx.category === categoryToDelete.name); if (isUsed) { alert(`Cannot delete category "${categoryToDelete.name}" as it's in use.`); return; } setCategories(prev => prev.filter((c: Category) => c.id !== id)); };
  const addBudget = (category: string, amount: number, month: string, id?: string) => { const existing = id ? budgets.find((b: Budget) => b.id === id) : budgets.find((b: Budget) => b.category === category && b.month === month); if (existing) { setBudgets(prev => prev.map((b: Budget) => b.id === existing.id ? { ...b, category, amount, month } : b)); } else { const newBudget: Budget = { id: crypto.randomUUID(), category, amount, month }; setBudgets(prev => [...prev, newBudget]); } };
  const deleteBudget = (id: string) => { setBudgets(prev => prev.filter((b: Budget) => b.id !== id)); };
  const addRecurringTransaction = (tx: Omit<RecurringTransaction, 'id'>) => { const newRecTx: RecurringTransaction = { ...tx, id: crypto.randomUUID() }; setRecurringTransactions(prev => [...prev, newRecTx]); };
  const updateRecurringTransaction = (updatedRecTx: RecurringTransaction) => { setRecurringTransactions(prev => prev.map((tx: RecurringTransaction) => tx.id === updatedRecTx.id ? updatedRecTx : tx)); };
  const deleteRecurringTransaction = (id: string) => { setRecurringTransactions(prev => prev.filter((tx: RecurringTransaction) => tx.id !== id)); };
  const markRecurringTransactionPosted = (id: string, date: string) => { setRecurringTransactions(prev => prev.map((tx: RecurringTransaction) => tx.id === id ? { ...tx, lastPostedDate: date } : tx)); };
  const postRecurringTransaction = (id: string, forceDate?: string) => { const recTx = recurringTransactions.find((t: RecurringTransaction) => t.id === id); if (!recTx) return; const postDate = forceDate || format(new Date(), 'yyyy-MM-dd'); const transactionData: Omit<Transaction, 'id' | 'totalAmount'> = { accountId: recTx.accountId, splits: [{ category: recTx.category, amount: recTx.amount }], date: postDate, type: recTx.type, tags: recTx.tags, notes: recTx.notes, }; addTransaction(transactionData); markRecurringTransactionPosted(id, postDate); };
  const addGoal = (goalData: Omit<Goal, 'id'>) => { const newGoal: Goal = { ...goalData, id: crypto.randomUUID() }; setGoals(prev => [...prev, newGoal]); };
  const updateGoal = (updatedGoal: Goal) => { setGoals(prev => prev.map((g: Goal) => g.id === updatedGoal.id ? updatedGoal : g)); };
  const deleteGoal = (id: string) => { setGoals(prev => prev.filter((g: Goal) => g.id !== id)); };
  const addInvestment = (invData: Omit<Investment, 'id'>) => { const newInv: Investment = { ...invData, id: crypto.randomUUID() }; setInvestments(prev => [...prev, newInv]); };
  const updateInvestment = (updatedInv: Investment) => { setInvestments(prev => prev.map((inv: Investment) => inv.id === updatedInv.id ? updatedInv : inv)); };
  const deleteInvestment = (id: string) => { setInvestments(prev => prev.filter((inv: Investment) => inv.id !== id)); };
  const addDebt = (debtData: Omit<Debt, 'id'>) => { const newDebt: Debt = { ...debtData, id: crypto.randomUUID() }; setDebts(prev => [...prev, newDebt]); };
  const updateDebt = (updatedDebt: Debt) => { setDebts(prev => prev.map((d: Debt) => d.id === updatedDebt.id ? updatedDebt : d)); };
  const deleteDebt = (id: string) => { setDebts(prev => prev.filter((d: Debt) => d.id !== id)); };
  const exportData = () => { const data = { transactions, accounts, categories, budgets, recurringTransactions, goals, investments, debts, theme }; const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`; const link = document.createElement('a'); link.href = jsonString; link.download = `spendwise_backup_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`; link.click(); };
  const importData = (jsonString: string): Promise<boolean> => { return new Promise((resolve, reject) => { try { const data = JSON.parse(jsonString); if (data.transactions && data.accounts && data.categories && data.budgets && data.recurringTransactions && data.goals && data.investments && data.debts) { setTransactions(data.transactions); setAccounts(data.accounts); setCategories(data.categories); setBudgets(data.budgets); setRecurringTransactions(data.recurringTransactions); setGoals(data.goals); setInvestments(data.investments); setDebts(data.debts); if (data.theme && (data.theme === 'light' || data.theme === 'dark')) setTheme(data.theme); resolve(true); } else { reject('Invalid data structure.'); } } catch (error) { console.error('Import Error:', error); reject('Failed to parse file.'); } }); };
  const clearAllData = () => { setTransactions([]); setAccounts([]); setCategories(INITIAL_CATEGORIES); setBudgets([]); setRecurringTransactions([]); setGoals([]); setInvestments([]); setDebts([]); };

  const contextValue: AppContextType = {
    theme, setTheme, transactions, addTransaction, updateTransaction, deleteTransaction, deleteSelectedTransactions, updateSelectedTransactions, accounts, addAccount, updateAccount, deleteAccount, categories, addCategory, updateCategory, deleteCategory, budgets, addBudget, deleteBudget, recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, postRecurringTransaction, markRecurringTransactionPosted, goals, addGoal, updateGoal, deleteGoal, investments, addInvestment, updateInvestment, deleteInvestment, debts, addDebt, updateDebt, deleteDebt, exportData, importData, clearAllData,
  };

  return (
    <>
      <Background />
      <div className={`relative min-h-screen ${theme}`}>
        <Routes>
          <Route path="/" element={<Layout context={contextValue} />}>
            <Route index element={<DashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="trends" element={<TrendsPage />} />
            <Route path="recurring" element={<RecurringPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="investments" element={<InvestmentsPage />} />
            <Route path="debts" element={<DebtsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export function useAppOutletContext() { return useOutletContext<AppContextType>(); }
export default App;