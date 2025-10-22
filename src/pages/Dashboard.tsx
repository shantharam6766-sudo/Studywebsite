import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, BookOpen, Timer, ArrowRight, Calendar, Clock, TrendingUp, Target, FileText, PlusCircle } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useStudyData } from '../contexts/StudyDataContext';
import MotivationalQuote from '../components/MotivationalQuote';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getTodayTasks, syllabi, notes, exams, pomodoroSessions } = useStudyData();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayTasks = getTodayTasks();
  const completedTasks = todayTasks.filter(task => task.completed).length;
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayNote = notes.find(note => note.createdAt.startsWith(today));
  const todayPomodoros = pomodoroSessions.find(session => session.date === today)?.count || 0;
  
  const upcomingExams = exams
    .filter(exam => exam.isPlaceholder || differenceInDays(parseISO(exam.date), currentTime) >= 0)
    .sort((a, b) => {
        if (a.isPlaceholder) return -1;
        if (b.isPlaceholder) return 1;
        return differenceInDays(parseISO(a.date), currentTime) - differenceInDays(parseISO(b.date), currentTime);
    })
    .slice(0, 2);
  
  const upcomingRealExams = exams.filter(exam => 
    !exam.isPlaceholder && differenceInDays(parseISO(exam.date), currentTime) >= 0
  );

  const subjectsInProgress = syllabi
    .flatMap(syllabus => syllabus.subjects)
    .filter(subject => 
      subject.chapters.some(chapter => chapter.status === 'studying')
    ).slice(0, 3);

  const quickActions = [
    {
      title: 'Exam Schedule',
      description: upcomingRealExams.length > 0 ? `${upcomingRealExams.length} exams scheduled` : 'Schedule a new exam',
      icon: upcomingRealExams.length > 0 ? <Calendar size={20} /> : <PlusCircle size={20} />,
      color: 'warning',
      path: '/exams',
      progress: null
    },
    {
      title: 'Daily Tasks',
      description: `${completedTasks} of ${todayTasks.length} completed`,
      icon: <CheckSquare size={20} />,
      color: 'primary',
      path: '/tasks',
      progress: todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 0
    },
    {
      title: 'Pomodoro Timer',
      description: `${todayPomodoros} sessions today`,
      icon: <Timer size={20} />,
      color: 'secondary',
      path: '/pomodoro',
      progress: Math.min((todayPomodoros / 8) * 100, 100)
    },
    {
      title: 'Study Progress',
      description: 'Track your learning',
      icon: <TrendingUp size={20} />,
      color: 'success',
      path: '/progress',
      progress: null
    },
  ];

  return (
    <div className="space-y-8 lg:space-y-12 2xl:space-y-16">
      <div className="flex flex-col 2xl:flex-row items-start gap-6 lg:gap-8 2xl:gap-12">
        <motion.div 
          className="glassmorphism p-6 lg:p-8 xl:p-10 2xl:p-12 rounded-xl w-full 2xl:w-3/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 lg:mb-8 2xl:mb-10">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl font-heading font-bold mb-2 2xl:mb-3">Welcome Back!</h1>
              <p className="text-gray-600 dark:text-gray-400 text-base lg:text-lg 2xl:text-xl">Ready to make today productive?</p>
            </div>
            <div className="text-left lg:text-right bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 lg:p-4 2xl:p-5 backdrop-blur-sm">
              <div className="flex items-center text-primary dark:text-primary-light mb-1"><Clock size={16} className="mr-1 flex-shrink-0" /><span className="text-lg lg:text-xl 2xl:text-2xl font-bold">{format(currentTime, 'h:mm a')}</span></div>
              <p className="text-sm lg:text-base 2xl:text-lg text-gray-600 dark:text-gray-400">{format(currentTime, 'EEEE, MMM d')}</p>
            </div>
          </div>

          {upcomingExams.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 2xl:gap-8 mb-6 lg:mb-8 2xl:mb-10">
              {upcomingExams.map((exam, index) => {
                const daysLeft = differenceInDays(parseISO(exam.date), currentTime);
                const isUrgent = !exam.isPlaceholder && daysLeft <= 7;
                return (
                  <motion.div 
                    key={exam.id}
                    className={`rounded-xl p-4 lg:p-6 2xl:p-8 border-2 transition-all duration-300 hover:shadow-lg ${exam.isPlaceholder ? 'border-dashed border-primary/40 bg-primary/5 cursor-pointer' : index === 0 ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20' : 'bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20'}`}
                    whileHover={{ scale: exam.isPlaceholder ? 1.03 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={exam.isPlaceholder ? () => navigate('/exams') : undefined}
                  >
                    <div className="flex items-center justify-between mb-2 lg:mb-3 2xl:mb-4">
                      <Target size={18} className={index === 0 ? 'text-primary dark:text-primary-light' : 'text-secondary dark:text-secondary-light'} />
                      {!exam.isPlaceholder && (<span className={`text-xs 2xl:text-sm px-2 py-1 rounded-full font-medium ${isUrgent ? 'bg-error/20 text-error' : 'bg-success/20 text-success'}`}>{isUrgent ? 'Urgent' : 'Scheduled'}</span>)}
                    </div>
                    <h3 className={`font-semibold mb-2 lg:mb-3 2xl:mb-4 text-sm lg:text-base 2xl:text-lg ${index === 0 ? 'text-primary dark:text-primary-light' : 'text-secondary dark:text-secondary-light'}`}>{exam.title}</h3>
                    <div className="flex items-center justify-between">
                      <p className={`text-xl lg:text-2xl 2xl:text-3xl font-bold ${isUrgent ? 'text-error' : 'text-gray-900 dark:text-gray-100'}`}>{exam.isPlaceholder ? 'Click to set' : daysLeft === 0 ? 'Today!' : `${daysLeft} days`}</p>
                      {!exam.isPlaceholder && (<p className="text-xs lg:text-sm 2xl:text-base text-gray-600 dark:text-gray-400">{format(parseISO(exam.date), 'MMM d')}</p>)}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 2xl:gap-8">
            {quickActions.map((action, index) => (
              <motion.div key={action.title} className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-4 lg:p-6 2xl:p-8 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 cursor-pointer group border border-gray-200/50 dark:border-gray-700/50" whileHover={{ y: -2, shadow: '0 10px 25px rgba(0,0,0,0.1)' }} whileTap={{ scale: 0.98 }} onClick={() => navigate(action.path)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * index }}>
                <div className="flex items-center justify-between mb-3 lg:mb-4 2xl:mb-5"><div className={`p-2 lg:p-3 2xl:p-4 rounded-lg bg-${action.color}/10 text-${action.color} dark:text-${action.color}-light`}>{action.icon}</div><ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-200" /></div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 lg:mb-2 2xl:mb-3 text-base lg:text-lg 2xl:text-xl">{action.title}</h3>
                <p className="text-sm lg:text-base 2xl:text-lg text-gray-600 dark:text-gray-400 mb-3 lg:mb-4 2xl:mb-5">{action.description}</p>
                {action.progress !== null && (<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 lg:h-2 2xl:h-2.5"><div className={`h-1.5 lg:h-2 2xl:h-2.5 rounded-full bg-${action.color} dark:bg-${action.color}-light transition-all duration-500`} style={{ width: `${action.progress}%` }}></div></div>)}
              </motion.div>
            ))}
          </div>

          {subjectsInProgress.length > 0 && (
            <div className="mt-6 lg:mt-8 2xl:mt-10"><h3 className="text-lg lg:text-xl 2xl:text-2xl font-semibold mb-3 lg:mb-4 2xl:mb-5 flex items-center"><BookOpen size={20} className="mr-2 text-secondary dark:text-secondary-light flex-shrink-0" />Currently Studying</h3><div className="space-y-2 lg:space-y-3 2xl:space-y-4">{subjectsInProgress.map(subject => (<div key={subject.id} className="flex items-center justify-between p-3 lg:p-4 2xl:p-5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"><div><p className="font-medium text-gray-900 dark:text-gray-100 text-sm lg:text-base 2xl:text-lg">{subject.title}</p><p className="text-xs lg:text-sm 2xl:text-base text-gray-600 dark:text-gray-400">{subject.chapters.filter(c => c.status === 'studying').length} chapters in progress</p></div><motion.button whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/syllabus')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><ArrowRight size={16} /></motion.button></div>))}</div></div>
          )}
        </motion.div>

        <div className="w-full 2xl:w-2/5 space-y-6 lg:space-y-8 2xl:space-y-10">
          <MotivationalQuote />
          <motion.div className="glassmorphism p-5 lg:p-6 xl:p-8 2xl:p-10 rounded-xl" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            <div className="flex justify-between items-center mb-3 lg:mb-4 2xl:mb-5"><div className="flex items-center"><FileText size={18} className="mr-2 text-primary dark:text-primary-light flex-shrink-0" /><h3 className="text-lg lg:text-xl 2xl:text-2xl font-heading font-semibold">Today's Notes</h3></div><motion.button whileHover={{ x: 3 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/notes')} className="text-sm lg:text-base 2xl:text-lg text-primary dark:text-primary-light flex items-center hover:underline">View All <ArrowRight size={14} className="ml-1 flex-shrink-0" /></motion.button></div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 lg:p-4 2xl:p-5 border border-gray-200/50 dark:border-gray-700/50"><p className="text-gray-700 dark:text-gray-300 italic text-sm lg:text-base 2xl:text-lg leading-relaxed">{todayNote ? (todayNote.content.length > 120 ? todayNote.content.substring(0, 120) + '...' : todayNote.content) : 'No notes for today yet. Click "View All" to add some thoughts and reflections!'}</p></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;