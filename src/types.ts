export interface Account {
  id: string;
  name: string;
}

export interface TransactionSplit {
  category: string;
  amount: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  splits: TransactionSplit[];
  totalAmount: number;
  date: string;
  type: 'income' | 'expense';
  tags?: string[];
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string;
}

export interface RecurringTransaction {
  id: string;
  accountId: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: 'monthly';
  dayOfMonth: number;
  tags?: string[];
  notes?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export type AppContextType = {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'totalAmount'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  deleteSelectedTransactions: (ids: string[]) => void;

  accounts: Account[];
  addAccount: (name: string) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;

  categories: string[];
  addCategory: (newCategory: string) => boolean;

  budgets: Budget[];
  addBudget: (category: string, amount: number, month: string, id?: string) => void;
  deleteBudget: (id: string) => void;

  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (tx: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (tx: RecurringTransaction) => void;
  deleteRecurringTransaction: (id: string) => void;
  postRecurringTransaction: (id: string) => void;

  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  exportData: () => void;
  importData: (data: string) => Promise<boolean>;
  clearAllData: () => void;
};