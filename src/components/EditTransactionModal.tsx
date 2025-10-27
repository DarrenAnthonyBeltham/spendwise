import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { Transaction, Account, TransactionSplit } from '../types';
import { useAppOutletContext } from '../App';
import CustomSelect from './CustomSelect';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export default function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const { updateTransaction, accounts, categories } = useAppOutletContext();

  const initialSplit = transaction.splits[0] || { category: '', amount: 0 };

  const [amount, setAmount] = useState(initialSplit.amount.toString());
  const [date, setDate] = useState(transaction.date);
  const [accountId, setAccountId] = useState(transaction.accountId);
  const [category, setCategory] = useState(initialSplit.category);
  const [type, setType] = useState(transaction.type);
  const [tags, setTags] = useState(transaction.tags?.join(', ') || '');
  const [notes, setNotes] = useState(transaction.notes || '');

  const accountMap = new Map(accounts.map((a: Account) => [a.id, a.name]));
  const categoryNameList = categories.map(c => c.name);

  useEffect(() => {
    const split = transaction.splits[0] || { category: '', amount: 0 };
    setAmount(split.amount.toString());
    setDate(transaction.date);
    setAccountId(transaction.accountId);
    setCategory(split.category);
    setType(transaction.type);
    setTags(transaction.tags?.join(', ') || '');
    setNotes(transaction.notes || '');
  }, [transaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0 || !accountId || !category) {
      alert('Please fill out all fields with valid data.');
      return;
    }

    const updatedSplits: TransactionSplit[] = [{ category, amount: numericAmount }];

    updateTransaction({
      ...transaction,
      splits: updatedSplits,
      totalAmount: numericAmount,
      date,
      accountId,
      type,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Edit Transaction</Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="amount-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label><input type="number" id="amount-edit" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
                    <div><label htmlFor="date-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Date</label><input type="date" id="date-edit" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label htmlFor="account-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label><CustomSelect value={accountMap.get(accountId) || ''} onChange={(val) => { const id = accounts.find((a: Account) => a.name === val)?.id || ''; setAccountId(id); }} options={accounts.map((a: Account) => a.name)} placeholder="Select Account" /></div>
                    <div><label htmlFor="category-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label><CustomSelect value={category} onChange={(val) => setCategory(val || '')} options={categoryNameList} placeholder="Select Category" /></div>
                  </div>
                  <div><label htmlFor="type-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label><CustomSelect value={type} onChange={(val) => setType((val as 'income' | 'expense') || 'expense')} options={['expense', 'income']} /></div>
                  <div><label htmlFor="tags-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label><input type="text" id="tags-edit" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
                  <div><label htmlFor="notes-edit" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label><textarea id="notes-edit" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white"></textarea></div>
                   <div className="mt-4 flex justify-end gap-2">
                     <button type="button" className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800" onClick={onClose}>Cancel</button>
                     <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">Save Changes</button>
                   </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}