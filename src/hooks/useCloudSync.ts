import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SyncStatus {
  syncing: boolean;
  lastSync: Date | null;
  error: string | null;
  pendingChanges: number;
}

export function useCloudSync() {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    syncing: false,
    lastSync: null,
    error: null,
    pendingChanges: 0,
  });

  // Sync data to cloud
  const syncToCloud = useCallback(async (table: string, data: any) => {
    if (!user) return;

    setSyncStatus(prev => ({ ...prev, syncing: true, error: null }));

    try {
      const { error } = await supabase
        .from(table)
        .upsert({ ...data, user_id: user.id, updated_at: new Date().toISOString() });

      if (error) throw error;

      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        lastSync: new Date(),
        pendingChanges: Math.max(0, prev.pendingChanges - 1),
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
      }));
    }
  }, [user]);

  // Sync data from cloud
  const syncFromCloud = useCallback(async (table: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to sync from cloud:', error);
      return null;
    }
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channels = ['syllabi', 'notes', 'daily_tasks', 'exams', 'pomodoro_sessions'].map(table => {
      return supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            // Handle real-time updates
            console.log('Real-time update:', payload);
            setSyncStatus(prev => ({ ...prev, lastSync: new Date() }));
          }
        )
        .subscribe();
    });

    return () => {
      channels.forEach(channel => channel.unsubscribe());
    };
  }, [user]);

  // Offline queue management
  const addToPendingSync = useCallback((data: any) => {
    setSyncStatus(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    
    // Store in IndexedDB for offline support
    if ('indexedDB' in window) {
      const request = indexedDB.open('StudyForExamsOffline', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pending_sync'], 'readwrite');
        const store = transaction.objectStore('pending_sync');
        store.add({ ...data, timestamp: Date.now() });
      };
    }
  }, []);

  // Process offline queue when online
  const processPendingSync = useCallback(async () => {
    if (!navigator.onLine || !user) return;

    if ('indexedDB' in window) {
      const request = indexedDB.open('StudyForExamsOffline', 1);
      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['pending_sync'], 'readwrite');
        const store = transaction.objectStore('pending_sync');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = async () => {
          const pendingItems = getAllRequest.result;
          
          for (const item of pendingItems) {
            try {
              await syncToCloud(item.table, item.data);
              store.delete(item.id);
            } catch (error) {
              console.error('Failed to sync pending item:', error);
            }
          }
        };
      };
    }
  }, [user, syncToCloud]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => processPendingSync();
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, error: 'Offline - changes will sync when online' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processPendingSync]);

  return {
    syncStatus,
    syncToCloud,
    syncFromCloud,
    addToPendingSync,
    processPendingSync,
  };
}