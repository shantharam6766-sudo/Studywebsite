import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Timer, X, Settings } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useNavigate } from 'react-router-dom';

const PomodoroWidget: React.FC = () => {
  // --- CHANGE 1: Get the new isImmersive state from the context ---
  const {
    timeLeft,
    isActive,
    mode,
    state,
    pomodoroCount,
    startTimer,
    pauseTimer,
    stopTimer,
    getFormattedTime,
    getSessionInfo,
    getProgressPercentage,
    isImmersive, // <-- Get the shared state
  } = usePomodoro();
  
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = React.useState(false);

  // --- CHANGE 2: Modify the condition to hide the widget ---
  // Now, the widget will not be rendered if the timer is idle OR if immersive mode is active.
  if (state === 'idle' || isImmersive) {
    return null;
  }

  const progressPercentage = getProgressPercentage();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <motion.div
          layout
          className="glassmorphism rounded-xl shadow-lg border border-white/20 dark:border-slate-700/20 overflow-hidden"
          style={{ minWidth: isMinimized ? '60px' : '280px' }}
        >
          {isMinimized ? (
            // Minimized view
            <div className="p-3 flex items-center justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMinimized(false)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light"
              >
                <Timer size={20} />
              </motion.button>
            </div>
          ) : (
            // Expanded view
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Timer size={16} className="text-primary dark:text-primary-light mr-2" />
                  <span className="text-sm font-medium">{getSessionInfo()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/pomodoro')}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    <Settings size={14} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsMinimized(true)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              </div>

              <div className="text-center mb-3">
                <div className="text-2xl font-bold font-heading mb-1">
                  {getFormattedTime()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {pomodoroCount} sessions completed today
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className={`h-full rounded-full transition-all duration-1000 ${
                      mode === 'work'
                        ? 'bg-primary dark:bg-primary-light'
                        : mode === 'shortBreak'
                        ? 'bg-secondary dark:bg-secondary-light'
                        : 'bg-secondary-dark dark:bg-secondary'
                    }`}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isActive ? pauseTimer : startTimer}
                  className={`p-2 rounded-lg ${
                    isActive 
                      ? 'bg-secondary/10 text-secondary hover:bg-secondary/20' 
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  } transition-colors`}
                >
                  {isActive ? <Pause size={16} /> : <Play size={16} />}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={stopTimer}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw size={16} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PomodoroWidget;