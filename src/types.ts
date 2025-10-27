export interface Account {
  id: string;
  name: string;
}

export interface TransactionSplit {
  category: string;
  amount: number;
}

export interface Category {
  id: string;
  name: string;
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
  lastPostedDate?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
}

export interface Investment {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
}

export interface Debt {
  id: string;
  name: string;
  initialAmount: number;
  currentBalance: number;
  interestRate?: number;
}

export type Theme = 'light' | 'dark';

export type AppContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;

  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'totalAmount'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  deleteSelectedTransactions: (ids: string[]) => void;
  updateSelectedTransactions: (ids: string[], changes: Partial<Pick<Transaction, 'accountId' | 'tags'>> & { category?: string }) => void;

  accounts: Account[];
  addAccount: (name: string) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;

  categories: Category[];
  addCategory: (name: string) => boolean;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  budgets: Budget[];
  addBudget: (category: string, amount: number, month: string, id?: string) => void;
  deleteBudget: (id: string) => void;

  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (tx: Omit<RecurringTransaction, 'id'>) => void;
  updateRecurringTransaction: (tx: RecurringTransaction) => void;
  deleteRecurringTransaction: (id: string) => void;
  postRecurringTransaction: (id: string, forceDate?: string) => void;
  markRecurringTransactionPosted: (id: string, date: string) => void;

  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;

  investments: Investment[];
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
  updateInvestment: (inv: Investment) => void;
  deleteInvestment: (id: string) => void;

  debts: Debt[];
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateDebt: (debt: Debt) => void;
  deleteDebt: (id: string) => void;

  exportData: () => void;
  importData: (data: string) => Promise<boolean>;
  clearAllData: () => void;
};