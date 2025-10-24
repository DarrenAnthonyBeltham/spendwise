import { useState, useMemo, useEffect } from 'react';
import Background from './components/Background';
import TransactionForm from './components/TransactionForm';
import SummaryCharts from './components/SummaryCharts';
import TransactionList from './components/TransactionList';
import CustomSelect from './components/CustomSelect';
import CustomDatePicker from './components/CustomDatePicker';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

const INITIAL_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Salary',
  'Rent',
  'Entertainment',
  'Transport',
  'Other',
];

const getInitialTransactions = (): Transaction[] => {
  const savedTransactions = localStorage.getItem('transactions');
  if (savedTransactions) {
    try {
      return JSON.parse(savedTransactions);
    } catch (e) {
      console.error('Failed to parse transactions from localStorage', e);
      return [];
    }
  }
  return [];
};

const getInitialCategories = (): string[] => {
  const savedCategories = localStorage.getItem('categories');
  if (savedCategories) {
    try {
      return JSON.parse(savedCategories);
    } catch (e) {
      console.error('Failed to parse categories from localStorage', e);
      return INITIAL_CATEGORIES;
    }
  }
  return INITIAL_CATEGORIES;
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);
  const [categories, setCategories] = useState<string[]>(getInitialCategories);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...tx,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) =>
      [...prev, newTransaction].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  };

  const addCategory = (newCategory: string) => {
    const trimmedCategory = newCategory.trim();
    if (
      trimmedCategory &&
      !categories.find((c) => c.toLowerCase() === trimmedCategory.toLowerCase())
    ) {
      setCategories((prev) => [...prev, trimmedCategory]);
      return true;
    }
    return false;
  };

  const filterCategories = useMemo(() => {
    return ['all', ...categories];
  }, [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      const categoryMatch =
        categoryFilter === 'all' || tx.category === categoryFilter;
      const startDateMatch = !startDate || txDate >= startDate;
      const endDateMatch = !endDate || txDate <= endDate;

      return categoryMatch && startDateMatch && endDateMatch;
    });
  }, [transactions, categoryFilter, dateRange]);

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleDateRangeChange = (start: string, end: string) => {
    setDateRange({ start, end });
  };

  return (
    <>
      <Background />
      <div className="relative min-h-screen text-slate-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
              SpendWise Dashboard
            </h1>
            <p className="text-center text-slate-300 text-lg mt-2">
              Your personal finance overview.
            </p>
          </header>

          <div className="mb-8 bg-slate-800 p-6 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-bold text-white text-center">
              Total Balance:
              <span
                className={`ml-3 ${
                  totalBalance >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {formatCurrency(totalBalance)}
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1">
              <TransactionForm
                addTransaction={addTransaction}
                categories={categories}
                addCategory={addCategory}
              />
            </div>

            <div className="xl:col-span-2">
              <SummaryCharts transactions={filteredTransactions} />
            </div>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-2xl mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">
              Filter Transactions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="filter-category"
                  className="block text-sm font-medium text-slate-300"
                >
                  Category
                </label>
                <CustomSelect
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val || 'all')}
                  options={filterCategories}
                  placeholder="Select Category"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="filter-start-date"
                  className="block text-sm font-medium text-slate-300"
                >
                  Date Range
                </label>
                <CustomDatePicker
                  id="filter-date-range"
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onDateRangeChange={handleDateRangeChange}
                />
              </div>
            </div>
          </div>

          <TransactionList transactions={filteredTransactions} />
        </div>
      </div>
    </>
  );
}

export default App;