
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Helper function to generate a consistent, visually appealing color from a string
const generateColorFromString = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  // Using a light pastel color
  return `hsl(${h}, 70%, 85%)`;
};

const Account: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt("This is a permanent action. To confirm, please type 'DELETE' in the box below.");
    if (confirmation === 'DELETE') {
      const { error } = await supabase.functions.invoke('delete-user');
      if (error) {
        console.error('Error deleting account:', error);
        alert('There was an error deleting your account. Please try again.');
      } else {
        alert('Your account has been successfully deleted.');
        await signOut();
        navigate('/');
      }
    } else {
      alert('Account deletion cancelled.');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg mb-4">You have been signed out.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-primary text-white rounded-md">Go to Homepage</button>
      </div>
    );
  }

  const isGoogleProvider = user.app_metadata.provider === 'google';
  
  const getDisplayName = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    const emailName = user.email?.split('@')[0] ?? 'User';
    return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  };
  
  const displayName = getDisplayName();
  const userInitial = displayName.charAt(0).toUpperCase();
  const iconBgColor = generateColorFromString(user.id);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">My Account</h1>
      
      {/* Profile Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
        <div className="flex flex-col sm:flex-row items-center">
          {isGoogleProvider && user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="User Avatar" className="w-20 h-20 rounded-full mb-4 sm:mb-0 sm:mr-6" />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6"
              style={{ backgroundColor: iconBgColor }}
            >
              <span className="text-3xl font-bold text-gray-700 dark:text-gray-900">{userInitial}</span>
            </div>
          )}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold">{displayName}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md opacity-50 cursor-not-allowed">
            <h3 className="text-xl font-semibold mb-2">Subscription & Billing</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Manage your subscription and view billing history. (Coming Soon)</p>
            <button className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border rounded-md text-sm font-medium" disabled>
                Manage Subscription <ChevronRight className="ml-2" size={16} />
            </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold mb-2">Authentication</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Sign out of your account on this device.</p>
            <button
                onClick={handleSignOut}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
            >
                <LogOut className="mr-2" size={18} />
                Sign Out
            </button>
        </div>
      </div>

      <div className="text-center mt-12">
        <button
            onClick={handleDeleteAccount}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          Permanently delete my account
        </button>
      </div>
    </div>
  );
};

export default Account;
