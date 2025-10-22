// src/components/Sidebar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useStudyData } from '../contexts/StudyDataContext';

interface NavLinkItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  navLinks: NavLinkItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ open, setOpen, navLinks }) => {
  const { exams } = useStudyData();

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const overlayVariants = {
    open: { opacity: 0.5, display: 'block' },
    closed: { opacity: 0, transitionEnd: { display: 'none' } }
  };

  const today = new Date();
  const upcomingExams = exams
    .filter(exam => !exam.isPlaceholder && differenceInDays(parseISO(exam.date), today) >= 0)
    .sort((a, b) => differenceInDays(parseISO(a.date), today) - differenceInDays(parseISO(b.date), today))
    .slice(0, 2);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black backdrop-blur-sm z-30 md:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className="fixed top-0 left-0 z-40 h-screen w-64 lg:w-72 xl:w-80 pt-16 glassmorphism border-r border-white/20 dark:border-slate-700/20 md:translate-x-0"
        initial="closed"
        animate={open ? 'open' : 'closed'}
        variants={sidebarVariants}
      >
        <div className="flex flex-col h-full p-4 lg:p-6">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `flex items-center px-3 py-2 lg:py-4 rounded-xl transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light font-medium shadow-sm' 
                      : 'hover:bg-gray-100/70 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <span className="mr-3 lg:mr-4 transition-transform duration-200 group-hover:scale-110 flex-shrink-0">
                    <Icon size={20} />
                  </span>
                  <span className="font-medium text-sm lg:text-base">{link.label}</span>
                  {({ isActive }) => isActive && <div className="absolute right-2 w-2 h-2 bg-primary dark:bg-primary-light rounded-full"></div>}
                </NavLink>
              );
            })}
          </nav>

          {upcomingExams.length > 0 && (
            <motion.div 
              className="p-4 lg:p-5 mt-6 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary-light/10 dark:to-secondary-light/10 border border-primary/20 dark:border-primary-light/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={18} className="text-primary dark:text-primary-light flex-shrink-0" />
                <h3 className="font-semibold text-primary dark:text-primary-light text-sm lg:text-base">Upcoming Exams</h3>
              </div>
              <div className="space-y-3">
                {upcomingExams.map(exam => {
                  const daysLeft = differenceInDays(parseISO(exam.date), today);
                  return (
                    <div key={exam.id} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 backdrop-blur-sm">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-1">{exam.title}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <Clock size={12} className="mr-1 flex-shrink-0" />
                          {format(parseISO(exam.date), 'MMM d')}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${daysLeft === 0 ? 'bg-error/20 text-error' : daysLeft <= 7 ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'}`}>
                          {daysLeft === 0 ? 'Today!' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft}d`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;