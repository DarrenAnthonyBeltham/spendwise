# SpendWise 💸

SpendWise is a modern, front-end personal finance dashboard designed to help you track your income and expenses. It provides a clean visual overview of your spending habits with interactive charts and filtering, all while running entirely in your browser. All data is saved locally to your browser's `localStorage`.

## Key Features

* **Log Transactions:** Easily add income or expense transactions with an amount, date, and category.
* **Dynamic Categories:** Add your own custom categories, which are saved and become available in all dropdowns.
* **Interactive Charts:**
    * **Expenses by Category:** A pie chart showing the percentage breakdown of your expenses.
    * **Income vs. Expense:** A bar chart comparing your total income against your total expenses.
* **Data Persistence:** All transactions and custom categories are saved in your browser's `localStorage`, so your data is waiting for you when you return.
* **Advanced Filtering:**
    * Filter transactions by any category.
    * Filter transactions by a custom date range using a beautiful, integrated calendar.
* **Transaction History:** A clear, sortable table of all your filtered transactions.
* **Responsive Design:** A modern, dark-themed UI that works beautifully on both desktop and mobile devices.

## Tech Stack

This project is built 100% on the front-end using a modern web stack:

* **Framework:** [React](https://reactjs.org/)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Styling:** [Tailwind CSS v4 (alpha)](https://tailwindcss.com/)
* **UI Components:** [Headless UI](https://headlessui.com/) (for accessible, custom dropdowns and date pickers)
* **Charts:** [Recharts](https://recharts.org/)
* **Date Management:** [date-fns](https://date-fns.org/)
* **Icons:** [Heroicons](https://heroicons.com/)
