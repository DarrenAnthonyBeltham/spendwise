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
import type {
  Transaction,
  Account,
  Budget,
  RecurringTransaction,
  Goal,
  AppContextType
} from './types';
import { format } from 'date-fns';
import { useEffect } from 'react';

const INITIAL_CATEGORIES = [
  'Groceries', 'Utilities', 'Salary', 'Rent', 'Entertainment', 'Transport', 'Other',
];

export type { AppContextType };

function App() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', []);
  const [categories, setCategories] = useLocalStorage<string[]>('categories', INITIAL_CATEGORIES);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [recurringTransactions, setRecurringTransactions] = useLocalStorage<RecurringTransaction[]>('recurringTransactions', []);
  const [goals, setGoals] = useLocalStorage<Goal[]>('goals', []);

  useEffect(() => {
    const accountIds = new Set(accounts.map((acc: Account) => acc.id));
    const cleanedTransactions = transactions.filter((tx: Transaction) => accountIds.has(tx.accountId));
    if (cleanedTransactions.length !== transactions.length) {
      console.log('Cleaning up orphaned transactions...');
      setTransactions(cleanedTransactions);
    }
  }, []);

  const addAccount = (name: string) => {
    if (name && !accounts.find((a: Account) => a.name.toLowerCase() === name.toLowerCase())) {
      const newAccount: Account = { id: crypto.randomUUID(), name };
      setAccounts(prev => [...prev, newAccount]);
    }
  };

  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => prev.map((acc: Account) => acc.id === updatedAccount.id ? updatedAccount : acc));
  };

  const deleteAccount = (idToDelete: string) => {
    const updatedTransactions = transactions.filter((tx: Transaction) => tx.accountId !== idToDelete);
    const updatedAccounts = accounts.filter((acc: Account) => acc.id !== idToDelete);
    const updatedRecurring = recurringTransactions.filter((rtx: RecurringTransaction) => rtx.accountId !== idToDelete);
    setTransactions(updatedTransactions);
    setAccounts(updatedAccounts);
    setRecurringTransactions(updatedRecurring);
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'totalAmount'>) => {
    const totalAmount = txData.splits.reduce((sum, split) => sum + split.amount, 0);
    const newTransaction: Transaction = {
      ...txData,
      id: crypto.randomUUID(),
      totalAmount: totalAmount,
    };
    setTransactions((prev) =>
      [...prev, newTransaction].sort(
        (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  const updateTransaction = (updatedTxData: Transaction) => {
     const totalAmount = updatedTxData.splits.reduce((sum, split) => sum + split.amount, 0);
     const updatedTx = { ...updatedTxData, totalAmount };
    setTransactions(prev => prev.map((tx: Transaction) => tx.id === updatedTx.id ? updatedTx : tx).sort(
      (a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter((tx: Transaction) => tx.id !== id));
  };

  const deleteSelectedTransactions = (ids: string[]) => {
    const idSet = new Set(ids);
    setTransactions(prev => prev.filter((tx: Transaction) => !idSet.has(tx.id)));
  };

  const addCategory = (newCategory: string) => {
    const trimmedCategory = newCategory.trim();
    if (
      trimmedCategory &&
      !categories.find((c: string) => c.toLowerCase() === trimmedCategory.toLowerCase())
    ) {
      setCategories((prev) => [...prev, trimmedCategory]);
      return true;
    }
    return false;
  };

  const addBudget = (category: string, amount: number, month: string, id?: string) => {
    const existing = id ? budgets.find((b: Budget) => b.id === id) : budgets.find((b: Budget) => b.category === category && b.month === month);
    if (existing) {
      setBudgets(prev => prev.map((b: Budget) =>
        b.id === existing.id ? { ...b, category, amount, month } : b
      ));
    } else {
      const newBudget: Budget = { id: crypto.randomUUID(), category, amount, month };
      setBudgets(prev => [...prev, newBudget]);
    }
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter((b: Budget) => b.id !== id));
  };

  const addRecurringTransaction = (tx: Omit<RecurringTransaction, 'id'>) => {
    const newRecTx: RecurringTransaction = { ...tx, id: crypto.randomUUID() };
    setRecurringTransactions(prev => [...prev, newRecTx]);
  };

  const updateRecurringTransaction = (updatedRecTx: RecurringTransaction) => {
    setRecurringTransactions(prev => prev.map((tx: RecurringTransaction) => tx.id === updatedRecTx.id ? updatedRecTx : tx));
  };

  const deleteRecurringTransaction = (id: string) => {
    setRecurringTransactions(prev => prev.filter((tx: RecurringTransaction) => tx.id !== id));
  };

  const postRecurringTransaction = (id: string) => {
    const recTx = recurringTransactions.find((t: RecurringTransaction) => t.id === id);
    if (!recTx) return;
    const transactionData: Omit<Transaction, 'id' | 'totalAmount'> = {
      accountId: recTx.accountId,
      splits: [{ category: recTx.category, amount: recTx.amount }],
      date: format(new Date(), 'yyyy-MM-dd'),
      type: recTx.type,
      tags: recTx.tags,
      notes: recTx.notes,
    };
    addTransaction(transactionData);
  };

  const addGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = { ...goalData, id: crypto.randomUUID() };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (updatedGoal: Goal) => {
    setGoals(prev => prev.map((g: Goal) => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter((g: Goal) => g.id !== id));
  };

  const exportData = () => {
    const data = {
      transactions, accounts, categories, budgets, recurringTransactions, goals,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `spendwise_backup_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;
    link.click();
  };

  const importData = (jsonString: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(jsonString);
        if (data.transactions && data.accounts && data.categories && data.budgets && data.recurringTransactions && data.goals) {
          setTransactions(data.transactions);
          setAccounts(data.accounts);
          setCategories(data.categories);
          setBudgets(data.budgets);
          setRecurringTransactions(data.recurringTransactions);
          setGoals(data.goals);
          resolve(true);
        } else {
          reject('Invalid data structure in JSON file.');
        }
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        reject('Failed to parse JSON file.');
      }
    });
  };

  const clearAllData = () => {
    setTransactions([]);
    setAccounts([]);
    setCategories(INITIAL_CATEGORIES);
    setBudgets([]);
    setRecurringTransactions([]);
    setGoals([]);
  };

  const contextValue: AppContextType = {
    transactions, addTransaction, updateTransaction, deleteTransaction, deleteSelectedTransactions,
    accounts, addAccount, updateAccount, deleteAccount,
    categories, addCategory,
    budgets, addBudget, deleteBudget,
    recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, postRecurringTransaction,
    goals, addGoal, updateGoal, deleteGoal,
    exportData, importData, clearAllData,
  };

  return (
    <>
      <Background />
      <div className="relative min-h-screen text-slate-100">
        <Routes>
          <Route path="/" element={<Layout context={contextValue} />}>
            <Route index element={<DashboardPage />} />
            <Route path="accounts" element={<AccountsPage />} />
            <Route path="budgets" element={<BudgetsPage />} />
            <Route path="trends" element={<TrendsPage />} />
            <Route path="recurring" element={<RecurringPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
    </>
  );
}

export function useAppOutletContext() {
  return useOutletContext<AppContextType>();
}

export default App;