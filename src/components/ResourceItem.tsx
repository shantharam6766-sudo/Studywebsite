import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Trash } from 'lucide-react';
import { Resource, useStudyData } from '../contexts/StudyDataContext';

interface ResourceItemProps {
  resource: Resource;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ resource }) => {
  const { deleteResource } = useStudyData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      layout
      className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mb-3 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">{resource.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{resource.url}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        <motion.a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full text-primary dark:text-primary-light hover:bg-primary/10 dark:hover:bg-primary-light/10 transition-colors duration-200"
        >
          <ExternalLink size={18} />
        </motion.a>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => deleteResource(resource.id)}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
        >
          <Trash size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ResourceItem;