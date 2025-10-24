import { useState, useRef } from 'react';
import { useAppOutletContext } from '../App';
import ConfirmationModal from '../components/ConfirmationModal';

export default function SettingsPage() {
  const { exportData, importData, clearAllData } = useAppOutletContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const success = await importData(text);
        if (success) {
          setImportSuccess('Data imported successfully! The page will reload.');
          setTimeout(() => window.location.reload(), 2000);
        }
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'An unknown error occurred during import.');
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file.');
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearConfirm = () => {
    clearAllData();
    setIsClearModalOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold text-white mb-8">Settings</h1>

      <div className="bg-slate-800 p-6 rounded-xl shadow-2xl space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Data Management</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={exportData}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
            >
              Export Data
            </button>
            <button
              onClick={handleImportClick}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Import Data
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
          {importError && <p className="text-red-500 text-sm mt-2">{importError}</p>}
          {importSuccess && <p className="text-green-500 text-sm mt-2">{importSuccess}</p>}
        </div>

        <div className="border-t border-slate-700 pt-6">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Danger Zone</h2>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Clear All Data
          </button>
          <p className="text-xs text-slate-400 mt-2">This will permanently delete all your accounts, transactions, budgets, recurring items, and goals stored in this browser.</p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearConfirm}
        title="Clear All Data"
        message="Are you absolutely sure you want to delete all data? This action cannot be undone."
      />
    </div>
  );
}