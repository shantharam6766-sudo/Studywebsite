// src/components/Header.tsx

import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X, Clock, LogIn, LogOut, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// Helper function to generate a color from a string
const generateColorFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 85%)`;
};

interface NavLinkType {
  to: string;
  label: string;
  icon: React.ElementType;
}

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navLinks: NavLinkType[];
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen, navLinks }) => {
  const { theme, toggleTheme } = useTheme();
  const { session, user, openAuthModal, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const formattedDate = format(new Date(), 'EEEE, MMMM d');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Duplicated from Account.tsx for consistency
  const getDisplayName = () => {
    if (!user) return 'User';
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    const emailName = user.email?.split('@')[0] ?? 'User';
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };

  const renderUserIcon = () => {
    if (!user) return null;
    const isGoogle = user.app_metadata.provider === 'google' && user.user_metadata?.avatar_url;

    if (isGoogle) {
      return <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-8 h-8 rounded-full" />;
    }

    const displayName = getDisplayName();
    const userInitial = displayName.charAt(0).toUpperCase();
    const iconBgColor = generateColorFromString(user.id);

    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ backgroundColor: iconBgColor }}
      >
        <span className="font-bold text-gray-700 dark:text-gray-900">{userInitial}</span>
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 glassmorphism border-b border-white/20 dark:border-slate-700/20">
      <div className="flex items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-xl text-gray-600 dark:text-gray-300 lg:hidden"
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

        <nav className="hidden lg:flex flex-1 justify-center items-center space-x-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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
    
        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <div className="hidden md:flex items-center text-sm text-gray-600 dark:text-gray-300">
             <Clock size={16} className="mr-2 flex-shrink-0" />
             {formattedDate}
          </div>

          <motion.button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
          </motion.button>

          {session ? (
            <div className="relative" ref={dropdownRef}>
               <button 
                 onClick={() => setDropdownOpen(!dropdownOpen)}
                 className="flex items-center justify-center p-1 rounded-full bg-gray-200/70 dark:bg-gray-700/70"
                 aria-label="User menu"
               >
                 {renderUserIcon()}
               </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full pt-2 w-52">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 py-1">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={user?.email}>{user?.email}</p>
                      </div>
                      <NavLink 
                        to="/account" 
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900/40"
                      >
                        <User size={16} className="mr-2"/>
                        My Account
                      </NavLink>
                      <button onClick={() => {
                        signOut();
                        setDropdownOpen(false);
                      }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <LogOut size={16} className="mr-2"/>
                        Sign Out
                      </button>
                    </div>
                </div>
              )}
            </div>
          ) : (
            <motion.button
              onClick={openAuthModal}
              className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary dark:bg-primary-light/10 dark:text-primary-light text-sm font-medium"
              aria-label="Sign In"
            >
              <LogIn size={16}/>
              <span className="hidden md:inline">Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;