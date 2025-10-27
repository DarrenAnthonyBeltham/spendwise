import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ChartBarIcon, HomeIcon, WalletIcon, CalendarDaysIcon, ArrowPathIcon,
  TrophyIcon, Cog6ToothIcon, DocumentChartBarIcon, BanknotesIcon, CreditCardIcon
} from '@heroicons/react/24/outline';
import type { AppContextType } from '../App';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Accounts', href: '/accounts', icon: WalletIcon },
  { name: 'Investments', href: '/investments', icon: BanknotesIcon },
  { name: 'Debts', href: '/debts', icon: CreditCardIcon },
  { name: 'Budgets', href: '/budgets', icon: CalendarDaysIcon },
  { name: 'Trends', href: '/trends', icon: ChartBarIcon },
  { name: 'Recurring', href: '/recurring', icon: ArrowPathIcon },
  { name: 'Goals', href: '/goals', icon: TrophyIcon },
  { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const pageVariants: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeInOut" } },
  exit: { opacity: 0, scale: 1.02, transition: { duration: 0.2, ease: "easeInOut" } },
};

export default function Layout({ context }: { context: AppContextType }) {
  const location = useLocation();

  return (
    <div className={`flex min-h-screen ${context.theme}`}>
      <nav className="w-14 md:w-64 bg-slate-100 dark:bg-slate-900 p-4 flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-700">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-8 hidden md:block">
          SpendWise
        </h1>
        <ul className="space-y-2 flex-1 overflow-y-auto">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink to={item.href} className={({ isActive }) => classNames(
                  'flex items-center p-2 rounded-md gap-3 transition-colors duration-150 text-slate-600 dark:text-slate-400',
                  isActive
                    ? 'bg-sky-500 text-white dark:bg-sky-600 dark:text-white'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
                )}
              >
                <item.icon className="h-6 w-6 shrink-0" />
                <span className="hidden md:block">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100">
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto p-4 md:p-8 h-full">
              <Outlet context={context} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}