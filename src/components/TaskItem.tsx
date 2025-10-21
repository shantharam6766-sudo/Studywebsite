import React from 'react';
import { motion } from 'framer-motion';
import { Task, useStudyData } from '../contexts/StudyDataContext';
import { format } from 'date-fns';
import { CheckSquare, Square, Edit, Trash, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskItemProps {
  task: Task;
  date?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, date = format(new Date(), 'yyyy-MM-dd'), onEdit, onDelete }) => {
  const { updateTaskCompletion } = useStudyData();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const toggleCompletion = () => {
    updateTaskCompletion(date, task.id, !task.completed);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      layout
      className="flex items-center p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical size={18} />
      </div>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleCompletion}
        className="flex items-center justify-center rounded-md mr-3 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light focus:outline-none transition-colors duration-200"
      >
        {task.completed ? (
          <CheckSquare className="text-primary dark:text-primary-light\" size={22} />
        ) : (
          <Square size={22} />
        )}
      </motion.button>
      
      <span className={`flex-1 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
        {task.title}
      </span>

      <div className="flex items-center space-x-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
        >
          <Edit size={16} />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <Trash size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TaskItem;