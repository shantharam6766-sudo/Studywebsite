
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useImmer } from 'use-immer';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { format, isToday, parseISO } from 'date-fns';

// --- TYPE DEFINITIONS ---
export interface Task { id: string; title: string; completed: boolean; user_id?: string; created_at?: string; }
export interface Chapter { id: string; title: string; status: 'plan' | 'studying' | 'mastered'; user_id?: string; subject_id: string; }
export interface Subject { id: string; title: string; chapters: Chapter[]; color: string; user_id?: string; syllabus_id: string; }
export interface Syllabus { id: string; title: string; subjects: Subject[]; isPlaceholder?: boolean; user_id?: string; }
export interface Note { id: string; title: string; content: string; created_at: string; updated_at: string; is_pinned?: boolean; is_archived?: boolean; user_id?: string; }
export interface PomodoroSettings { workDuration: number; shortBreakDuration: number; longBreakDuration: number; sessionsPerCycle: number; }
export interface PomodoroSession { id?: string; user_id?: string; date: string; count: number; total_minutes: number; }
export interface Exam { id: string; title: string; date: string; isPlaceholder?: boolean; user_id?: string; }
export interface Resource { id: string; title: string; url: string; user_id?: string; created_at?: string; }

// --- CONSTANTS ---
const GUEST_STORAGE_KEYS = ['syllabi', 'notes', 'pomodoro_sessions', 'tasks', 'exams', 'resources'];
const USER_CACHE_KEY = 'user_cache';
const subjectColors = [ '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1' ];

const initialData = {
  syllabi: [{ id: 'placeholder-syllabus-01', title: 'Create Your First Syllabus', subjects: [], isPlaceholder: true }] as Syllabus[],
  notes: [] as Note[],
  pomodoro_sessions: [] as PomodoroSession[],
  tasks: [] as Task[],
  exams: [{ id: 'placeholder-exam-01', title: 'Your First Exam', date: new Date().toISOString(), isPlaceholder: true }] as Exam[],
  resources: [] as Resource[],
  pomodoroSettings: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, sessionsPerCycle: 4 } as PomodoroSettings,
};

// --- HELPER FUNCTIONS ---
const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

// --- CONTEXT TYPE ---
interface StudyDataContextType {
    loading: boolean;
    isSyncing: boolean;
    syllabi: Syllabus[];
    notes: Note[];
    tasks: Task[];
    exams: Exam[];
    resources: Resource[];
    pomodoroSessions: PomodoroSession[];
    pomodoroSettings: PomodoroSettings;
    addSyllabus: (title: string) => Promise<string>;
    updateSyllabus: (id: string, title: string) => Promise<void>;
    deleteSyllabus: (id: string) => Promise<void>;
    addSubject: (syllabusId: string, title: string) => Promise<void>;
    updateSubject: (syllabusId: string, subjectId: string, title: string) => Promise<void>;
    deleteSubject: (syllabusId: string, subjectId: string) => Promise<void>;
    addChapter: (syllabusId: string, subjectId: string, title: string) => Promise<void>;
    updateChapterStatus: (syllabusId: string, subjectId: string, chapterId: string, status: Chapter['status']) => Promise<void>;
    addNote: (title: string, content: string) => Promise<string>;
    updateNote: (id: string, title: string, content: string) => Promise<void>;
    deleteNote: (id: string) => Promise<void>;
    togglePinNote: (id: string) => Promise<void>;
    toggleArchiveNote: (id: string) => Promise<void>;
    addTask: (title: string) => Promise<void>;
    updateTask: (id: string, completed: boolean) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    getTodayTasks: () => Task[];
    getTotalTasksCompleted: () => number;
    addExam: (title: string, date: string) => Promise<void>;
    updateExam: (id: string, title: string, date: string) => Promise<void>;
    deleteExam: (id: string) => Promise<void>;
    addResource: (title: string, url: string) => Promise<void>;
    deleteResource: (id: string) => Promise<void>;
    addPomodoroSession: () => Promise<void>;
    getTotalStudyHours: () => number;
}

