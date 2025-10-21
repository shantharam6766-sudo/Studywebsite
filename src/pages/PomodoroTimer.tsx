import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Settings, X, Save, Bell, BellOff, SkipForward, Maximize, Upload, Palette, Monitor } from 'lucide-react';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useStudyData } from '../contexts/StudyDataContext';
import ImmersiveTimer from '../components/ImmersiveTimer';

// Helper to convert total minutes to an {h, m} object of strings
const minutesToHrMin = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { h: String(hours), m: String(minutes) };
};

const PomodoroTimer: React.FC = () => {
  const {
    timeLeft, isActive, mode, state, pomodoroCount, cycleCount,
    startTimer, pauseTimer, stopTimer, resetTimer, skipSession,
    switchToWork, switchToShortBreak, switchToLongBreak,
    autoStartBreaks, autoStartPomodoros, setAutoStartBreaks, setAutoStartPomodoros,
    notificationsEnabled, setNotificationsEnabled, requestNotificationPermission,
    getProgressPercentage, getFormattedTime, getSessionInfo,
    isImmersive, setIsImmersive,
  } = usePomodoro();
  const { pomodoroSettings, updatePomodoroSettings } = useStudyData();

  const [showSettings, setShowSettings] = useState(false);
  const [customBackground, setCustomBackground] = useState<string | null>(() => {
    return localStorage.getItem('pomodoroCustomBackground');
  });
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('pomodoroSelectedTheme') || 'theme1';
  });

  // Built-in themes
  const builtInThemes = [
    {
      id: 'theme1',
      name: 'Mountain Sunset',
      url: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      preview: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    },
    {
      id: 'theme2',
      name: 'Ocean Waves',
      url: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      preview: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    },
    {
      id: 'theme3',
      name: 'Forest Path',
      url: 'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      preview: 'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    },
    {
      id: 'theme4',
      name: 'Desert Dunes',
      url: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      preview: 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
    }
  ];

  const [localSettings, setLocalSettings] = useState({
    workDuration: minutesToHrMin(pomodoroSettings.workDuration),
    shortBreakDuration: minutesToHrMin(pomodoroSettings.shortBreakDuration),
    longBreakDuration: minutesToHrMin(pomodoroSettings.longBreakDuration),
  });

  const handleDurationChange = (
    field: 'workDuration' | 'shortBreakDuration' | 'longBreakDuration',
    unit: 'h' | 'm',
    value: string
  ) => {
    if (!/^\d*$/.test(value)) return;
    
    setLocalSettings(prev => ({
      ...prev,
      [field]: { ...prev[field], [unit]: value },
    }));
  };
  
  const handleSaveSettings = () => {
    const hrMinToMinutes = ({ h, m }: { h: string, m: string }) => {
        const hours = parseInt(h, 10) || 0;
        const minutes = parseInt(m, 10) || 0;
        return (hours * 60) + minutes;
    };

    const newSettings = {
      workDuration: hrMinToMinutes(localSettings.workDuration),
      shortBreakDuration: hrMinToMinutes(localSettings.shortBreakDuration),
      longBreakDuration: hrMinToMinutes(localSettings.longBreakDuration),
    };
    
    updatePomodoroSettings(newSettings);
    
    if (!isActive) {
      if (mode === 'work') switchToWork();
      else if (mode === 'shortBreak') switchToShortBreak();
      else if (mode === 'longBreak') switchToLongBreak();
    }
    setShowSettings(false);
  };
  
  useEffect(() => {
    if (showSettings) {
      setLocalSettings({
        workDuration: minutesToHrMin(pomodoroSettings.workDuration),
        shortBreakDuration: minutesToHrMin(pomodoroSettings.shortBreakDuration),
        longBreakDuration: minutesToHrMin(pomodoroSettings.longBreakDuration),
      });
    }
  }, [showSettings, pomodoroSettings]);

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert('Notifications were denied. Please enable them in your browser settings for the best experience.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleCustomBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCustomBackground(result);
        localStorage.setItem('pomodoroCustomBackground', result);
        setSelectedTheme('custom');
        localStorage.setItem('pomodoroSelectedTheme', 'custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    localStorage.setItem('pomodoroSelectedTheme', themeId);
    if (themeId !== 'custom') {
      setCustomBackground(null);
      localStorage.removeItem('pomodoroCustomBackground');
    }
  };

  const getCurrentBackground = () => {
    if (selectedTheme === 'custom' && customBackground) {
      return customBackground;
    }
    const theme = builtInThemes.find(t => t.id === selectedTheme);
    return theme?.url || builtInThemes[0].url;
  };

  const progressPercentage = getProgressPercentage();

  const enterImmersiveMode = async () => {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      try {
        await screen.orientation.lock('landscape');
      } catch (err) {
        console.error("Could not lock screen orientation:", err);
      }
    }
    setIsImmersive(true);
  };

  const exitImmersiveMode = async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    }
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
    setIsImmersive(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isImmersive) {
        exitImmersiveMode();
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isImmersive) {
        setIsImmersive(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isImmersive]);

  if (isImmersive) {
    return (
      <ImmersiveTimer
        timeLeft={timeLeft}
        isActive={isActive}
        mode={mode}
        backgroundImage={getCurrentBackground()}
        onExit={exitImmersiveMode}
        onPlayPause={isActive ? pauseTimer : startTimer}
        onStop={stopTimer}
        onSkip={skipSession}
        getFormattedTime={getFormattedTime}
        getSessionInfo={getSessionInfo}
        progressPercentage={progressPercentage}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-heading font-bold">Pomodoro Timer</h1>
        <div className="flex items-center space-x-2">
          {/* --- CHANGE 1: The Immersive button is REMOVED from here --- */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className="btn-outline flex items-center"
          >
            <Settings size={16} className="mr-3" /> Settings
          </motion.button>
        </div>
      </div>

      <motion.div 
        className="glassmorphism p-8 rounded-xl flex flex-col items-center" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        {/* --- CHANGE 1: The Immersive button is ADDED here for prominence --- */}
        <div className="w-full flex justify-center mb-6">
            <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={enterImmersiveMode}
                className="btn-secondary w-full sm:w-auto flex items-center justify-center text-lg px-8 py-3"
                title="Enter Immersive Mode"
            >
                <Maximize size={20} className="mr-2" /> Enter Immersive Mode
            </motion.button>
        </div>

        <div className="flex justify-center mb-6 space-x-2">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => switchToWork()} disabled={isActive} className={`px-4 py-2 rounded-lg transition-all duration-200 ${mode === 'work' ? 'bg-primary text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}>Focus</motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => switchToShortBreak()} disabled={isActive} className={`px-4 py-2 rounded-lg transition-all duration-200 ${mode === 'shortBreak' ? 'bg-secondary text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}>Short Break</motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => switchToLongBreak()} disabled={isActive} className={`px-4 py-2 rounded-lg transition-all duration-200 ${mode === 'longBreak' ? 'bg-secondary-dark text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'} ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}>Long Break</motion.button>
        </div>
        
        <div className="relative w-full max-w-xs aspect-square mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-gray-200 dark:text-gray-700" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="283" strokeDashoffset={283 - (283 * progressPercentage) / 100} strokeLinecap="round" className={`transition-all duration-1000 ${mode === 'work' ? 'text-primary dark:text-primary-light' : mode === 'shortBreak' ? 'text-secondary dark:text-secondary-light' : 'text-secondary-dark dark:text-secondary'}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold font-heading mb-2">{getFormattedTime()}</span>
            <span className="text-lg text-gray-600 dark:text-gray-400 mb-2">{getSessionInfo()}</span>
            <span className="text-sm text-gray-500 dark:text-gray-500">{state === 'running' ? 'In Progress' : state === 'paused' ? 'Paused' : 'Ready'}</span>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={isActive ? pauseTimer : startTimer} className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'} w-20 h-16 flex items-center justify-center text-lg`}>{isActive ? <Pause size={28} /> : <Play size={28} />}</motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={stopTimer} className="btn-outline w-16 h-16 flex items-center justify-center"><RotateCcw size={24} /></motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={skipSession} className="btn-ghost w-16 h-16 flex items-center justify-center"><SkipForward size={24} /></motion.button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-primary dark:text-primary-light">{pomodoroCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</div>
          </div>
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-2xl font-bold text-secondary dark:text-secondary-light">{cycleCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cycles</div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-center space-x-2">
          {/* --- CHANGE 2: Update the "Reset All" button to "Close Widget" and change its action --- */}
          <motion.button 
            whileTap={{ scale: 0.95 }} 
            onClick={stopTimer} // <-- Changed from resetTimer to stopTimer
            className="btn-outline text-sm px-4 py-2"
          >
            Close Widget 
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleNotificationToggle} className={`btn-outline text-sm px-4 py-2 flex items-center ${notificationsEnabled ? 'text-success' : 'text-gray-600 dark:text-gray-400'}`}>{notificationsEnabled ? <Bell size={16} className="mr-1" /> : <BellOff size={16} className="mr-1" />} {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}</motion.button>
        </div>
      </motion.div>
      
      {/* Settings Modal (No changes needed here) */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              className="glassmorphism p-6 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-heading font-semibold">Pomodoro Settings</h2>
                <button onClick={() => setShowSettings(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Monitor size={20} className="mr-2 text-primary" />
                    Immersive Mode Customization
                  </h3>
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-3">Built-in Themes</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {builtInThemes.map(theme => (
                        <motion.div
                          key={theme.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleThemeSelect(theme.id)}
                          className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                            selectedTheme === theme.id 
                              ? 'border-primary shadow-lg' 
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <img 
                            src={theme.preview} 
                            alt={theme.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-end">
                            <div className="p-3 text-white text-sm font-medium">
                              {theme.name}
                            </div>
                          </div>
                          {selectedTheme === theme.id && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="white">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-md font-medium mb-3">Custom Background</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <label className="btn-outline cursor-pointer flex items-center">
                          <Upload size={16} className="mr-2" />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCustomBackgroundUpload}
                            className="hidden"
                          />
                        </label>
                        {customBackground && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleThemeSelect('custom')}
                            className={`btn-outline flex items-center ${
                              selectedTheme === 'custom' ? 'bg-primary text-white' : ''
                            }`}
                          >
                            <Palette size={16} className="mr-2" />
                            Use Custom
                          </motion.button>
                        )}
                      </div>
                      
                      {customBackground && (
                        <div className="relative rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <img 
                            src={customBackground} 
                            alt="Custom background"
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-end">
                            <div className="p-3 text-white text-sm font-medium">
                              Your Custom Background
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Timer Durations</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Focus</span>
                      <div className="flex items-center space-x-2">
                        <input type="text" placeholder="hr" value={localSettings.workDuration.h} onChange={(e) => handleDurationChange('workDuration', 'h', e.target.value)} className="w-16 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-center focus:ring-2 focus:ring-primary focus:outline-none" />
                        <span className="font-bold">:</span>
                        <input type="text" placeholder="min" value={localSettings.workDuration.m} onChange={(e) => handleDurationChange('workDuration', 'm', e.target.value)} className="w-16 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-center focus:ring-2 focus:ring-primary focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Short Break</span>
                      <div className="flex items-center space-x-2">
                         <input type="text" placeholder="hr" value={localSettings.shortBreakDuration.h} onChange={(e) => handleDurationChange('shortBreakDuration', 'h', e.target.value)} className="w-16 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-center focus:ring-2 focus:ring-secondary focus:outline-none" />
                        <span className="font-bold">:</span>
                        <input type="text" placeholder="min" value={localSettings.shortBreakDuration.m} onChange={(e) => handleDurationChange('shortBreakDuration', 'm', e.target.value)} className="w-16 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-center focus:ring-2 focus:ring-secondary focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Long Break</span>
                      <div className="flex items-center space-x-2">
                         <input type="text" placeholder="hr" value={localSettings.longBreakDuration.h} onChange={(e) => handleDurationChange('longBreakDuration', 'h', e.target.value)} className="w-16 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-center focus:ring-2 focus:ring-secondary-dark focus:outline-none" />
                        <span className="font-bold">:</span>
                        <input type="text" placeholder="min" value={localSettings.longBreakDuration.m} onChange={(e) => handleDurationChange('longBreakDuration', 'm', e.target.value)} className="w-16 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-center focus:ring-2 focus:ring-secondary-dark focus:outline-none" />
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Auto-start Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Auto-start breaks</span>
                      <input type="checkbox" checked={autoStartBreaks} onChange={(e) => setAutoStartBreaks(e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary-light dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Auto-start pomodoros</span>
                      <input type="checkbox" checked={autoStartPomodoros} onChange={(e) => setAutoStartPomodoros(e.target.checked)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary-light dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    </label>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Browser notifications</span>
                      <input type="checkbox" checked={notificationsEnabled} onChange={handleNotificationToggle} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary-light dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Get notified when sessions complete, even when the tab is not active.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Immersive Mode Features</h4>
                  <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Full-screen distraction-free environment</li>
                    <li>• Custom backgrounds and built-in themes</li>
                    <li>• Adaptive text color for optimal visibility</li>
                    <li>• Screen wake lock to prevent dimming</li>
                    <li>• Press ESC or click X to exit anytime</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end mt-8">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSaveSettings} className="btn-primary flex items-center">
                  <Save size={16} className="mr-2" /> Save Settings
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PomodoroTimer;