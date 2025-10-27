import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import type { Account, Transaction } from '../types'; 
import CustomSelect from './CustomSelect';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (changes: Partial<Pick<Transaction, 'accountId' | 'tags'>> & { category?: string }) => void;
  accounts: Account[];
  categories: string[];
  numSelected: number;
}

export default function BulkEditModal({ isOpen, onClose, onUpdate, accounts, categories, numSelected }: BulkEditModalProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [tagAction, setTagAction] = useState<'replace' | 'add' | 'remove'>('add');

  const accountMap = new Map(accounts.map((a: Account) => [a.id, a.name]));
  const accountOptions = ["(No Change)", ...accounts.map(a => a.name)];
  const categoryOptions = ["(No Change)", ...categories];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const changes: Partial<Pick<Transaction, 'accountId' | 'tags'>> & { category?: string } = {};

    if (accountId) changes.accountId = accountId;
    if (category) changes.category = category;

    const tagsToProcess = tags.split(',').map(t => t.trim()).filter(t => t);
    if (tagsToProcess.length > 0) {
        changes.tags = [];
        alert("Tag bulk editing logic needs to be implemented in App.tsx based on action.");
    }

    onUpdate(changes);
    onClose();
  };

  const handleAccountChange = (value: string | null) => {
    if (value === "(No Change)" || value === null) { setAccountId(null); }
    else { const selectedId = accounts.find(a => a.name === value)?.id; setAccountId(selectedId || null); }
  };

   const handleCategoryChange = (value: string | null) => {
    if (value === "(No Change)" || value === null) { setCategory(null); }
    else { setCategory(value); }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-white">Bulk Edit {numSelected} Transactions</Dialog.Title>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account</label>
                  <CustomSelect value={accountId ? accountMap.get(accountId) ?? '(No Change)' : '(No Change)'} onChange={handleAccountChange} options={accountOptions} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category (Only affects single-split transactions)</label>
                  <CustomSelect value={category ?? '(No Change)'} onChange={handleCategoryChange} options={categoryOptions} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags (comma-separated)</label>
                    <div className="mt-1 flex gap-2">
                         <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., work, reimbursement" className="flex-grow bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/>
                         <select value={tagAction} onChange={(e) => setTagAction(e.target.value as any)} className="bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white focus:ring-sky-500 focus:border-sky-500 text-sm">
                             <option value="add">Add</option> <option value="remove">Remove</option> <option value="replace">Replace All</option>
                         </select>
                    </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Leave fields as "(No Change)" or empty to keep original values.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600" onClick={onClose}>Cancel</button>
                  <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">Update Selected</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div></div>
      </Dialog>
    </Transition>
  );
}