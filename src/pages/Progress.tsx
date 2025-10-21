import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyData } from '../contexts/StudyDataContext';
import { 
  BookOpen, Check, BookOpenCheck, ChevronDown, TrendingUp, Target, Clock, Award,
  BarChart3, Calendar, Activity, Star, Filter, Zap
} from 'lucide-react';
import { format, subDays, parseISO, differenceInDays, startOfYear, endOfYear, isSameDay, startOfDay } from 'date-fns';

// --- TYPE DEFINITIONS for clarity ---
type ActivityDateRange = 'last7days' | 'last30days' | 'thisYear';
type PomodoroSession = { date: string; count: number };

// =================================================================================
// --- "INTELLIGENT ACTIVITY TRACKER" COMPONENT (CARDS ONLY) ---
// =================================================================================
const IntelligentActivityTracker = ({ sessions }: { sessions: PomodoroSession[] }) => {
  const [range, setRange] = useState<ActivityDateRange>('last30days');
  const [showDropdown, setShowDropdown] = useState(false);

  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    let startDate: Date;
    switch (range) {
      case 'last7days': startDate = subDays(today, 6); break;
      case 'thisYear': startDate = startOfYear(today); break;
      default: startDate = subDays(today, 29);
    }
    const filteredSessions = sessions.filter(s => parseISO(s.date) >= startDate);
    const total = filteredSessions.reduce((sum, s) => sum + s.count, 0);
    const daysInRange = differenceInDays(today, startDate) + 1;
    const average = (total / daysInRange).toFixed(1);

    let currentStreak = 0, longestStreak = 0;
    if (sessions.length > 0) {
        const sortedDates = [...new Set(sessions.map(s => s.date))].map(d => startOfDay(parseISO(d))).sort((a,b) => a.getTime() - b.getTime());
        let tempStreak = 0;
        for (let i = 0; i < sortedDates.length; i++) {
            if (i === 0 || differenceInDays(sortedDates[i], sortedDates[i-1]) > 1) {
                tempStreak = 1;
            } else {
                tempStreak++;
            }
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
        }
        const lastSessionDate = sortedDates[sortedDates.length - 1];
        if (isSameDay(lastSessionDate, today) || isSameDay(lastSessionDate, subDays(today, 1))) {
            currentStreak = tempStreak;
        }
    }
    
    return { total, average, currentStreak, longestStreak };
  }, [range, sessions]);

  const dateRangeOptions = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisYear', label: 'This Year' },
  ];
 
  return (
   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glassmorphism p-6 rounded-xl">
  
  {/* The container is a simple flex row */}
  <div className="flex items-center gap-6 mb-6">
    
    {/* --- THIS IS THE KEY FIX --- */}
    {/* We add `flex-1` to the title, making it expand and push the button to the right. */}
    <h2 className="text-xl font-heading font-bold flex items-center flex-1">
      <Activity size={24} className="mr-3 text-primary" />
      Activity
    </h2>
    
    {/* The Button's container doesn't need any changes */}
    <div className="relative">
      <motion.button 
        whileTap={{ scale: 0.90 }} 
        onClick={() => setShowDropdown(!showDropdown)} 
        className="btn-outline flex items-center text-sm w-[160px] h-[50px] justify-between"
      >
        <Filter size={14} className="mr-2" />
        <span>{dateRangeOptions.find(opt => opt.value === range)?.label}</span>
        <motion.div animate={{ rotate: showDropdown ? 180 : 0 }}>
          <ChevronDown size={14} className="ml-2" />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {showDropdown && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="absolute right-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {dateRangeOptions.map(option => (
              <motion.button 
                key={option.value} 
                onClick={() => { setRange(option.value as ActivityDateRange); setShowDropdown(false); }} 
                className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                  range === option.value 
                    ? 'bg-primary/10 text-primary dark:text-primary-light' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg"><h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center"><Calendar size={14} className="mr-2"/>Total Sessions</h4><p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</p></div>
        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg"><h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center"><BarChart3 size={14} className="mr-2"/>Daily Average</h4><p className="text-3xl mt-6 font-bold text-gray-800 dark:text-gray-100">{stats.average}</p></div>
        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg"><h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center"><Zap size={14} className="mr-2 text-yellow-500"/>Current Streak</h4><p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.currentStreak} <span className="text-lg">days</span></p></div>
        <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg"><h4 className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center"><Star size={14} className="mr-2 text-amber-500"/>Longest Streak</h4><p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.longestStreak} <span className="text-lg">days</span></p></div>
      </div>
    </motion.div>
  );
};

// =================================================================================
// --- THE MAIN PROGRESS PAGE COMPONENT ---
// =================================================================================
const Progress: React.FC = () => {
    const { syllabi, pomodoroSessions, exams, getTotalStudyHours, getTotalTasksCompleted } = useStudyData();
    const [selectedSyllabusId, setSelectedSyllabusId] = useState<string | null>(syllabi.length > 0 ? syllabi[0].id : null);
    const [showSyllabusDropdown, setShowSyllabusDropdown] = useState(false);
    const selectedSyllabus = syllabi.find(s => s.id === selectedSyllabusId);
    
    const syllabusStats = useMemo(() => {
        if (!selectedSyllabus) return { totalSubjects: 0, totalChapters: 0, chaptersPlan: 0, chaptersStudying: 0, chaptersMastered: 0 };
        const stats = { totalSubjects: selectedSyllabus.subjects.length, totalChapters: 0, chaptersPlan: 0, chaptersStudying: 0, chaptersMastered: 0 };
        selectedSyllabus.subjects.forEach(subject => {
            stats.totalChapters += subject.chapters.length;
            stats.chaptersPlan += subject.chapters.filter((c: any) => c.status === 'plan').length;
            stats.chaptersStudying += subject.chapters.filter((c: any) => c.status === 'studying').length;
            stats.chaptersMastered += subject.chapters.filter((c: any) => c.status === 'mastered').length;
        });
        return stats;
    }, [selectedSyllabus]);

    // --- MODIFIED: getTotalStudyHours now returns a string ---
    const totalStudyTime = getTotalStudyHours();
    const totalTasksCompleted = getTotalTasksCompleted();
    const completionPercentage = syllabusStats.totalChapters > 0 ? (syllabusStats.chaptersMastered / syllabusStats.totalChapters) * 100 : 0;
    const nextExam = exams.filter(exam => differenceInDays(parseISO(exam.date), new Date()) >= 0).sort((a, b) => differenceInDays(parseISO(a.date), new Date()) - differenceInDays(parseISO(b.date), new Date()))[0];
    
    const ProgressRing = ({ percentage, size = 120, strokeWidth = 8, color = 'primary' }: { percentage: number; size?: number; strokeWidth?: number; color?: string; }) => { const radius = (size - strokeWidth) / 2; const circumference = radius * 2 * Math.PI; const strokeDashoffset = circumference - (percentage / 100) * circumference; return ( <div className="relative" style={{ width: size, height: size }}> <svg className="transform -rotate-90" width={size} height={size}> <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-gray-200 dark:text-gray-700"/> <motion.circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`text-${color} dark:text-${color}-light`} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset }} transition={{ duration: 1, ease: "easeOut" }}/> </svg> <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-bold">{Math.round(percentage)}%</span></div> </div> ); };
    const SubjectProgressCard = ({ subject, index }: { subject: any; index: number }) => { const totalChapters = subject.chapters.length; const masteredChapters = subject.chapters.filter((c: any) => c.status === 'mastered').length; const studyingChapters = subject.chapters.filter((c: any) => c.status === 'studying').length; const progressPercentage = totalChapters > 0 ? (masteredChapters / totalChapters) * 100 : 0; return ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="glassmorphism p-6 rounded-xl hover:shadow-lg transition-all duration-300" style={{ borderLeft: `4px solid ${subject.color}` }}> <div className="flex items-center justify-between mb-4"> <h3 className="font-semibold text-lg truncate">{subject.title}</h3> <div className="flex items-center space-x-2"><span className="text-2xl font-bold text-primary dark:text-primary-light">{Math.round(progressPercentage)}%</span></div> </div> <div className="space-y-3"> <div className="flex justify-between text-sm"> <span className="text-gray-600 dark:text-gray-400">Progress</span><span>{masteredChapters} of {totalChapters} chapters</span> </div> <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"> <motion.div className="h-full rounded-full" style={{ backgroundColor: subject.color }} initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1, delay: index * 0.1 }}/> </div> <div className="flex justify-between text-xs"> <div className="flex items-center"><div className="w-2 h-2 bg-success rounded-full mr-1"></div><span>{masteredChapters} Mastered</span></div> <div className="flex items-center"><div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: subject.color }}></div><span>{studyingChapters} Studying</span></div> </div> </div> </motion.div> ); };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div><h1 className="text-3xl lg:text-4xl font-heading font-bold mb-2">Progress Dashboard</h1><p className="text-gray-600 dark:text-gray-400">Track your learning journey and achievements</p></div>
                <div className="relative"><motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowSyllabusDropdown(!showSyllabusDropdown)} className="btn-outline flex items-center min-w-[200px] justify-between"><span className="truncate">{selectedSyllabus?.title || 'Select Syllabus'}</span><ChevronDown size={16} className="ml-2 flex-shrink-0" /></motion.button><AnimatePresence>{showSyllabusDropdown && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">{syllabi.map(syllabus => (<motion.button key={syllabus.id} whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }} onClick={() => { setSelectedSyllabusId(syllabus.id); setShowSyllabusDropdown(false); }} className={`w-full text-left px-4 py-3 transition-colors ${selectedSyllabusId === syllabus.id ? 'bg-primary/10 text-primary dark:text-primary-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>{syllabus.title}</motion.button>))}</motion.div>)}</AnimatePresence></div>
            </div>

            <IntelligentActivityTracker sessions={pomodoroSessions} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <motion.div className="glassmorphism p-6 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}><div className="flex items-center justify-between mb-4"><div className="p-3 rounded-xl bg-primary/10 dark:bg-primary-light/10"><BookOpen className="text-primary dark:text-primary-light" size={24} /></div><span className="text-3xl font-bold">{syllabusStats.totalChapters}</span></div><h3 className="font-semibold text-gray-900 dark:text-gray-100">Total Chapters</h3><p className="text-sm text-gray-600 dark:text-gray-400">Across {syllabusStats.totalSubjects} subjects</p></motion.div>
                <motion.div className="glassmorphism p-6 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}><div className="flex items-center justify-between mb-4"><div className="p-3 rounded-xl bg-secondary/10 dark:bg-secondary-light/10"><BookOpenCheck className="text-secondary dark:text-secondary-light" size={24} /></div><span className="text-3xl font-bold">{syllabusStats.chaptersStudying}</span></div><h3 className="font-semibold text-gray-900 dark:text-gray-100">In Progress</h3><p className="text-sm text-gray-600 dark:text-gray-400">Currently studying</p></motion.div>
                <motion.div className="glassmorphism p-6 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}><div className="flex items-center justify-between mb-4"><div className="p-3 rounded-xl bg-success/10"><Check className="text-success" size={24} /></div><span className="text-3xl font-bold">{syllabusStats.chaptersMastered}</span></div><h3 className="font-semibold text-gray-900 dark:text-gray-100">Completed</h3><p className="text-sm text-gray-600 dark:text-gray-400">{Math.round(completionPercentage)}% of total</p></motion.div>
                
                {/* --- THIS IS THE CORRECTED DISPLAY BLOCK --- */}
                <motion.div className="glassmorphism p-6 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.3 }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-warning/10"><Clock className="text-warning" size={24} /></div>
                        {/* --- MODIFIED: Adjusted text size for longer format --- */}
                        <span className="text-2xl md:text-3xl font-bold">{totalStudyTime}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Hours Studied</h3>
                    {/* --- MODIFIED: Updated subtitle to match new format --- */}
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Time Focused</p>
                </motion.div>
                
                <motion.div className="glassmorphism p-6 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }}><div className="flex items-center justify-between mb-4"><div className="p-3 rounded-xl bg-purple-500/10"><Target className="text-purple-500" size={24} /></div><span className="text-3xl font-bold">{totalTasksCompleted}</span></div><h3 className="font-semibold text-gray-900 dark:text-gray-100">Tasks Done</h3><p className="text-sm text-gray-600 dark:text-gray-400">Total completed</p></motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div className="lg:col-span-1 glassmorphism p-8 rounded-xl text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
                    <h2 className="text-xl font-heading font-semibold mb-6">Overall Progress</h2><div className="flex justify-center mb-6"><ProgressRing percentage={completionPercentage} size={160} strokeWidth={12} color="success" /></div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"><div className="flex items-center"><div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div><span className="text-sm">Plan to Study</span></div><span className="font-semibold">{syllabusStats.chaptersPlan}</span></div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"><div className="flex items-center"><div className="w-3 h-3 bg-primary rounded-full mr-3"></div><span className="text-sm">Studying</span></div><span className="font-semibold">{syllabusStats.chaptersStudying}</span></div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50"><div className="flex items-center"><div className="w-3 h-3 bg-success rounded-full mr-3"></div><span className="text-sm">Mastered</span></div><span className="font-semibold">{syllabusStats.chaptersMastered}</span></div>
                    </div>
                </motion.div>
                <div className="lg:col-span-2 space-y-6">
                    {nextExam && (<motion.div className="glassmorphism p-6 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }}><div className="flex items-center justify-between"><div className="flex items-center"><div className="p-3 rounded-xl bg-primary/10 mr-4"><Target size={24} className="text-primary" /></div><div><h3 className="text-lg font-semibold">{nextExam.title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{format(parseISO(nextExam.date), 'EEEE, MMMM d, yyyy')}</p></div></div><div className="text-right"><div className="text-3xl font-bold text-primary">{differenceInDays(parseISO(nextExam.date), new Date())}</div><div className="text-sm text-gray-600 dark:text-gray-400">days left</div></div></div></motion.div>)}
                    {selectedSyllabus?.subjects.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}><h2 className="text-2xl font-heading font-semibold mb-6 flex items-center"><Award size={28} className="mr-3 text-primary" />Subject Progress Breakdown</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{selectedSyllabus.subjects.map((subject, index) => (<SubjectProgressCard key={subject.id} subject={subject} index={index} />))}</div></motion.div>
                    )}
                </div>
            </div>

            {syllabusStats.totalChapters === 0 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 glassmorphism rounded-xl"><TrendingUp size={64} className="mx-auto mb-4 text-gray-400" /><h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">No progress data yet</h3><p className="text-gray-500 dark:text-gray-400 mb-6">Start adding subjects and chapters to track your learning progress</p></motion.div>)}
        </div>
    );
};

export default Progress;