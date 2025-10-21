// src/pages/Exams.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash, Calendar, Clock, Save, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStudyData, Exam } from '../contexts/StudyDataContext';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';

const Exams: React.FC = () => {
  const { exams, addExam, updateExam, deleteExam } = useStudyData();
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [examForm, setExamForm] = useState({ title: '', date: '' });

  const handleAddExam = () => {
    if (examForm.title.trim() && examForm.date) {
      addExam(examForm.title, examForm.date);
      setExamForm({ title: '', date: '' });
      setIsAddingExam(false);
    }
  };

  const handleUpdateExam = () => {
    if (editingExamId && examForm.title.trim() && examForm.date) {
      updateExam(editingExamId, examForm.title, examForm.date);
      setExamForm({ title: '', date: '' });
      setEditingExamId(null);
    }
  };

  const startEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    setExamForm({ 
      title: exam.title, 
      date: exam.date && isValid(parseISO(exam.date)) 
        ? format(parseISO(exam.date), 'yyyy-MM-dd') 
        : '' 
    });
  };

  const cancelEdit = () => {
    setEditingExamId(null);
    setExamForm({ title: '', date: '' });
  };

  // FIXED: Corrected variable name conflict (examDate instead of exam.date)
  const getDaysLeft = (examDate: string) => {
    if (!examDate || !isValid(parseISO(examDate))) return Infinity;
    
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    const exam = parseISO(examDate);
    exam.setHours(0, 0, 0, 0); // Set exam to start of exam day
    return differenceInDays(exam, today);
  };

  // FIXED: Added special handling for placeholder exams
  const getStatusInfo = (exam: Exam, daysLeft: number) => {
    if (exam.isPlaceholder) {
      return { 
        color: 'text-gray-500', 
        bg: 'bg-gray-100/50', 
        icon: <Target size={24} />, 
        label: 'Not scheduled' 
      };
    }
    
    if (daysLeft === Infinity) {
      return { 
        color: 'text-gray-500', 
        bg: 'bg-gray-100/50', 
        icon: <AlertTriangle size={24} />, 
        label: 'Date not set' 
      };
    }
    
    if (daysLeft < 0) {
      return { 
        color: 'text-gray-500', 
        bg: 'bg-gray-100/50', 
        icon: <CheckCircle size={24} />, 
        label: 'Completed' 
      };
    }
    if (daysLeft <= 7) {
      return { 
        color: 'text-error', 
        bg: 'bg-error/10', 
        icon: <AlertTriangle size={24} />, 
        label: 'Critical' 
      };
    }
    if (daysLeft <= 30) {
      return { 
        color: 'text-warning', 
        bg: 'bg-warning/10', 
        icon: <Clock size={24} />, 
        label: 'Upcoming' 
      };
    }
    return { 
      color: 'text-success', 
      bg: 'bg-success/10', 
      icon: <Target size={24} />, 
      label: 'Scheduled' 
    };
  };

  const sortedExams = [...exams].sort((a, b) => {
    const daysA = a.isPlaceholder ? Infinity : getDaysLeft(a.date);
    const daysB = b.isPlaceholder ? Infinity : getDaysLeft(b.date);

    if (daysA < 0 && daysB >= 0) return 1;
    if (daysB < 0 && daysA >= 0) return -1;
    if (daysA < 0 && daysB < 0) return daysB - daysA;

    return daysA - daysB;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <Calendar size={40} className="mr-3 text-primary dark:text-primary-light flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-0">Exam Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track your upcoming exams and stay prepared</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => setIsAddingExam(true)} 
          className="btn-primary flex items-center shadow-lg w-full sm:w-auto flex-shrink-0" 
          disabled={isAddingExam}
        >
          <Plus size={18} className="mr-2" /> Add Exam
        </motion.button>
      </div>

      <AnimatePresence>
        {isAddingExam && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            className="glassmorphism p-6 mb-6 rounded-xl border-2 border-primary/20"
          >
            <div className="flex items-center mb-4">
              <Target size={20} className="text-primary dark:text-primary-light mr-2" />
              <h3 className="text-xl font-semibold">Add New Exam</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Exam Title</label>
                <input 
                  type="text" 
                  value={examForm.title} 
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} 
                  className="input" 
                  placeholder="e.g., BBA 4th Semester Finals" 
                  autoFocus 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Exam Date</label>
                <input 
                  type="date" 
                  value={examForm.date} 
                  onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} 
                  className="input" 
                  min={format(new Date(), 'yyyy-MM-dd')} 
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => { setIsAddingExam(false); setExamForm({ title: '', date: '' }); }} 
                className="btn-outline"
              >
                Cancel
              </button>
              <motion.button 
                whileTap={{ scale: 0.95 }} 
                onClick={handleAddExam} 
                className="btn-primary flex items-center" 
                disabled={!examForm.title.trim() || !examForm.date}
              >
                <Save size={16} className="mr-2" /> Add Exam
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sortedExams.map((exam, index) => {
          if (exam.isPlaceholder) {
            // FIXED: Added placeholder-specific status info
            const placeholderStatus = { 
              color: 'text-gray-500', 
              bg: 'bg-gray-100/50', 
              icon: <Target size={24} />, 
              label: 'Not scheduled' 
            };
            
            return (
              <motion.div 
                key={exam.id} 
                layout 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="glassmorphism p-5 sm:p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600 text-center flex flex-col items-center justify-center min-h-[180px]"
              >
                <Target size={32} className="text-gray-400 mb-3" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{exam.title}</h3>
                <div className={`mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${placeholderStatus.bg} ${placeholderStatus.color}`}>
                  {placeholderStatus.label}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Click 'Add Exam' to schedule it and start your countdown.</p>
              </motion.div>
            );
          }

          const daysLeft = getDaysLeft(exam.date);
          const statusInfo = getStatusInfo(exam, daysLeft);
          const isEditing = editingExamId === exam.id;

          return (
            <motion.div 
              key={exam.id} 
              layout 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: index * 0.1 }} 
              className={`glassmorphism p-5 sm:p-6 rounded-2xl border ${statusInfo.bg} hover:shadow-lg transition-all duration-300`}
            >
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center mb-4">
                    <Edit size={20} className="text-primary dark:text-primary-light mr-2" />
                    <h3 className="text-lg font-semibold">Edit Exam</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Exam Title</label>
                      <input 
                        type="text" 
                        value={examForm.title} 
                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} 
                        className="input" 
                        autoFocus 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Exam Date</label>
                      <input 
                        type="date" 
                        value={examForm.date} 
                        onChange={(e) => setExamForm({ ...examForm, date: e.target.value })} 
                        className="input" 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button onClick={cancelEdit} className="btn-outline">Cancel</button>
                    <motion.button 
                      whileTap={{ scale: 0.95 }} 
                      onClick={handleUpdateExam} 
                      className="btn-primary flex items-center" 
                      disabled={!examForm.title.trim() || !examForm.date}
                    >
                      <Save size={16} className="mr-2" /> Save Changes
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 h-full">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">{statusInfo.icon}</div>
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{exam.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="mr-2 flex-shrink-0" />
                        <span>
                          {exam.date && isValid(parseISO(exam.date)) 
                            ? format(parseISO(exam.date), 'EEEE, MMMM d, yyyy') 
                            : 'Date not set'}
                        </span>
                      </div>
                      <span className={`mt-3 px-2.5 py-1 rounded-full text-xs font-semibold self-start ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-4 sm:gap-2 self-stretch sm:self-center flex-shrink-0">
                    <div className={`text-center flex flex-col items-center justify-center p-4 rounded-xl w-24 h-24 ${statusInfo.bg} border`}>
                      {daysLeft === Infinity ? (
                        <div className="text-sm font-medium text-gray-500">N/A</div>
                      ) : daysLeft < 0 ? (
                        <CheckCircle size={32} className="text-gray-500" />
                      ) : (
                        <>
                          <div className={`text-4xl font-bold ${statusInfo.color}`}>{daysLeft}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">
                            {daysLeft === 1 ? 'day left' : 'days left'}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex sm:flex-row gap-2">
                      <motion.button 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => startEdit(exam)} 
                        className="p-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700/70 text-gray-600 dark:text-gray-400 transition-colors"
                      >
                        <Edit size={18} />
                      </motion.button>
                      <motion.button 
                        whileTap={{ scale: 0.95 }} 
                        onClick={() => deleteExam(exam.id)} 
                        className="p-2.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:hover:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash size={18} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Exams;