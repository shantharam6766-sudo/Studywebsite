import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash, BookOpen, ArrowLeft, Check, X } from 'lucide-react';
import { useStudyData, Syllabus } from '../contexts/StudyDataContext';
import SyllabusSubject from '../components/SyllabusSubject';

const SyllabusTracker: React.FC = () => {
  const { syllabi, addSyllabus, updateSyllabus, deleteSyllabus } = useStudyData();
  const [activeSyllabusId, setActiveSyllabusId] = useState<string | null>(null);
  const [isAddingSyllabus, setIsAddingSyllabus] = useState(false);
  const [newSyllabusTitle, setNewSyllabusTitle] = useState('');

  const [editingSyllabusId, setEditingSyllabusId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  // --- THIS IS THE KEY LOGIC FIX ---
  // Create a new list of only the *real* syllabi to display.
  const realSyllabi = syllabi.filter(s => !s.isPlaceholder);
  const activeSyllabus = syllabi.find(s => s.id === activeSyllabusId);

  const handleAddSyllabus = () => {
    if (newSyllabusTitle.trim()) {
      const newSyllabusId = addSyllabus(newSyllabusTitle);
      setNewSyllabusTitle('');
      setIsAddingSyllabus(false);
      // Automatically view the newly created syllabus
      setActiveSyllabusId(newSyllabusId);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, syllabus: Syllabus) => {
    e.stopPropagation();
    setEditingSyllabusId(syllabus.id);
    setEditedTitle(syllabus.title);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingSyllabusId && editedTitle.trim()) {
      updateSyllabus(editingSyllabusId, editedTitle.trim());
    }
    setEditingSyllabusId(null);
    setEditedTitle('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSyllabusId(null);
    setEditedTitle('');
  };

  const handleDeleteSyllabus = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this syllabus and all its subjects?')) {
        deleteSyllabus(id);
        if (activeSyllabusId === id) setActiveSyllabusId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
    exit: { opacity: 0, x: 30, transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  };

  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <AnimatePresence mode="wait">
        {activeSyllabus && !activeSyllabus.isPlaceholder ? (
          // --- DETAIL VIEW (When a syllabus is clicked) ---
          <motion.div key="detail-view" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <div className="flex items-center gap-4 mb-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveSyllabusId(null)} className="flex items-center justify-center p-2 rounded-full bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700">
                <ArrowLeft size={20} />
              </motion.button>
              <div>
                <h1 className="text-3xl font-heading font-bold leading-none mb-1">{activeSyllabus.title}</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage subjects and chapters.</p>
              </div>
            </div>
            <SyllabusSubject syllabus={activeSyllabus} />
          </motion.div>
        ) : (
          // --- LIST VIEW (The main page) ---
          <motion.div key="list-view" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-heading font-bold">Your Syllabus Track</h1>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddingSyllabus(true)} className="btn-primary flex items-center">
                <Plus size={18} className="mr-2" /> Add Syllabus
              </motion.button>
            </div>
            
            {/* --- SMART UI LOGIC: Check if there are any REAL syllabi to show --- */}
            {realSyllabi.length === 0 ? (
              // If not, show the helpful "empty state" prompt
              <motion.div 
                className="text-center py-20 px-6 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ready to Get Organized?</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">A syllabus is your roadmap to success. Click "Add Syllabus" to create a track for your course or exam.</p>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsAddingSyllabus(true)} className="btn-primary flex items-center mx-auto">
                  <Plus size={18} className="mr-2" /> Create First Syllabus
                </motion.button>
              </motion.div>
            ) : (
              // If there are real syllabi, map over them and render YOUR original card design
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {realSyllabi.map(syllabus => {
                  const totalChapters = syllabus.subjects.reduce((acc, s) => acc + s.chapters.length, 0);
                  const masteredChapters = syllabus.subjects.reduce((acc, s) => acc + s.chapters.filter(c => c.status === 'mastered').length, 0);
                  const progress = totalChapters > 0 ? (masteredChapters / totalChapters) * 100 : 0;
                  const isEditing = editingSyllabusId === syllabus.id;
                  
                  return (
                    <motion.div
                      key={syllabus.id}
                      variants={itemVariants}
                      layoutId={`syllabus-card-${syllabus.id}`}
                      onClick={isEditing ? undefined : () => setActiveSyllabusId(syllabus.id)}
                      className="group flex flex-col justify-between p-6 rounded-2xl border-2 border-transparent bg-white dark:bg-gray-800 hover:border-primary dark:hover:border-primary-light transition-all duration-300 shadow-md hover:shadow-xl"
                      style={{ cursor: isEditing ? 'default' : 'pointer' }}
                    >
                      {isEditing ? (
                        <div className="flex-grow">
                          <div className="flex items-center gap-3 mb-4">
                            <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(e as any); if (e.key === 'Escape') handleCancelEdit(e as any); }} className="input flex-grow min-w-0" autoFocus onClick={(e) => e.stopPropagation()} />
                            <div className="flex items-center">
                              <motion.button whileTap={{scale:0.9}} onClick={handleSaveEdit} className="p-2 rounded-full hover:bg-green-500/10 text-gray-500 hover:text-green-500"><Check size={16}/></motion.button>
                              <motion.button whileTap={{scale:0.9}} onClick={handleCancelEdit} className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-500"><X size={16}/></motion.button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-grow">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0"><BookOpen size={22} className="text-primary" /></div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-grow min-w-0 truncate">{syllabus.title}</h3>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <motion.button whileTap={{scale:0.9}} onClick={(e) => handleStartEdit(e, syllabus)} className="p-2 rounded-full hover:bg-blue-500/10 text-gray-500 hover:text-blue-500"><Edit size={16}/></motion.button>
                              <motion.button whileTap={{scale:0.9}} onClick={(e) => handleDeleteSyllabus(e, syllabus.id)} className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-500"><Trash size={16}/></motion.button>
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex justify-between text-sm mb-2 text-gray-600 dark:text-gray-400">
                          <span>{syllabus.subjects.length} subjects</span>
                          <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div style={{ width: `${progress}%` }} className="h-full bg-primary rounded-full transition-all duration-500"/>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            
            {/* The "Add Syllabus" modal logic */}
            <AnimatePresence>
              {isAddingSyllabus && (
                <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  <motion.div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md" initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}}>
                    <h2 className="text-xl font-bold mb-4">Create New Syllabus</h2>
                    <input type="text" value={newSyllabusTitle} onChange={(e) => setNewSyllabusTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddSyllabus()} placeholder="e.g., Spring Semester 2025" className="input mb-4"/>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIsAddingSyllabus(false)} className="btn-outline">Cancel</button>
                      <button onClick={handleAddSyllabus} className="btn-primary">Create</button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyllabusTracker;