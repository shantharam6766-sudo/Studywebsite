import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

// --- HELPER HOOK (No changes) ---
const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; }, [value]);
  return ref.current;
};

// --- SUB-COMPONENT: FlipDigit (No changes) ---
const FlipDigit = ({ digit }: { digit: string }) => {
  const previousDigit = usePrevious(digit) ?? digit;
  const isFlipping = previousDigit !== digit;
  return (
    <div className="relative w-20 h-28 md:w-28 md:h-40 text-7xl md:text-9xl font-bold rounded-lg text-gray-100" style={{ perspective: '750px', fontFeatureSettings: '"tnum"' }}>
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-800 rounded-t-lg flex items-center justify-end flex-col overflow-hidden"><span className="translate-y-1/2">{digit}</span></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-900 rounded-b-lg flex items-center justify-start flex-col overflow-hidden"><span className="-translate-y-1/2">{isFlipping ? previousDigit : digit}</span></div>
      <AnimatePresence>{isFlipping && (<motion.div key={previousDigit} className="absolute top-0 left-0 w-full h-1/2" style={{transformOrigin: 'bottom', transformStyle: 'preserve-3d', zIndex: 10,}} initial={{ rotateX: 0 }} animate={{ rotateX: -180 }} transition={{ duration: 0.6, ease: 'easeInOut' }}><div className="absolute w-full h-full bg-gray-800 rounded-t-lg flex items-center justify-end flex-col overflow-hidden" style={{ backfaceVisibility: 'hidden' }}><span className="translate-y-1/2">{previousDigit}</span></div><div className="absolute w-full h-full bg-gray-900 rounded-b-lg flex items-center justify-start flex-col overflow-hidden" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}><span className="-translate-y-1/2">{digit}</span></div></motion.div>)}</AnimatePresence>
      <div className="absolute top-1/2 -mt-px w-full h-px bg-black/70 z-20" />
    </div>
  );
};

// --- SUB-COMPONENT: FlipClock (No changes) ---
const FlipClock = ({ time }: { time: string }) => {
  const [minutes, seconds] = time.split(':');
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3">
      <FlipDigit digit={minutes[0]} />
      <FlipDigit digit={minutes[1]} />
      <div className="flex flex-col gap-4 px-1">
        <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-900 rounded-full"></div>
        <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-900 rounded-full"></div>
      </div>
      <FlipDigit digit={seconds[0]} />
      <FlipDigit digit={seconds[1]} />
    </div>
  );
};

// --- TYPE DEFINITIONS ---
interface ImmersiveTimerProps {
  isActive: boolean;
  onExit: () => void;
  onPlayPause: () => void;
  onStop: () => void;
  onSkip: () => void;
  getFormattedTime: () => string;
  getSessionInfo: () => string;
  backgroundImage: string;
}

// =================================================================================
// --- THE MAIN IMMERSIVE TIMER COMPONENT ---
// =================================================================================
const ImmersiveTimer: React.FC<ImmersiveTimerProps> = ({
  isActive, onExit, onPlayPause, onStop, onSkip, getFormattedTime, getSessionInfo, backgroundImage
}) => {
  // Wake Lock API
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
      } catch (err) { console.error('Wake Lock failed:', err); }
    };
    request();
    return () => { wakeLock?.release(); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black group font-sans flex flex-col items-center justify-around
                 p-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
    >
      <motion.div
        className="absolute inset-0"
        style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ scale: 1.05, opacity: 1 }}
        transition={{ duration: 15, ease: 'linear' }}
      />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)` }} />
      
      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 1.2 } }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onExit} className="absolute top-6 right-6 z-20 p-3 rounded-full bg-black/20 backdrop-blur-sm text-white/70 hover:text-white transition-colors">
        <X size={24} />
      </motion.button>
      
      {/* 1. The Title */}
      <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 0, y: 0, transition: { delay: 0.2, duration: 0.5 } }}>
        <h1 
          // <<< THIS IS THE CUSTOMIZED LINE FOR THE TITLE >>>
          className="text-4xl md:text-5xl font-semibold text-white/90 tracking-wider"
          style={{ textShadow: `0 2px 20px rgba(0,0,0,0.8)` }}
        >
          {getSessionInfo()}
        </h1>
      </motion.div>
      
      {/* 2. The Clock */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.6, type: 'spring' } }}>
        <FlipClock time={getFormattedTime()} />
      </motion.div>

      {/* 3. The Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.5 } }}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <div className="flex items-center justify-center space-x-6 p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onStop} className="p-4 rounded-full text-white/70 hover:text-white transition-colors">
            <RotateCcw size={24} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onPlayPause} className="w-16 h-16 rounded-full flex items-center justify-center text-white bg-white/20">
            {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onSkip} className="p-4 rounded-full text-white/70 hover:text-white transition-colors"> 
            <SkipForward size={24} />
          </motion.button> 
        </div> 
      </motion.div>
    </div>
  ); 
};

export default ImmersiveTimer;