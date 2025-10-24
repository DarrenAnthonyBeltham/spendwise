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
      className="bg-slate-800 p-6 rounded-xl shadow-2xl space-y-4 w-full"
    >
      <h2 className="text-2xl font-bold text-white mb-2">Welcome to SpendWise!</h2>
      <p className="text-slate-300 mb-4">Create your first account to start tracking transactions.</p>
      <div>
        <label htmlFor="account-name" className="block text-sm font-medium text-slate-300">
          Account Name
        </label>
        <input
          type="text"
          id="account-name"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="e.g. 'Checking'"
          className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 transition-colors"
      >
        Create Account
      </button>
    </form>
  );
}