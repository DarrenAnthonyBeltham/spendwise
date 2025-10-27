import { useState } from 'react';
import { useAppOutletContext } from '../App';

export default function CreateFirstAccount() {
  const { addAccount } = useAppOutletContext();
  const [accountName, setAccountName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accountName.trim()) {
      addAccount(accountName.trim());
      setAccountName('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4 w-full"
    >
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to SpendWise!</h2>
      <p className="text-slate-600 dark:text-slate-300 mb-4">Create your first account to start tracking transactions.</p>
      <div>
        <label htmlFor="account-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Account Name
        </label>
        <input
          type="text"
          id="account-name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="e.g. 'Checking'"
          className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 dark:focus:ring-offset-slate-800 transition-colors duration-150"
      >
        Create Account
      </button>
    </form>
  );
}