const StudyDataContext = createContext<StudyDataContextType | undefined>(undefined);

export function StudyDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- LOCAL STATE MANAGEMENT ---
  const [syllabi, setSyllabi] = useImmer<Syllabus[]>([]);
  const [notes, setNotes] = useImmer<Note[]>([]);
  const [tasks, setTasks] = useImmer<Task[]>([]);
  const [exams, setExams] = useImmer<Exam[]>([]);
  const [resources, setResources] = useImmer<Resource[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useImmer<PomodoroSession[]>([]);
  const [pomodoroSettings] = useState<PomodoroSettings>(initialData.pomodoroSettings);

  // --- DATA PERSISTENCE EFFECTS ---

  // EFFECT 1: INITIAL LOAD FROM CACHE (INSTANT)
  useEffect(() => {
    const cachedUserData = loadFromLocalStorage(USER_CACHE_KEY, null);
    if (user && cachedUserData) {
        setSyllabi(cachedUserData.syllabi || initialData.syllabi);
        setNotes(cachedUserData.notes || initialData.notes);
        setTasks(cachedUserData.tasks || initialData.tasks);
        setExams(cachedUserData.exams || initialData.exams);
        setResources(cachedUserData.resources || initialData.resources);
        setPomodoroSessions(cachedUserData.pomodoro_sessions || initialData.pomodoro_sessions);
    } else {
        setSyllabi(loadFromLocalStorage('syllabi', initialData.syllabi));
        setNotes(loadFromLocalStorage('notes', initialData.notes));
        setTasks(loadFromLocalStorage('tasks', initialData.tasks));
        setExams(loadFromLocalStorage('exams', initialData.exams));
        setResources(loadFromLocalStorage('resources', initialData.resources));
        setPomodoroSessions(loadFromLocalStorage('pomodoro_sessions', initialData.pomodoro_sessions));
    }
    setLoading(false);
  }, [user]);

  // EFFECT 2: SYNC WITH CLOUD (BACKGROUND)
  useEffect(() => {
    if (loading || !user) return;

    const syncCloudData = async () => {
        setIsSyncing(true);
        try {
            const guestDataExists = GUEST_STORAGE_KEYS.some(key => localStorage.getItem(key) !== null);
            if (guestDataExists) {
                await handleGuestToUserSync(user, async () => {
                    const freshData = await fetchAllCloudData(user);
                    setAllData(freshData);
                });
            } else {
                const freshData = await fetchAllCloudData(user);
                setAllData(freshData);
            }
        } catch (error) {
            console.error("Cloud sync failed:", error);
        } finally {
            setIsSyncing(false);
        }
    };
    syncCloudData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // EFFECT 3: PERSIST TO LOCAL STORAGE ON CHANGE
  useEffect(() => {
    if (loading) return;
    if (user) {
        const userCache = { syllabi, notes, tasks, exams, resources, pomodoro_sessions: pomodoroSessions };
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userCache));
    } else {
        GUEST_STORAGE_KEYS.forEach(key => {
            switch(key) {
                case 'syllabi': localStorage.setItem(key, JSON.stringify(syllabi.filter(s => !s.isPlaceholder))); break;
                case 'notes': localStorage.setItem(key, JSON.stringify(notes)); break;
                case 'tasks': localStorage.setItem(key, JSON.stringify(tasks)); break;
                case 'exams': localStorage.setItem(key, JSON.stringify(exams.filter(e => !e.isPlaceholder))); break;
                case 'resources': localStorage.setItem(key, JSON.stringify(resources)); break;
                case 'pomodoro_sessions': localStorage.setItem(key, JSON.stringify(pomodoroSessions)); break;
            }
        })
    }
  }, [user, syllabi, notes, tasks, exams, resources, pomodoroSessions, loading]);
    
  // --- UTILITY & HELPER FUNCTIONS ---
  const setAllData = (data: any) => {
    setSyllabi(data.syllabi || initialData.syllabi);
    setNotes(data.notes || initialData.notes);
    setTasks(data.tasks || initialData.tasks);
    setExams(data.exams || initialData.exams);
    setResources(data.resources || initialData.resources);
    setPomodoroSessions(data.pomodoro_sessions || initialData.pomodoro_sessions);
  };
    
  const getTodayTasks = () => tasks.filter(task => task.created_at && isToday(parseISO(task.created_at)));

  const getTotalStudyHours = () => {
    if (!pomodoroSessions) return 0;
    const totalMinutes = pomodoroSessions.reduce((acc, session) => acc + session.total_minutes, 0);
    return totalMinutes / 60;
  };
  
  const getTotalTasksCompleted = () => {
    if (!tasks) return 0;
    return tasks.filter(task => task.completed).length;
  };

  // --- RESOURCE FUNCTIONS ---
  const addResource = async (title: string, url: string) => {
    const resourceData = { title, url, user_id: user?.id };
    if (user) {
      const { data, error } = await supabase.from('resources').insert(resourceData).select().single();
      if (error) throw error;
      setResources(draft => { draft.push(data); });
    } else {
      const newResource: Resource = { ...resourceData, id: uuidv4(), created_at: new Date().toISOString() };
      setResources(draft => { draft.push(newResource); });
    }
  };

  const deleteResource = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
    }
    setResources(draft => draft.filter(r => r.id !== id));
  };

  // --- ASYNC DATA FUNCTIONS (Largely Unchanged) ---
  // ... (All other add/update/delete functions remain the same)
  const addTask = async (title: string) => {
    const taskData = { title, completed: false, user_id: user?.id };
    if (user) {
      const { data, error } = await supabase.from('daily_tasks').insert(taskData).select().single();
      if (error) throw error;
      setTasks(draft => { draft.push(data); });
    } else {
      const newTask: Task = { ...taskData, id: uuidv4(), created_at: new Date().toISOString() };
      setTasks(draft => { draft.push(newTask); });
    }
  };

  const updateTask = async (id: string, completed: boolean) => {
    if (user) {
      const { error } = await supabase.from('daily_tasks').update({ completed }).eq('id', id);
      if (error) throw error;
    }
    setTasks(draft => {
      const task = draft.find(t => t.id === id);
      if (task) task.completed = completed;
    });
  };

  const deleteTask = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('daily_tasks').delete().eq('id', id);
      if (error) throw error;
    }
    setTasks(draft => draft.filter(t => t.id !== id));
  };

  // --- EXAM FUNCTIONS ---
  const addExam = async (title: string, date: string) => {
    const examData = { title, date, user_id: user?.id };
    if (user) {
      const { data, error } = await supabase.from('exams').insert(examData).select().single();
      if (error) throw error;
      setExams(draft => {
        const idx = draft.findIndex(e => e.isPlaceholder);
        if (idx !== -1) draft[idx] = data; else draft.push(data);
      });
    } else {
      const newExam: Exam = { ...examData, id: uuidv4() };
      setExams(draft => {
        const idx = draft.findIndex(e => e.isPlaceholder);
        if (idx !== -1) draft[idx] = newExam; else draft.push(newExam);
      });
    }
  };

  const updateExam = async (id: string, title: string, date: string) => {
    if (user) {
      const { error } = await supabase.from('exams').update({ title, date }).eq('id', id);
      if (error) throw error;
    }
    setExams(draft => {
      const exam = draft.find(e => e.id === id);
      if (exam) { Object.assign(exam, { title, date }); }
    });
  };

  const deleteExam = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
    }
    setExams(draft => draft.filter(e => e.id !== id));
  };

  // --- OTHER FUNCTIONS ---
    const addPomodoroSession = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const sessionMinutes = pomodoroSettings.workDuration;

    const existingSession = pomodoroSessions.find(p => p.date === today);

    if (user) {
      if (existingSession) {
        const { data, error } = await supabase.from('pomodoro_sessions').update({
          count: existingSession.count + 1,
          total_minutes: existingSession.total_minutes + sessionMinutes
        }).eq('id', existingSession.id!).select().single();
        if (error) throw error;
        setPomodoroSessions(draft => {
            const index = draft.findIndex(p => p.id === data.id);
            if (index !== -1) draft[index] = data;
        });
      } else {
        const { data, error } = await supabase.from('pomodoro_sessions').insert({ user_id: user.id, date: today, count: 1, total_minutes: sessionMinutes }).select().single();
        if (error) throw error;
        setPomodoroSessions(draft => { draft.push(data); });
      }
    } else {
      setPomodoroSessions(draft => {
        const session = draft.find(p => p.date === today);
        if (session) {
            session.count++;
            session.total_minutes += sessionMinutes;
        } else {
            draft.push({ id: uuidv4(), date: today, count: 1, total_minutes: sessionMinutes });
        }
      });
    }
  };

    const addSyllabus = async (title: string): Promise<string> => {
    const newSyllabus: Omit<Syllabus, 'id' | 'subjects'> = { title, user_id: user?.id };
    
    if (user) {
      const { data, error } = await supabase.from('syllabi').insert(newSyllabus).select('*, subjects(*, chapters(*))').single();
      if (error) throw error;
      setSyllabi(draft => { draft.push(data); });
      return data.id;
    } else {
      const id = uuidv4();
      const newSyllabusWithId: Syllabus = { id, ...newSyllabus, subjects: [] };
      setSyllabi(draft => {
        const idx = draft.findIndex(s => s.isPlaceholder);
        if (idx > -1) draft[idx] = newSyllabusWithId; else draft.push(newSyllabusWithId);
      });
      return id;
    }
  };

    const updateSyllabus = async (id: string, title: string) => {
    if (user) {
      const { error } = await supabase.from('syllabi').update({ title }).eq('id', id);
      if (error) throw error;
    }
    setSyllabi(draft => {
      const syllabus = draft.find(s => s.id === id);
      if (syllabus) syllabus.title = title;
    });
  };

  const deleteSyllabus = async (id: string) => {
    if (user) {
      const { error } = await supabase.from('syllabi').delete().eq('id', id);
      if (error) throw error;
    }
    setSyllabi(draft => draft.filter(s => s.id !== id));
  };
  
  const addSubject = async (syllabusId: string, title: string) => {
    const newSubjectData = { title, syllabus_id: syllabusId, color: subjectColors[Math.floor(Math.random()*subjectColors.length)], user_id: user?.id };

    if (user) {
      const { data: newSubject, error } = await supabase.from('subjects').insert(newSubjectData).select().single();
      if (error) throw error;
       setSyllabi(draft => {
        const syllabus = draft.find(s => s.id === syllabusId);
        if(syllabus) syllabus.subjects.push({...newSubject, chapters: []});
      });
    } else {
      const newSubject = { id: uuidv4(), ...newSubjectData, chapters: [] };
      setSyllabi(draft => {
        const syllabus = draft.find(s => s.id === syllabusId);
        if (syllabus) syllabus.subjects.push(newSubject);
      });
    }
  };

  const updateSubject = async (syllabusId: string, subjectId: string, title: string) => {
    if (user) {
      const { error } = await supabase.from('subjects').update({ title }).eq('id', subjectId);
      if (error) throw error;
    }
    setSyllabi(draft => {
      const subject = draft.find(s => s.id === syllabusId)?.subjects.find(sub => sub.id === subjectId);
      if (subject) subject.title = title;
    });
  };

  const deleteSubject = async (syllabusId: string, subjectId: string) => {
    if (user) {
      const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
      if (error) throw error;
    }
    setSyllabi(draft => {
      const syllabus = draft.find(s => s.id === syllabusId);
      if (syllabus) syllabus.subjects = syllabus.subjects.filter(sub => sub.id !== subjectId);
    });
  };
  
  const addChapter = async (syllabusId: string, subjectId: string, title: string) => {
    const newChapterData = { title, subject_id: subjectId, status: 'plan' as const, user_id: user?.id };
    
    if (user) {
        const { data: newChapter, error } = await supabase.from('chapters').insert(newChapterData).select().single();
        if (error) throw error;
        setSyllabi(draft => {
            const subject = draft.find(s => s.id === syllabusId)?.subjects.find(sub => sub.id === subjectId);
            if (subject) subject.chapters.push(newChapter);
        });
    } else {
        const newChapter = { id: uuidv4(), ...newChapterData };
        setSyllabi(draft => {
            const subject = draft.find(s => s.id === syllabusId)?.subjects.find(sub => sub.id === subjectId);
            if (subject) subject.chapters.push(newChapter);
        });
    }
  };
  
  const updateChapterStatus = async (syllabusId: string, subjectId: string, chapterId: string, status: Chapter['status']) => {
    if (user) {
      const { error } = await supabase.from('chapters').update({ status }).eq('id', chapterId);
      if (error) throw error;
    }
    setSyllabi(draft => {
      const chapter = draft.find(s => s.id === syllabusId)?.subjects.find(sub => sub.id === subjectId)?.chapters.find(c => c.id === chapterId);
      if (chapter) chapter.status = status;
    });
  };

  const addNote = async (title: string, content: string): Promise<string> => {
    const noteData = { title: title || 'Untitled Note', content, user_id: user?.id };
    if (user) {
      const { data: newNote, error } = await supabase.from('notes').insert(noteData).select().single();
      if (error) throw error;
      setNotes(draft => { draft.unshift(newNote); });
      return newNote.id;
    } else {
      const newNote: Note = { id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...noteData };
      setNotes(draft => { draft.unshift(newNote); });
      return newNote.id;
    }
  };

  const updateNote = async (id: string, title: string, content: string) => {
    const updated_at = new Date().toISOString();
    if (user) {
      const { error } = await supabase.from('notes').update({ title, content, updated_at }).eq('id', id);
      if (error) throw error;
    }
    setNotes(draft => {
      const note = draft.find(n => n.id === id);
      if (note) { Object.assign(note, { title, content, updated_at }); }
    });
  };

  const deleteNote = async (id: string) => {
    if (user) { const { error } = await supabase.from('notes').delete().eq('id', id); if (error) throw error; }
    setNotes(draft => draft.filter(n => n.id !== id));
  };
  
  const togglePinNote = async (id: string) => {
    const note = notes.find(n => n.id === id); if (!note) return;
    const is_pinned = !note.is_pinned;
    if (user) { const { error } = await supabase.from('notes').update({ is_pinned }).eq('id', id); if (error) throw error; }
    setNotes(draft => { const target = draft.find(n => n.id === id); if(target) target.is_pinned = is_pinned; });
  };
  
  const toggleArchiveNote = async (id: string) => {
    const note = notes.find(n => n.id === id); if (!note) return;
    const is_archived = !note.is_archived;
    if (user) { const { error } = await supabase.from('notes').update({ is_archived }).eq('id', id); if (error) throw error; }
    setNotes(draft => { const target = draft.find(n => n.id === id); if(target) target.is_archived = is_archived; });
  };
    
  const value: StudyDataContextType = { loading, isSyncing, syllabi, notes, tasks, exams, resources, pomodoroSessions, pomodoroSettings, addSyllabus, updateSyllabus, deleteSyllabus, addSubject, updateSubject, deleteSubject, addChapter, updateChapterStatus, addNote, updateNote, deleteNote, togglePinNote, toggleArchiveNote, addTask, updateTask, deleteTask, getTodayTasks, getTotalTasksCompleted, addExam, updateExam, deleteExam, addResource, deleteResource, addPomodoroSession, getTotalStudyHours };

  return <StudyDataContext.Provider value={value}>{children}</StudyDataContext.Provider>;
}

