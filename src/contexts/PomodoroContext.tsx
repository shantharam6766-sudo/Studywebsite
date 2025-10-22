
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useMemo, useCallback } from 'react';
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
  showConfetti: boolean;
  isImmersive: boolean;
  setIsImmersive: (value: boolean) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (value: boolean) => void;
  requestNotificationPermission: () => Promise<boolean>;
  getProgressPercentage: () => number;
  getFormattedTime: () => string;
  getSessionInfo: () => string;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: ReactNode }) {
  const { pomodoroSettings, addPomodoroSession } = useStudyData();

  const settings = useMemo(() => ({
    workDuration: pomodoroSettings?.workDuration ?? 25,
    shortBreakDuration: pomodoroSettings?.shortBreakDuration ?? 5,
    longBreakDuration: pomodoroSettings?.longBreakDuration ?? 15,
    sessionsPerCycle: pomodoroSettings?.sessionsPerCycle ?? 4,
  }), [pomodoroSettings]);
  
  const [timeLeft, setTimeLeft] = useState(() => settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const [state, setState] = useState<TimerState>('idle');
  const [pomodoroCount, setPomodoroCount] = useState(0); // Today's count
  const [cycleCount, setCycleCount] = useState(0); // Sessions in current cycle
  const [showConfetti, setShowConfetti] = useState(false);
  const [isImmersive, setIsImmersive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [autoStartBreaks, setAutoStartBreaks] = useState(() => localStorage.getItem('autoStartBreaks') === 'true');
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(() => localStorage.getItem('autoStartPomodoros') === 'true');

  const intervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any | null>(null);

  const acquireWakeLock = async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock is active.');
      } catch (err) {
        console.error(`${(err as Error).name}, ${(err as Error).message}`);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      console.log('Screen Wake Lock released.');
    }
  };

  const resetToModeDefault = useCallback(() => {
    let newDuration;
    switch(mode) {
      case 'work': newDuration = settings.workDuration; break;
      case 'shortBreak': newDuration = settings.shortBreakDuration; break;
      case 'longBreak': newDuration = settings.longBreakDuration; break;
      default: newDuration = 25;
    }
    setTimeLeft(newDuration * 60);
  }, [mode, settings]);
  
  useEffect(() => {
    if (state === 'idle') {
      resetToModeDefault();
    }
  }, [mode, state, resetToModeDefault]);

  const startTimer = () => {
    if (timeLeft > 0) {
      setIsActive(true);
      setState('running');
      acquireWakeLock();
    }
  };
  
  const pauseTimer = () => {
    setIsActive(false);
    setState('paused');
    releaseWakeLock();
  };
  
  const stopTimer = () => {
    setIsActive(false);
    setState('idle');
    resetToModeDefault();
    releaseWakeLock();
  };

  const skipSession = () => {
      if (mode === 'work') {
        handleTimerCompletion(true); // Pass true to indicate a skip
      } else {
        switchToWork();
      }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setState('idle');
    setPomodoroCount(0);
    setCycleCount(0);
    setMode('work');
    setTimeLeft(settings.workDuration * 60);
    releaseWakeLock();
  };

  const handleTimerCompletion = useCallback((skipped = false) => {
    let nextMode: TimerMode;
    let shouldAutoStart = false;

    if (mode === 'work') {
      if (!skipped) {
        addPomodoroSession();
        setPomodoroCount(prev => prev + 1);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000);
        if (notificationsEnabled) new Notification('Focus session complete!', { body: 'Time for a break.', icon: '/logo192.png' });
      }
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);
      nextMode = (newCycleCount % settings.sessionsPerCycle === 0) ? 'longBreak' : 'shortBreak';
      if (autoStartBreaks) shouldAutoStart = true;
    } else {
      if (notificationsEnabled) new Notification('Break is over!', { body: 'Time to get back to focus.', icon: '/logo192.png' });
      nextMode = 'work';
      if (autoStartPomodoros) shouldAutoStart = true;
    }

    if (nextMode === 'longBreak') switchToLongBreak(shouldAutoStart);
    else if (nextMode === 'shortBreak') switchToShortBreak(shouldAutoStart);
    else switchToWork(shouldAutoStart);

  }, [mode, cycleCount, settings.sessionsPerCycle, addPomodoroSession, autoStartBreaks, autoStartPomodoros, notificationsEnabled]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if(intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) };
  }, [isActive]);

  useEffect(() => {
    if (timeLeft <= 0 && isActive) {
      setIsActive(false);
      setState('idle');
      handleTimerCompletion();
    }
  }, [timeLeft, isActive, handleTimerCompletion]);
  
  const switchToMode = (newMode: TimerMode, startNow = false) => {
    if (state !== 'running') {
        setMode(newMode);
        setState('idle');
        // The reset is now handled by the useEffect watching [mode, state]
        if (startNow) {
            setTimeout(() => startTimer(), 100); // Small delay to allow state to update
        }
    }
  };

  const switchToWork = (startNow = false) => switchToMode('work', startNow);
  const switchToShortBreak = (startNow = false) => switchToMode('shortBreak', startNow);
  const switchToLongBreak = (startNow = false) => switchToMode('longBreak', startNow);
  
  const getProgressPercentage = () => {
    const totalDuration = (
      mode === 'work' ? settings.workDuration :
      mode === 'shortBreak' ? settings.shortBreakDuration :
      settings.longBreakDuration
    ) * 60;
    if (totalDuration === 0) return 100;
    const percentage = ((totalDuration - timeLeft) / totalDuration) * 100;
    return Math.min(100, percentage);
  };
  
  const getFormattedTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSessionInfo = () => {
    if (mode === 'work') {
      const sessionNumber = (cycleCount % settings.sessionsPerCycle) + 1;
      return `Focus Session ${sessionNumber}`;
    }
    if (mode === 'shortBreak') {
      return 'Time for a short break!';
    }
    if (mode === 'longBreak') {
      return 'Time for a long break!';
    }
    return 'Ready to begin?';
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      setNotificationsEnabled(granted);
      return granted;
    }
    return false;
  };

  useEffect(() => {
    localStorage.setItem('autoStartBreaks', String(autoStartBreaks));
  }, [autoStartBreaks]);

  useEffect(() => {
    localStorage.setItem('autoStartPomodoros', String(autoStartPomodoros));
  }, [autoStartPomodoros]);

  useEffect(() => {
    document.title = state === 'running' ? `${getFormattedTime()} - ${mode}` : 'Study Tracker';
  }, [timeLeft, state, mode, getFormattedTime]);

  const value: PomodoroContextType = useMemo(() => ({
    timeLeft, isActive, mode, state, pomodoroCount, cycleCount,
    startTimer, pauseTimer, stopTimer, resetTimer, skipSession,
    switchToWork, switchToShortBreak, switchToLongBreak,
    autoStartBreaks, autoStartPomodoros, setAutoStartBreaks, setAutoStartPomodoros,
    showConfetti, isImmersive, setIsImmersive, notificationsEnabled, setNotificationsEnabled,
    requestNotificationPermission, getProgressPercentage, getFormattedTime, getSessionInfo
  }), [
    timeLeft, isActive, mode, state, pomodoroCount, cycleCount, 
    autoStartBreaks, autoStartPomodoros, showConfetti, isImmersive, notificationsEnabled,
    getFormattedTime, getSessionInfo, getProgressPercentage
  ]);
  
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
