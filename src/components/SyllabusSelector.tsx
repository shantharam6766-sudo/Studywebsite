import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Users, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { syllabusDB, ExamBoard, ExamPattern } from '../lib/syllabusDatabase';

interface SyllabusSelectorProps {
  onSelect: (syllabus: ExamPattern) => void;
  onClose: () => void;
}

const SyllabusSelector: React.FC<SyllabusSelectorProps> = ({ onSelect, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [examBoards, setExamBoards] = useState<ExamBoard[]>([]);
  const [availablePatterns, setAvailablePatterns] = useState<ExamPattern[]>([]);
  const [filteredPatterns, setFilteredPatterns] = useState<ExamPattern[]>([]);

  useEffect(() => {
    // Load exam boards
    const boards = syllabusDB.getExamBoards();
    setExamBoards(boards);
  }, []);

  useEffect(() => {
    // Load patterns for selected board
    if (selectedBoard) {
      const patterns = syllabusDB.getExamPatternsByBoard(selectedBoard);
      setAvailablePatterns(patterns);
      setFilteredPatterns(patterns);
    } else {
      setAvailablePatterns([]);
      setFilteredPatterns([]);
    }
  }, [selectedBoard]);

  useEffect(() => {
    // Filter patterns based on search
    if (searchQuery.trim()) {
      const filtered = syllabusDB.searchSyllabi(searchQuery);
      setFilteredPatterns(filtered);
    } else {
      setFilteredPatterns(availablePatterns);
    }
  }, [searchQuery, availablePatterns]);

  const handleSelectSyllabus = (pattern: ExamPattern) => {
    onSelect(pattern);
    onClose();
  };

  const getBoardTypeColor = (type: string) => {
    switch (type) {
      case 'central': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'state': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'competitive': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'professional': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Choose Your Syllabus
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search syllabi, subjects, or chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar - Exam Boards */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Exam Boards
              </h3>
              <div className="space-y-2">
                {examBoards.map((board) => (
                  <motion.button
                    key={board.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedBoard(board.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedBoard === board.id
                        ? 'bg-primary/10 border-primary/20 border'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                          {board.name}
                        </h4>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getBoardTypeColor(board.type)}`}>
                          {board.type}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Syllabus Patterns */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {!selectedBoard ? (
                <div className="text-center py-12">
                  <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Select an Exam Board
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Choose an exam board from the sidebar to view available syllabi
                  </p>
                </div>
              ) : filteredPatterns.length === 0 ? (
                <div className="text-center py-12">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No Syllabi Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your search or selecting a different board
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPatterns.map((pattern) => {
                    const stats = syllabusDB.getSyllabusStats(pattern.id);
                    return (
                      <motion.div
                        key={pattern.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4 }}
                        onClick={() => handleSelectSyllabus(pattern)}
                        className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/30 bg-white dark:bg-gray-800 cursor-pointer transition-all hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {pattern.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {pattern.class_level} • {pattern.duration_months} months
                            </p>
                          </div>
                          <div className="p-2 rounded-lg bg-primary/10">
                            <BookOpen size={20} className="text-primary" />
                          </div>
                        </div>

                        {stats && (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center">
                              <Users size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.totalSubjects} subjects
                              </span>
                            </div>
                            <div className="flex items-center">
                              <BookOpen size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.totalChapters} chapters
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.estimatedHours}h estimated
                              </span>
                            </div>
                            <div className="flex items-center">
                              <TrendingUp size={16} className="text-gray-400 mr-2" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {stats.totalSubtopics} topics
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {pattern.subjects.slice(0, 3).map((subject) => (
                            <span
                              key={subject.id}
                              className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            >
                              {subject.name}
                            </span>
                          ))}
                          {pattern.subjects.length > 3 && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              +{pattern.subjects.length - 3} more
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SyllabusSelector;