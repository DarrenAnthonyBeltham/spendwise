export interface Transaction {
  id: string;
  text: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}