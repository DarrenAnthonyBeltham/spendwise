import { useState, useRef, Fragment } from 'react';
import { useAppOutletContext } from '../App';
import ConfirmationModal from '../components/ConfirmationModal';
import type { Theme, Category } from '../types'; 
import { Dialog, Transition } from '@headlessui/react';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import Papa from 'papaparse';

export default function SettingsPage() {
  const { exportData, importData, clearAllData, theme, setTheme, categories, addCategory, updateCategory, deleteCategory } = useAppOutletContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [csvImportMessage, setCsvImportMessage] = useState<string | null>(null);

  const handleImportClick = () => { fileInputRef.current?.click(); };
  const handleCsvImportClick = () => { csvFileInputRef.current?.click(); };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return; setImportError(null); setImportSuccess(null);
    const reader = new FileReader();
    reader.onload = async (e) => { const text = e.target?.result as string; try { const success = await importData(text); if (success) { setImportSuccess('Data imported! Reloading...'); setTimeout(() => window.location.reload(), 1500); } } catch (error) { setImportError(error instanceof Error ? error.message : 'Import failed.'); } };
    reader.onerror = () => { setImportError('Failed to read file.'); }; reader.readAsText(file); if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     const file = event.target.files?.[0]; if (!file) return; setCsvImportMessage('Processing CSV...');
     Papa.parse(file, { header: true, skipEmptyLines: true, complete: (results) => { console.log("CSV Data:", results.data); setCsvImportMessage(`Processed ${results.data.length} rows. (Import logic pending)`); }, error: (error) => { console.error("CSV Parsing Error:", error); setCsvImportMessage(`Error: ${error.message}`); } });
     if (csvFileInputRef.current) { csvFileInputRef.current.value = ''; }
  };
   const handleExportCsv = () => { alert("CSV Export feature not yet implemented."); };
  const handleClearConfirm = () => { clearAllData(); setIsClearModalOpen(false); };
  const handleThemeChange = (newTheme: Theme) => { setTheme(newTheme); };
  const openCategoryModal = (category: Category | null = null) => { setEditingCategory(category); setCategoryName(category ? category.name : ''); setIsCategoryModalOpen(true); };
  const closeCategoryModal = () => { setIsCategoryModalOpen(false); setEditingCategory(null); setCategoryName(''); };
  const handleCategorySubmit = (e: React.FormEvent) => { e.preventDefault(); if (!categoryName.trim()) return; if (editingCategory) { updateCategory({ ...editingCategory, name: categoryName.trim() }); } else { addCategory(categoryName.trim()); } closeCategoryModal(); };
  const openDeleteCategoryModal = (category: Category) => { setCategoryToDelete(category); setIsDeleteCategoryModalOpen(true); };
  const closeDeleteCategoryModal = () => { setCategoryToDelete(null); setIsDeleteCategoryModalOpen(false); };
  const handleConfirmDeleteCategory = () => { if (categoryToDelete) { deleteCategory(categoryToDelete.id); } closeDeleteCategoryModal(); };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Settings</h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Appearance</h2>
        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Theme</label><div className="flex gap-4"><button onClick={() => handleThemeChange('light')} className={`flex-1 py-2 px-4 rounded-md text-sm border ${theme === 'light' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>Light</button><button onClick={() => handleThemeChange('dark')} className={`flex-1 py-2 px-4 rounded-md text-sm border ${theme === 'dark' ? 'bg-sky-500 text-white border-sky-500' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'}`}>Dark</button></div></div>
      </div>
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
           <div className="flex justify-between items-center"><h2 className="text-xl font-semibold text-slate-900 dark:text-white">Categories</h2><button onClick={() => openCategoryModal()} className="py-1 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-medium">Add New</button></div>
           <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">{categories.map((cat: Category) => (<li key={cat.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700 rounded"><span className="text-slate-800 dark:text-slate-200">{cat.name}</span><div className="flex gap-2"><button onClick={() => openCategoryModal(cat)} className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"><PencilSquareIcon className="h-5 w-5"/></button><button onClick={() => openDeleteCategoryModal(cat)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400"><TrashIcon className="h-5 w-5"/></button></div></li>))}</ul>
       </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Data Management</h2>
        <div className="space-y-4">
           <div><h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-2">JSON Backup</h3><div className="flex flex-col sm:flex-row gap-4"><button onClick={exportData} className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">Export All Data (.json)</button><button onClick={handleImportClick} className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Import All Data (.json)</button><input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden"/></div>{importError && <p className="text-red-500 text-sm mt-2">{importError}</p>}{importSuccess && <p className="text-green-500 text-sm mt-2">{importSuccess}</p>}</div>
            <div><h3 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-2">CSV Transactions</h3><div className="flex flex-col sm:flex-row gap-4"><button onClick={handleExportCsv} className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">Export Transactions (.csv)</button><button onClick={handleCsvImportClick} className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">Import Transactions (.csv)</button><input type="file" ref={csvFileInputRef} onChange={handleCsvFileChange} accept=".csv" className="hidden"/></div>{csvImportMessage && <p className="text-blue-500 text-sm mt-2">{csvImportMessage}</p>}</div>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-red-500/30 dark:border-red-500/50">
        <h2 className="text-xl font-semibold text-red-600 dark:text-red-500 mb-2">Danger Zone</h2><button onClick={() => setIsClearModalOpen(true)} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">Clear All Data</button><p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Permanently delete all data stored in this browser.</p>
      </div>
      <ConfirmationModal isOpen={isClearModalOpen} onClose={() => setIsClearModalOpen(false)} onConfirm={handleClearConfirm} title="Clear All Data" message="Are you absolutely sure? This cannot be undone." />
      <ConfirmationModal isOpen={isDeleteCategoryModalOpen} onClose={closeDeleteCategoryModal} onConfirm={handleConfirmDeleteCategory} title="Delete Category" message={`Delete "${categoryToDelete?.name}"? Make sure it's not used!`} />
      <Transition appear show={isCategoryModalOpen} as={Fragment}><Dialog as="div" className="relative z-50" onClose={closeCategoryModal}>
           <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/50 dark:bg-black/70"/></Transition.Child>
           <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-slate-900 dark:text-white">{editingCategory ? 'Edit Category' : 'Add New Category'}</Dialog.Title>
                <form onSubmit={handleCategorySubmit} className="mt-4 space-y-4">
                  <div><label htmlFor="category-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label><input type="text" id="category-name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} required className="mt-1 block w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-md py-2 px-3 text-slate-900 dark:text-white focus:ring-sky-500 focus:border-sky-500"/></div>
                  <div className="mt-4 flex justify-end gap-2"><button type="button" className="inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-600" onClick={closeCategoryModal}>Cancel</button><button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700">{editingCategory ? 'Update' : 'Add'}</button></div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
           </div></div>
        </Dialog></Transition>
    </div>
  );
}