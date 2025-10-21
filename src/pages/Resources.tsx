import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { useStudyData } from '../contexts/StudyDataContext';
import ResourceItem from '../components/ResourceItem';

const Resources: React.FC = () => {
  const { resources, addResource } = useStudyData();
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [error, setError] = useState('');

  const handleAddResource = () => {
    // Validate URL
    let url = newResourceUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      new URL(url);
      addResource(newResourceTitle, url);
      setNewResourceTitle('');
      setNewResourceUrl('');
      setIsAddingResource(false);
      setError('');
    } catch (err) {
      setError('Please enter a valid URL');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-heading font-bold">Resources</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddingResource(true)}
          className="btn-primary flex items-center"
          disabled={isAddingResource}
        >
          <Plus size={18} className="mr-1" /> Add Resource
        </motion.button>
      </div>

      <AnimatePresence>
        {isAddingResource && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glassmorphism p-6 mb-6 rounded-xl"
          >
            <h3 className="text-xl font-semibold mb-4">Add New Resource</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Resource Name</label>
                <input
                  type="text"
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  className="input"
                  placeholder="E.g., CA Foundation Study Material"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LinkIcon size={16} className="text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    className="input pl-10"
                    placeholder="https://example.com"
                  />
                </div>
                {error && <p className="text-sm text-error mt-1">{error}</p>}
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setIsAddingResource(false);
                    setNewResourceTitle('');
                    setNewResourceUrl('');
                    setError('');
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddResource}
                  className="btn-primary"
                  disabled={!newResourceTitle || !newResourceUrl}
                >
                  Add Resource
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {resources.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
          >
            <LinkIcon size={40} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No resources added yet.</p>
            <button
              onClick={() => setIsAddingResource(true)}
              className="btn-primary inline-flex items-center"
            >
              <Plus size={18} className="mr-1" /> Add Your First Resource
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => (
              <ResourceItem key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Resources;