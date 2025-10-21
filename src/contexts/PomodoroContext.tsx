import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useStudyData } from './StudyDataContext';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';
type TimerState = 'idle' | 'running' | 'paused';

interface PomodoroContextType {
  timeLeft: number;
  isActive: boolean;
  mode: TimerMode;
  state: TimerState;
  pomodoroCount: number;
  cycleCount: number;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  skipSession: () => void;
  switchToWork: (start?: boolean) => void;
  switchToShortBreak: (start?: boolean) => void;
  switchToLongBreak: (start?: boolean) => void;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  setAutoStartBreaks: (value: boolean) => void;
  setAutoStartPomodoros: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  requestNotificationPermission: () => Promise<boolean>;
  getProgressPercentage: () => number;
  getFormattedTime: () => string;
  getSessionInfo: () => string;
  showConfetti: boolean;
  setShowConfetti: (show: boolean) => void;
  isImmersive: boolean;
  setIsImmersive: (immersive: boolean) => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const { pomodoroSettings, addPomodoroSession } = useStudyData();
  
  // Store the start time when timer begins
  const [startTime, setStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('pomodoroStartTime');
    return saved ? parseInt(saved) : null;
  });
  
  // Store the initial duration when timer starts
  const [initialDuration, setInitialDuration] = useState(() => {
    const saved = localStorage.getItem('pomodoroInitialDuration');
    return saved ? parseInt(saved) : pomodoroSettings.workDuration * 60;
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('pomodoroTimeLeft');
    const initialDuration = pomodoroSettings.workDuration * 60;
    return saved ? parseInt(saved) : initialDuration;
  });
  
  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem('pomodoroIsActive');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [mode, setMode] = useState<TimerMode>(() => {
    const saved = localStorage.getItem('pomodoroMode');
    return (saved as TimerMode) || 'work';
  });
  
  const [state, setState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('pomodoroState');
    return (saved as TimerState) || 'idle';
  });
  
  const [pomodoroCount, setPomodoroCount] = useState(() => {
    const saved = localStorage.getItem('pomodoroDailyCount');
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('pomodoroCountDate');
    if (savedDate === today && saved) return parseInt(saved);
    return 0;
  });
  
  const [cycleCount, setCycleCount] = useState(() => {
    const saved = localStorage.getItem('pomodoroCycleCount');
    return saved ? parseInt(saved) : 0;
  });
  
  const [autoStartBreaks, setAutoStartBreaks] = useState(() => {
    const saved = localStorage.getItem('pomodoroAutoStartBreaks');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(() => {
    const saved = localStorage.getItem('pomodoroAutoStartPomodoros');
    return saved ? JSON.parse(saved) : false;
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('pomodoroNotificationsEnabled');
    return saved ? JSON.parse(saved) : (Notification.permission === 'granted');
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  
  // LocalStorage persistence
  useEffect(() => { localStorage.setItem('pomodoroTimeLeft', timeLeft.toString()); }, [timeLeft]);
  useEffect(() => { localStorage.setItem('pomodoroIsActive', JSON.stringify(isActive)); }, [isActive]);
  useEffect(() => { localStorage.setItem('pomodoroMode', mode); }, [mode]);
  useEffect(() => { localStorage.setItem('pomodoroState', state); }, [state]);
  useEffect(() => { localStorage.setItem('pomodoroDailyCount', pomodoroCount.toString()); }, [pomodoroCount]);
  useEffect(() => { localStorage.setItem('pomodoroCountDate', new Date().toDateString()); }, [pomodoroCount]);
  useEffect(() => { localStorage.setItem('pomodoroCycleCount', cycleCount.toString()); }, [cycleCount]);
  useEffect(() => { localStorage.setItem('pomodoroAutoStartBreaks', JSON.stringify(autoStartBreaks)); }, [autoStartBreaks]);
  useEffect(() => { localStorage.setItem('pomodoroAutoStartPomodoros', JSON.stringify(autoStartPomodoros)); }, [autoStartPomodoros]);
  useEffect(() => { localStorage.setItem('pomodoroNotificationsEnabled', JSON.stringify(notificationsEnabled)); }, [notificationsEnabled]);
  useEffect(() => { 
    if (startTime !== null) {
      localStorage.setItem('pomodoroStartTime', startTime.toString()); 
    } else {
      localStorage.removeItem('pomodoroStartTime');
    }
  }, [startTime]);
  useEffect(() => { localStorage.setItem('pomodoroInitialDuration', initialDuration.toString()); }, [initialDuration]);
  
  const resetToModeDefault = () => {
    let newDuration;
    switch(mode) {
      case 'work': newDuration = pomodoroSettings.workDuration; break;
      case 'shortBreak': newDuration = pomodoroSettings.shortBreakDuration; break;
      case 'longBreak': newDuration = pomodoroSettings.longBreakDuration; break;
      default: newDuration = 25;
    }
    const duration = newDuration * 60;
    setTimeLeft(duration);
    setInitialDuration(duration);
  };
  
  useEffect(() => {
    if (state === 'idle') {
        resetToModeDefault();
    }
  }, [pomodoroSettings]);
  
  useEffect(() => {
      if(!isActive) {
          resetToModeDefault();
      }
  }, [mode]);

  // Calculate accurate time based on real elapsed time
  const calculateAccurateTime = () => {
    if (!startTime || !isActive) return;
    
    const now = Date.now();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const newTimeLeft = Math.max(0, initialDuration - elapsedSeconds);
    
    setTimeLeft(newTimeLeft);
  };

  // Check for accurate time on focus/visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isActive) {
        calculateAccurateTime();
      }
    };

    const handleFocus = () => {
      if (isActive) {
        calculateAccurateTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isActive, startTime, initialDuration]);

  const postMessageToSW = (message: object) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    }
  };

  const startTimer = () => {
    if (timeLeft > 0) {
      const now = Date.now();
      setStartTime(now);
      setInitialDuration(timeLeft);
      setIsActive(true);
      setState('running');
      postMessageToSW({ type: 'START_TIMER', payload: { timeLeft, mode } });
      requestWakeLock();
    }
  };
  
  const pauseTimer = () => {
    // When pausing, we need to update the initial duration to reflect remaining time
    if (startTime) {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const remainingTime = Math.max(0, initialDuration - elapsedSeconds);
      setInitialDuration(remainingTime);
      setTimeLeft(remainingTime);
    }
    setStartTime(null);
    setIsActive(false);
    setState('paused');
    postMessageToSW({ type: 'PAUSE_RESUME_TIMER' });
    releaseWakeLock();
  };
  
  const stopTimer = () => {
    setStartTime(null);
    setIsActive(false);
    setState('idle');
    resetToModeDefault();
    postMessageToSW({ type: 'STOP_TIMER' });
    releaseWakeLock();
  };
  
  const resetTimer = () => {
    postMessageToSW({ type: 'CLOSE_WIDGET' });
    setStartTime(null);
    setIsActive(false);
    setState('idle');
    setPomodoroCount(0);
    setCycleCount(0);
    setMode('work');
    setTimeLeft(pomodoroSettings.workDuration * 60);
    setInitialDuration(pomodoroSettings.workDuration * 60);
    localStorage.setItem('pomodoroIsActive', 'false');
    localStorage.setItem('pomodoroState', 'idle');
    localStorage.setItem('pomodoroDailyCount', '0');
    localStorage.setItem('pomodoroCycleCount', '0');
    localStorage.setItem('pomodoroMode', 'work');
    localStorage.removeItem('pomodoroStartTime');
    releaseWakeLock();
  };
  
  const skipSession = () => {
    setStartTime(null);
    setIsActive(false);
    setState('idle');
    postMessageToSW({ type: 'STOP_TIMER' });
    if (mode === 'work') {
      (cycleCount + 1) % 4 === 0 ? switchToLongBreak() : switchToShortBreak();
    } else {
      switchToWork();
    }
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        calculateAccurateTime();
      }, 1000);
    } else {
      if(intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
  }, [isActive, startTime, initialDuration]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;
      const { type, action, mode: completedMode, path } = event.data;

      if (type === 'TIMER_COMPLETE') {
        setTimeLeft(0);
        
        if (completedMode === 'work') {
          setShowConfetti(true);
          postMessageToSW({ type: 'TRIGGER_CONFETTI' });
          setTimeout(() => setShowConfetti(false), 5000);
        }
      } else if (type === 'SHOW_CONFETTI') {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else if (type === 'LIVE_TIMER_ACTION') {
        if (action === 'pause-resume') {
          isActive ? pauseTimer() : startTimer();
        } else if (action === 'stop') {
          stopTimer();
        }
      } else if (type === 'COMPLETION_ACTION') {
        if (action === 'start-break') {
          (cycleCount + 1) % 4 === 0 ? switchToLongBreak(true) : switchToShortBreak(true);
        } else if (action === 'start-work') {
          switchToWork(true);
        }
      } else if (type === 'NAVIGATE') {
        window.location.href = path;
      } else if (type === 'EXTEND_BREAK') {
        setTimeLeft(prev => prev + 300);
        setInitialDuration(prev => prev + 300);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, [isActive, cycleCount]);

  useEffect(() => {
    if (timeLeft === 0 && (state === 'running' || state === 'paused')) {
      setStartTime(null);
      setIsActive(false);
      setState('idle');
      let nextMode: TimerMode;
      let shouldAutoStart = false;
      if (mode === 'work') {
        const newCount = pomodoroCount + 1;
        const newCycleCount = cycleCount + 1;
        setPomodoroCount(newCount);
        setCycleCount(newCycleCount);
        addPomodoroSession();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
        nextMode = (newCycleCount % 4 === 0) ? 'longBreak' : 'shortBreak';
        if (autoStartBreaks) shouldAutoStart = true;
      } else {
        const breakType = mode === 'shortBreak' ? 'Short Break' : 'Long Break';
        if ('Notification' in window && Notification.permission === 'granted') {
          // The service worker will handle the notification
        } else {
          alert(`${breakType} complete! Time to get back to work.`);
        }
        nextMode = 'work';
        if (autoStartPomodoros) shouldAutoStart = true;
      }
      setTimeout(() => {
        if (nextMode === 'longBreak') switchToLongBreak(shouldAutoStart);
        else if (nextMode === 'shortBreak') switchToShortBreak(shouldAutoStart);
        else switchToWork(shouldAutoStart);
      }, 500);
    }
  }, [timeLeft, state]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      alert('Your browser does not support notifications.');
      return false;
    }
    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';
    setNotificationsEnabled(granted);
    return granted;
  };
  
  const switchToWork = (startNow = false) => { 
    if (!isActive) { 
      setStartTime(null);
      setMode('work'); 
      if(startNow) { 
        setTimeout(() => startTimer(), 100); 
      } 
    } 
  };
  const switchToShortBreak = (startNow = false) => { 
    if (!isActive) { 
      setStartTime(null);
      setMode('shortBreak'); 
      if(startNow) { 
        setTimeout(() => startTimer(), 100); 
      } 
    } 
  };
  const switchToLongBreak = (startNow = false) => { 
    if (!isActive) { 
      setStartTime(null);
      setMode('longBreak'); 
      if(startNow) { 
        setTimeout(() => startTimer(), 100); 
      } 
    } 
  };
  
  const getProgressPercentage = () => {
    if (initialDuration === 0) return 100;
    return ((initialDuration - timeLeft) / initialDuration) * 100;
  };
  
  const getFormattedTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getSessionInfo = () => {
    return mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break';
  };
  
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try { wakeLockRef.current = await navigator.wakeLock.request('screen'); }
      catch (err) { console.error('Wake Lock failed:', err); }
    }
  };
  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => { wakeLockRef.current = null; });
    }
  };

  useEffect(() => {
    const baseTitle = 'StudyForExams - Smart Study Management Platform';
    document.title = isActive ? `${getFormattedTime()} - ${getSessionInfo()} | StudyForExams` : baseTitle;
    // --- THIS IS THE CORRECTED LINE ---
    return () => { document.title = baseTitle; };
  }, [timeLeft, isActive, mode]);
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      releaseWakeLock();
    };
  }, []);

  const value: PomodoroContextType = {
    timeLeft, isActive, mode, state, pomodoroCount, cycleCount,
    startTimer, pauseTimer, stopTimer, resetTimer, skipSession,
    switchToWork, switchToShortBreak, switchToLongBreak,
    autoStartBreaks, autoStartPomodoros, setAutoStartBreaks, setAutoStartPomodoros,
    notificationsEnabled, setNotificationsEnabled, requestNotificationPermission,
    getProgressPercentage, getFormattedTime, getSessionInfo,
    showConfetti, setShowConfetti,
    isImmersive,
    setIsImmersive,
  };
  
  return (
    <PomodoroContext.Provider value={value}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}