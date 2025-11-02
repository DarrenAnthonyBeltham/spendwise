# SpendWise 💸

SpendWise is a comprehensive, client-side personal finance manager. It's a full-featured, multi-page application that runs entirely in your browser, using `localStorage` to keep your data private and persistent. Track everything from daily transactions and budgets to investments, debts, and your total net worth.



---

## Key Features

### 1. Core Financial Tracking
* **Split Transactions:** Log complex transactions with multiple categories (e.g., one grocery bill split into "Food" and "Household").
* **Multi-Account Management:** Create and manage multiple accounts (e.g., Checking, Savings, Credit Card) with full CRUD (Create, Read, Update, Delete) functionality.
* **Tags & Notes:** Add custom tags (`#vacation`) or detailed notes to any transaction for powerful searching and filtering.

### 2. Financial Planning
* **Budgets:** Create monthly budgets per category. The app visually tracks your spending against your budget with progress bars and variance calculations (over/under).
* **Goals:** Set and track your financial goals, such as saving for a vacation or paying off a debt.
* **Recurring Transactions:** Schedule recurring monthly bills or income. The dashboard will remind you when they are due so you can post them with one click.

### 3. Portfolio Management
* **Investments:** Manually log and track the current value of your investments (stocks, crypto, etc.) to see their impact on your net worth.
* **Debts:** Log your liabilities (loans, credit card debt) to get a true, complete picture of your financial health.

### 4. Data, Reporting & Analysis
* **Net Worth:** The dashboard automatically calculates your total net worth (All Accounts + Investments - Debts).
* **Savings Rate:** See your savings rate for the current month.
* **Trends Page:** A dedicated page with a line chart to visualize your income vs. expenses over time.
* **Reports Page:** A page for more detailed reports, starting with a monthly net income/loss bar chart.
* **Advanced Filtering:** Filter your transaction history by account, category, date range, amount range, or a text search for tags and notes.

### 5. Usability & Data Management
* **Full CRUD:** Create, Read, Update, and Delete transactions, accounts, budgets, goals, investments, and debts.
* **Bulk Actions:** Select multiple transactions from the history to bulk delete or bulk edit (change account, category, or tags) all at once.
* **Theme Toggle:** Instantly switch between a sleek dark mode and a clean light mode. Your preference is saved.
* **Category Management:** Add, rename, and safely delete your custom spending categories from the Settings page.
* **Data Security:** All data is stored *only* in your browser's `localStorage`.
* **Import/Export:**
    * **JSON:** Export your *entire* application data (all accounts, transactions, goals, etc.) to a single JSON file for backup.
    * **JSON:** Import a backup file to restore your data.
    * **CSV:** Import transactions from a standard CSV file (beta).
    * **Clear Data:** A "danger zone" option to securely wipe all data and reset the app.

---

## Tech Stack

* **Framework:** [React](https://reactjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (with class-based Light/Dark Mode)
* **Routing:** [React Router](https://reactrouter.com/)
* **Animation:** [Framer Motion](https://www.framer.com/motion/) (for page transitions)
* **UI Components:** [Headless UI](https://headlessui.com/) (for accessible, custom Modals and Selects)
* **Charts:** [Recharts](https://recharts.org/)
* **Date Management:** [date-fns](https://date-fns.org/)
* **CSV Parsing:** [Papaparse](https://www.papaparse.com/)
* **Icons:** [Heroicons](https://heroicons.com/)

---
