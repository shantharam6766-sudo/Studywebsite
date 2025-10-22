
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SyllabusTracker from './pages/SyllabusTracker';
import DailyTasks from './pages/DailyTasks';
import PomodoroTimer from './pages/PomodoroTimer';
import Notes from './pages/Notes';
import Resources from './pages/Resources';
import Exams from './pages/Exams';
import Progress from './pages/Progress';
import Account from './pages/Account';
import PomodoroWidget from './components/PomodoroWidget';
import AuthModal from './components/AuthModal';
import { useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { usePomodoro } from './contexts/PomodoroContext';
import { useAuth } from './contexts/AuthContext';
import Confetti from 'react-confetti';
import GlobalLoader from './components/GlobalLoader';

function App() {
  const location = useLocation();
  const { theme } = useTheme();
  const { showConfetti } = usePomodoro();
  const { loading: authLoading } = useAuth(); // Only auth loading is needed here now.

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Optimistic Loading: Only show the global loader for the initial, fast auth check.
  // Data loading and syncing now happen in the background.
  if (authLoading) {
    return <GlobalLoader />;
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={800}
          gravity={0.1}
          colors={['#60A5FA', '#F59E0B', '#10B981', '#8B5CF6']}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999 }}
        />
      )}
      
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/syllabus" element={<SyllabusTracker />} />
            <Route path="/tasks" element={<DailyTasks />} />
            <Route path="/pomodoro" element={<PomodoroTimer />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </AnimatePresence>
        
        <PomodoroWidget />
      </Layout>

      <AuthModal />
    </>
  );
}

export default App;