// --- NEW/REFACTORED HELPER FUNCTIONS ---

async function fetchAllCloudData(user: User) {
    const [syllabiRes, notesRes, pomodoroRes, tasksRes, examsRes, resourcesRes] = await Promise.all([
        supabase.from('syllabi').select('*, subjects(*, chapters(*))').eq('user_id', user.id),
        supabase.from('notes').select('*').eq('user_id', user.id),
        supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id),
        supabase.from('daily_tasks').select('*').eq('user_id', user.id),
        supabase.from('exams').select('*').eq('user_id', user.id),
        supabase.from('resources').select('*').eq('user_id', user.id),
    ]);

    // Simplified error handling
    const errors = [syllabiRes.error, notesRes.error, pomodoroRes.error, tasksRes.error, examsRes.error, resourcesRes.error].filter(Boolean);
    if (errors.length > 0) throw new Error(errors.map(e => e.message).join('\n'));
    
    return {
        syllabi: syllabiRes.data || [],
        notes: notesRes.data || [],
        pomodoro_sessions: pomodoroRes.data || [],
        tasks: tasksRes.data || [],
        exams: examsRes.data && examsRes.data.length > 0 ? examsRes.data : initialData.exams,
        resources: resourcesRes.data || [],
    };
}


async function handleGuestToUserSync(user: User, onSyncComplete: () => Promise<void>) {
  const { count, error: countError } = await supabase.from('syllabi').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  if (countError) { 
    console.error('Error checking for cloud data during sync.'); 
    return; 
  }

  if (count === 0) {
    try {
      await syncLocalToSupabase(user.id);
    } catch (syncError) {
      console.error(`Error syncing guest data: ${(syncError as Error).message}`);
    }
  } else {
    console.log('Existing user detected. Discarding local guest data.');
  }

  GUEST_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
  await onSyncComplete();
}

