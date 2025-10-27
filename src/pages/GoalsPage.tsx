import { useState } from 'react';
import { useAppOutletContext } from '../App';
import type { Goal } from '../types';
import { formatCurrency } from '../lib/helpers';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/ConfirmationModal';

export default function GoalsPage() {
  const { goals, addGoal, updateGoal, deleteGoal } = useAppOutletContext();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('');

  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTargetAmount = parseFloat(targetAmount);
    const numCurrentAmount = parseFloat(currentAmount);
    if (!name.trim() || !numTargetAmount || numTargetAmount <= 0 || numCurrentAmount < 0) { alert('Please enter valid goal details.'); return; }
    const goalData = { name: name.trim(), targetAmount: numTargetAmount, currentAmount: numCurrentAmount, targetDate: targetDate || undefined };
    if (editingGoal) { updateGoal({ ...editingGoal, ...goalData }); } else { addGoal(goalData); }
    resetForm();
  };
  const handleEdit = (goal: Goal) => { setEditingGoal(goal); setName(goal.name); setTargetAmount(goal.targetAmount.toString()); setCurrentAmount(goal.currentAmount.toString()); setTargetDate(goal.targetDate || ''); };
  const openDeleteModal = (goal: Goal) => { setGoalToDelete(goal); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setGoalToDelete(null); setIsDeleteModalOpen(false); };
  const handleConfirmDelete = () => { if (goalToDelete) { deleteGoal(goalToDelete.id); } };
  const resetForm = () => { setEditingGoal(null); setName(''); setTargetAmount(''); setCurrentAmount('0'); setTargetDate(''); };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Financial Goals</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{editingGoal ? 'Update Goal' : 'Add New Goal'}</h2>
        <div><label htmlFor="goal-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Goal Name</label><input type="text" id="goal-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Vacation Fund" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label htmlFor="target-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Amount</label><input type="number" step="any" id="target-amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="5000" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
          <div><label htmlFor="current-amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Amount Saved</label><input type="number" step="any" id="current-amount" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} placeholder="0" required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        </div>
        <div><label htmlFor="target-date" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Target Date (Optional)</label><input type="date" id="target-date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white"/></div>
        <button type="submit" className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 rounded-md text-white">{editingGoal ? 'Update Goal' : 'Add Goal'}</button>
        {editingGoal && <button type="button" onClick={resetForm} className="w-full py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-md text-slate-700 dark:text-slate-300">Cancel Edit</button>}
      </form>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Your Goals</h3>
        {goals.length === 0 ? (
          <p className="text-center py-10 text-slate-500 dark:text-slate-400">No goals set yet.</p>
        ) : (
          goals.map((goal: Goal) => {
            const progress = goal.targetAmount > 0 ? Math.min((goal.currentAmount / goal.targetAmount) * 100, 100) : 0;
            return (
              <div key={goal.id} className="text-slate-800 dark:text-white p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="font-medium text-lg">{goal.name}</span>
                    {goal.targetDate && <p className="text-xs text-slate-500 dark:text-slate-400">Target: {goal.targetDate}</p>}
                  </div>
                  <div className="flex gap-3 items-center">
                     <button onClick={() => handleEdit(goal)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"><PencilSquareIcon className="h-5 w-5"/></button>
                     <button onClick={() => openDeleteModal(goal)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button>
                  </div>
                </div>
                 <div className="flex justify-between text-sm mb-1 text-slate-600 dark:text-slate-300">
                     <span>Progress: {progress.toFixed(0)}%</span>
                     <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                 </div>
                 <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-4 overflow-hidden">
                   <div className="h-4 rounded-full bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                 </div>
              </div>
            );
          })
        )}
      </div>
      {goalToDelete && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleConfirmDelete} title="Delete Goal" message={`Delete "${goalToDelete.name}"?`} />}
    </div>
  );
}