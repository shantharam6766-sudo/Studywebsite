import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, Crown, Zap, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useStudyData } from '../contexts/StudyDataContext';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose }) => {
  const { user, signOut } = useAuth();
  const { getTotalStudyHours, getTotalTasksCompleted, pomodoroSessions } = useStudyData();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const totalStudyHours = getTotalStudyHours();
  const totalTasksCompleted = getTotalTasksCompleted();
  const totalSessions = pomodoroSessions.reduce((sum, session) => sum + session.count, 0);
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-primary to-primary-dark text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={32} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {user.user_metadata?.full_name || 'Student'}
              </h2>
              <p className="text-white/80 text-sm">{user.email}</p>
              <div className="flex items-center mt-1">
                <Crown size={14} className="mr-1" />
                <span className="text-xs">Member since {memberSince}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your Progress
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalSessions}
                  </p>
                  <p className="text-sm text-blue-600/80 dark:text-blue-400/80">
                    Focus Sessions
                  </p>
                </div>
                <Zap size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {totalStudyHours}
                  </p>
                  <p className="text-sm text-green-600/80 dark:text-green-400/80">
                    Study Time
                  </p>
                </div>
                <BookOpen size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalTasksCompleted}
                  </p>
                  <p className="text-sm text-purple-600/80 dark:text-purple-400/80">
                    Tasks Done
                  </p>
                </div>
                <Calendar size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    Pro
                  </p>
                  <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
                    Plan
                  </p>
                </div>
                <Crown size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center">
                <Settings size={20} className="text-gray-600 dark:text-gray-400 mr-3" />
                <span className="text-gray-900 dark:text-gray-100">Account Settings</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
            >
              <div className="flex items-center">
                <LogOut size={20} className="mr-3" />
                <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;