async function syncLocalToSupabase(userId: string) {
    const syncPromises = [];
    const syncOperations = [
      { key: 'syllabi', tableName: 'syllabi', isComplex: true },
      { key: 'notes', tableName: 'notes' },
      { key: 'pomodoro_sessions', tableName: 'pomodoro_sessions' },
      { key: 'tasks', tableName: 'daily_tasks' },
      { key: 'exams', tableName: 'exams' },
      { key: 'resources', tableName: 'resources' },
    ];
  
    for (const op of syncOperations) {
        const localData = loadFromLocalStorage(op.key, []);
        if (!localData || localData.length === 0) continue;

        if (op.key === 'syllabi') { // Special handling for nested syllabi
            const promise = Promise.all(localData.map(async (syllabus: Syllabus) => {
              const { subjects, ...syllabusData } = syllabus;
              const { data: newSyllabus, error: syllabusError } = await supabase.from('syllabi').insert({ ...syllabusData, user_id: userId, id: undefined }).select().single();
              if (syllabusError) throw syllabusError;
    
              for (const subject of subjects) {
                const { chapters, ...subjectData } = subject;
                const { data: newSubject, error: subjectError } = await supabase.from('subjects').insert({ ...subjectData, user_id: userId, syllabus_id: newSyllabus.id, id: undefined }).select().single();
                if (subjectError) throw subjectError;
    
                if (chapters.length > 0) {
                  const chapterData = chapters.map(c => ({ ...c, user_id: userId, subject_id: newSubject.id, id: undefined }));
                  const { error: chapterError } = await supabase.from('chapters').insert(chapterData);
                  if (chapterError) throw chapterError;
                }
              }
            }));
            syncPromises.push(promise);
        } else {
            const dataToInsert = localData.map((item: any) => ({ ...item, id: undefined, user_id: userId }));
            syncPromises.push(supabase.from(op.tableName).insert(dataToInsert));
        }
    }
    
    const results = await Promise.allSettled(syncPromises);
    const errors = results.filter(r => r.status === 'rejected');
    if (errors.length > 0) {
        console.error("Syncing errors:", errors.map(e => e.reason));
        throw new Error('One or more data types failed to sync.');
    }
}

export function useStudyData() {
  const context = useContext(StudyDataContext);
  if (context === undefined) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}
