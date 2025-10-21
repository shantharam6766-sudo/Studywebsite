// src/components/Layout.tsx

import React, { useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './Header';
import Sidebar from './Sidebar';
import { 
  LayoutDashboard, BookOpen, CheckSquare, Timer, FileText, Link as LinkIcon, 
  LineChart, Calendar
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

// Define the navigation links in ONE central place
const navLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/exams', label: 'Exams', icon: Calendar },
  { to: '/syllabus', label: 'Syllabus', icon: BookOpen },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/pomodoro', label: 'Timer', icon: Timer },
  { to: '/tasks', label: 'Daily Tasks', icon: CheckSquare },
  { to: '/notes', label: 'Notes', icon: FileText },
  { to: '/resources', label: 'Resources', icon: LinkIcon },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-[#F7F8FC] dark:bg-[#111827]">
      {/* Pass the links to the Header */}
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        navLinks={navLinks} 
      />

      {/* Pass the links to the Sidebar */}
      <Sidebar 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
        navLinks={navLinks} 
      />

      <main className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;