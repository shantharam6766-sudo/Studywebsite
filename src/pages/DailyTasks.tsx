import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { useStudyData } from '../contexts/StudyDataContext';
import TaskItem from '../components/TaskItem';
import { ChevronLeft, ChevronRight, RotateCcw, CheckCheck, Plus, Edit, X, Check, GripVertical } from 'lucide-react';
import Confetti from 'react-confetti';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

const DailyTasks: React.FC = () => {
  const { dailyTasks, getTodayTasks, updateTaskCompletion, resetDailyTasks, addCustomTask, editTask, deleteTask, reorderTasks } = useStudyData();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tasks, setTasks] = useState(getTodayTasks());
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTaskTitle, setEditedTaskTitle] = useState('');
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update window size for confetti
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set up tasks for the selected date
  useEffect(() => {
    if (selectedDate === format(new Date(), 'yyyy-MM-dd')) {
      setTasks(getTodayTasks());
    } else if (dailyTasks[selectedDate]) {
      setTasks(dailyTasks[selectedDate]);
    } else {
      resetDailyTasks(selectedDate);
      setTasks(dailyTasks[selectedDate] || []);
    }
  }, [selectedDate, dailyTasks, getTodayTasks, resetDailyTasks]);

  // Check if all tasks are completed for confetti
  useEffect(() => {
    if (tasks.length > 0 && tasks.every(task => task.completed)) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [tasks]);

  const goToPreviousDay = () => {
    const prevDate = subDays(parseISO(selectedDate), 1);
    setSelectedDate(format(prevDate, 'yyyy-MM-dd'));
  };

  const goToNextDay = () => {
    const nextDate = addDays(parseISO(selectedDate), 1);
    setSelectedDate(format(nextDate, 'yyyy-MM-dd'));
  };

  const resetTasks = () => {
    resetDailyTasks(selectedDate);
    setTasks(dailyTasks[selectedDate] || []);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addCustomTask(newTaskTitle);
      setNewTaskTitle('');
      setIsAddingTask(false);
    }
  };

  const handleEditTask = (taskId: string) => {
    if (editedTaskTitle.trim()) {
      editTask(taskId, editedTaskTitle);
      setEditingTaskId(null);
      setEditedTaskTitle('');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id);
      const newIndex = tasks.findIndex(task => task.id === over.id);
      reorderTasks(oldIndex, newIndex);
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
          colors={['#60A5FA', '#F59E0B', '#10B981', '#8B5CF6']}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold">Daily Tasks</h1>
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddingTask(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={18} className="mr-1" /> Add Task
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetTasks}
            className="btn-outline flex items-center"
          >
            <RotateCcw size={16} className="mr-1" /> Reset
          </motion.button>
        </div>
      </div>

      <div className="glassmorphism p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={goToPreviousDay}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </motion.button>
          
          <h2 className="text-xl font-semibold">
            {selectedDate === format(new Date(), 'yyyy-MM-dd')
              ? 'Today'
              : format(parseISO(selectedDate), 'EEEE, MMMM d')}
          </h2>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={goToNextDay}
            disabled={selectedDate === format(new Date(), 'yyyy-MM-dd')}
            className={`p-2 rounded-full ${
              selectedDate === format(new Date(), 'yyyy-MM-dd')
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
            }`}
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              {completedCount} of {tasks.length} tasks completed
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-primary dark:bg-primary-light rounded-full"
            ></motion.div>
          </div>
        </div>

        <AnimatePresence>
          {isAddingTask && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="input flex-1"
                  placeholder="New task title"
                  autoFocus
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTask}
                  className="btn-primary px-3 py-2"
                >
                  <Check size={18} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                  }}
                  className="btn-outline px-3 py-2"
                >
                  <X size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map(task => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence>
              {tasks.map((task) => (
                <div key={task.id} className="mb-2">
                  {editingTaskId === task.id ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={editedTaskTitle}
                        onChange={(e) => setEditedTaskTitle(e.target.value)}
                        className="input flex-1"
                        autoFocus
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditTask(task.id)}
                        className="btn-primary px-3 py-2"
                      >
                        <Check size={18} />
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditingTaskId(null);
                          setEditedTaskTitle('');
                        }}
                        className="btn-outline px-3 py-2"
                      >
                        <X size={18} />
                      </motion.button>
                    </motion.div>
                  ) : (
                    <TaskItem
                      key={task.id}
                      task={task}
                      date={selectedDate}
                      onEdit={() => {
                        setEditingTaskId(task.id);
                        setEditedTaskTitle(task.title);
                      }}
                      onDelete={() => deleteTask(task.id)}
                    />
                  )}
                </div>
              ))}
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        {tasks.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-gray-500 dark:text-gray-400">No tasks for this day.</p>
          </motion.div>
        )}

        {tasks.length > 0 && tasks.every(task => task.completed) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-success/10 rounded-lg text-center"
          >
            <CheckCheck className="text-success inline-block mb-2" size={24} />
            <p className="text-success font-medium">All tasks completed! Great job!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DailyTasks;