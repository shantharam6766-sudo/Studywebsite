// src/components/Header.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface NavLink {
  to: string;
  label: string;
  icon: React.ElementType; 
}

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navLinks: NavLink[];
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, navLinks }) => {
  const { theme, toggleTheme } = useTheme();
  const today = new Date();
  const formattedDate = format(today, 'EEEE, MMMM d, yyyy');
  const currentTime = format(today, 'h:mm a');

  return (
    <header className="fixed top-0 left-0 right-0 z-20 glassmorphism border-b border-white/20 dark:border-slate-700/20">
      <div className="flex items-center justify-between mx-auto max-w-7xl px-4 md:px-6 lg:px-8 h-16">
        
        <div className="flex items-center flex-1 lg:flex-none">
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-2 p-1.5 rounded-xl text-gray-600 dark:text-gray-300 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <motion.div animate={{ rotate: sidebarOpen ? 90 : 0 }}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </motion.button>
          
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent mb-0">
            StudyForExams
          </h1>
        </div>

        {/* Center Section: Desktop Navigation with the "Active Pill" style */}
        <nav className="hidden lg:flex flex-1 justify-center items-center space-x-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              // <<< THIS IS THE ONLY PART THAT CHANGED >>>
              // This logic now applies a background "pill" to the active link
              // and a different background for hovering over other links.
              className={({ isActive }) => `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive 
                  ? 'bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
    
        <div className="flex items-center justify-end space-x-3 flex-1 lg:flex-none">
          <div className="hidden md:flex items-center bg-white/50 dark:bg-gray-800/50 rounded-xl px-4 py-2 backdrop-blur-sm">
            <Clock size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-300 block leading-tight">{formattedDate}</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 block leading-tight">{currentTime}</span>
            </div>
          </div>
          <motion.button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-200/70 dark:bg-gray-700/70"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-600" />}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;