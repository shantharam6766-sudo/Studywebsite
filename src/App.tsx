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
import PomodoroWidget from './components/PomodoroWidget';
import { useEffect } from 'react';
import { useTheme } from './contexts/ThemeContext';
import { usePomodoro } from './contexts/PomodoroContext';
import Confetti from 'react-confetti';

function App() {
  const location = useLocation();
  const { theme } = useTheme();
  const { showConfetti } = usePomodoro();

  // Apply theme class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <>
      {/* Global Confetti for Focus Session Completion */}
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
          </Routes>
        </AnimatePresence>
        
        {/* Floating Pomodoro Widget */}
        <PomodoroWidget />
      </Layout>
    </>
  );
}

export default App;