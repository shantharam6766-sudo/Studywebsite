// src/contexts/StudyDataContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid'; 

export interface Task { id: string; title: string; completed: boolean; }
export interface Chapter { id: string; title: string; status: 'plan' | 'studying' | 'mastered'; }
export interface Subject { id: string; title: string; chapters: Chapter[]; color: string; }
export interface Note { id: string; title: string; content: string; createdAt: string; updatedAt: string; isPinned?: boolean; isArchived?: boolean; }
export interface Resource { id: string; title: string; url: string; }
export interface PomodoroSession { date: string; count: number; totalMinutes: number; }
export interface TaskCompletion { date: string; completedCount: number; totalCount: number; }
export interface Exam { id: string; title: string; date: string; isPlaceholder?: boolean; }
export interface Syllabus { id: string; title: string; subjects: Subject[]; isPlaceholder?: boolean; }

const initialDailyTasksTemplate: Task[] = [
  { id: uuidv4(), title: 'Review yesterday\'s material', completed: false },
  { id: uuidv4(), title: 'Complete 2 pomodoro sessions', completed: false },
  { id: uuidv4(), title: 'Practice typing for 30 minutes', completed: false },
];
const initialExams: Exam[] = [
  { id: 'placeholder-exam-01', title: 'Your First Exam', isPlaceholder: true },
];
const initialSyllabi: Syllabus[] = [
  { id: 'placeholder-syllabus-01', title: 'Create Your First Syllabus', subjects: [], isPlaceholder: true },
];
const subjectColors = [ '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1' ];

interface StudyDataContextType {
  dailyTasks: { [date: string]: Task[] }; getTodayTasks: () => Task[]; updateTaskCompletion: (date: string, taskId: string, completed: boolean) => void; resetDailyTasks: (date: string) => void; addCustomTask: (title: string) => void; editTask: (taskId: string, title: string) => void; deleteTask: (taskId: string) => void; reorderTasks: (startIndex: number, endIndex: number) => void;
  syllabi: Syllabus[]; addSyllabus: (title: string) => string; updateSyllabus: (id: string, title: string) => void; deleteSyllabus: (id: string) => void;
  addSubject: (syllabusId: string, title: string) => void; updateSubject: (syllabusId: string, subjectId: string, title: string) => void; deleteSubject: (syllabusId: string, subjectId: string) => void;
  addChapter: (syllabusId: string, subjectId: string, title: string) => void; updateChapter: (syllabusId: string, subjectId: string, chapterId: string, title: string) => void; updateChapterStatus: (syllabusId: string, subjectId: string, chapterId: string, status: 'plan' | 'studying' | 'mastered') => void; deleteChapter: (syllabusId: string, subjectId: string, chapterId: string) => void;
  notes: Note[]; addNote: (title: string, content: string) => string; updateNote: (id: string, title: string, content: string) => void; deleteNote: (id: string) => void; searchNotes: (query: string) => Note[]; togglePinNote: (id: string) => void; toggleArchiveNote: (id: string) => void;
  resources: Resource[]; addResource: (title: string, url: string) => void; deleteResource: (id: string) => void;
  pomodoroSettings: { workDuration: number; shortBreakDuration: number; longBreakDuration: number; }; updatePomodoroSettings: (settings: { workDuration: number; shortBreakDuration: number; longBreakDuration: number; }) => void;
  pomodoroSessions: PomodoroSession[]; addPomodoroSession: () => void; getTotalStudyHours: () => string;
  taskCompletions: TaskCompletion[]; getTotalTasksCompleted: () => number;
  exams: Exam[]; addExam: (title: string, date: string) => void; updateExam: (id: string, title: string, date: string) => void; deleteExam: (id: string) => void;
}

const StudyDataContext = createContext<StudyDataContextType | undefined>(undefined);

export function StudyDataProvider({ children }: { children: ReactNode }) {
  const [dailyTasks, setDailyTasks] = useState<{ [date: string]: Task[] }>(() => { const saved = localStorage.getItem('dailyTasks'); return saved ? JSON.parse(saved) : {}; }); 
  const [taskTemplate, setTaskTemplate] = useState<Task[]>(() => { const saved = localStorage.getItem('taskTemplate'); return saved ? JSON.parse(saved) : initialDailyTasksTemplate; });
  const [syllabi, setSyllabi] = useState<Syllabus[]>(() => { const saved = localStorage.getItem('syllabi'); return saved ? JSON.parse(saved) : initialSyllabi; });
  const [notes, setNotes] = useState<Note[]>(() => { const saved = localStorage.getItem('notes'); return saved ? JSON.parse(saved) : []; });
  const [resources, setResources] = useState<Resource[]>(() => { const saved = localStorage.getItem('resources'); return saved ? JSON.parse(saved) : []; });
  const [pomodoroSettings, setPomodoroSettings] = useState(() => { const saved = localStorage.getItem('pomodoroSettings'); return saved ? JSON.parse(saved) : { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 }; });
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>(() => { const saved = localStorage.getItem('pomodoroSessions'); return saved ? JSON.parse(saved) : []; });
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>(() => { const saved = localStorage.getItem('taskCompletions'); return saved ? JSON.parse(saved) : []; });
  const [exams, setExams] = useState<Exam[]>(() => { const saved = localStorage.getItem('exams'); return saved ? JSON.parse(saved) : initialExams; });

  useEffect(() => { localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks)); }, [dailyTasks]);
  useEffect(() => { localStorage.setItem('taskTemplate', JSON.stringify(taskTemplate)); }, [taskTemplate]);
  useEffect(() => { localStorage.setItem('syllabi', JSON.stringify(syllabi)); }, [syllabi]);
  useEffect(() => { localStorage.setItem('notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('resources', JSON.stringify(resources)); }, [resources]);
  useEffect(() => { localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings)); }, [pomodoroSettings]);
  useEffect(() => { localStorage.setItem('pomodoroSessions', JSON.stringify(pomodoroSessions)); }, [pomodoroSessions]);
  useEffect(() => { localStorage.setItem('taskCompletions', JSON.stringify(taskCompletions)); }, [taskCompletions]);
  useEffect(() => { localStorage.setItem('exams', JSON.stringify(exams)); }, [exams]);
  
  useEffect(() => { const today = format(new Date(), 'yyyy-MM-dd'); const todayTasks = dailyTasks[today] || []; const completedCount = todayTasks.filter(t => t.completed).length; setTaskCompletions(p => { const i = p.findIndex(tc => tc.date === today); const n = { date: today, completedCount, totalCount: todayTasks.length }; if (i !== -1) { const u = [...p]; u[i] = n; return u; } else { return [...p, n]; } }); }, [dailyTasks]);
  const getTodayTasks = () => { const today = format(new Date(), 'yyyy-MM-dd'); if (!dailyTasks[today]) { const newTasks = taskTemplate.map(t => ({ ...t, id: uuidv4(), completed: false })); setDailyTasks(p => ({ ...p, [today]: newTasks })); return newTasks; } return dailyTasks[today]; };
  const updateTaskCompletion = (date, taskId, completed) => setDailyTasks(p => { const tasks = p[date] ? [...p[date]] : [...taskTemplate]; const i = tasks.findIndex(t => t.id === taskId); if (i!==-1) tasks[i] = { ...tasks[i], completed }; return { ...p, [date]: tasks }; });
  const resetDailyTasks = (date) => setDailyTasks(p => ({ ...p, [date]: taskTemplate.map(t => ({ ...t, id: uuidv4(), completed: false })) }));
  const addCustomTask = (title) => setTaskTemplate(p => [...p, { id: uuidv4(), title, completed: false }]);
  const editTask = (taskId, title) => setTaskTemplate(p => p.map(t => (t.id === taskId ? { ...t, title } : t)));
  const deleteTask = (taskId) => setTaskTemplate(p => p.filter(t => t.id !== taskId));
  const reorderTasks = (start, end) => setTaskTemplate(p => { const r = Array.from(p); const [rm] = r.splice(start, 1); r.splice(end, 0, rm); return r; });
  const updateSyllabus = (id, title) => setSyllabi(p => p.map(s => (s.id === id ? { ...s, title } : s)));
  const deleteSyllabus = (id) => setSyllabi(p => p.filter(s => s.id !== id));
  const addSubject = (sId, title) => setSyllabi(p => p.map(s => (s.id === sId ? { ...s, subjects: [...s.subjects, { id: uuidv4(), title, chapters: [], color: subjectColors[Math.floor(Math.random()*subjectColors.length)] }] } : s)));
  const updateSubject = (sId, subId, title) => setSyllabi(p => p.map(s => (s.id === sId ? { ...s, subjects: s.subjects.map(sub => (sub.id === subId ? { ...sub, title } : sub)) } : s)));
  const deleteSubject = (sId, subId) => setSyllabi(p => p.map(s => (s.id === sId ? { ...s, subjects: s.subjects.filter(sub => sub.id !== subId) } : s)));
  const addChapter = (sId, subId, title) => setSyllabi(p => p.map(s => (s.id === sId ? { ...s, subjects: s.subjects.map(sub => (sub.id === subId ? { ...sub, chapters: [...sub.chapters, { id: uuidv4(), title, status: 'plan' }] } : sub)) } : s)));
  const updateChapter = (sId, subId, cId, title) => setSyllabi(p => p.map(s => (s.id === sId ? { ...s, subjects: s.subjects.map(sub => (sub.id === subId ? { ...sub, chapters: sub.chapters.map(c => (c.id === cId ? { ...c, title } : c)) } : sub)) } : s)));
  const updateChapterStatus = (sId, subId, cId, status) => setSyllabi(p => p.map(s => (s.id === sId ? { ...s, subjects: s.subjects.map(sub => (sub.id === subId ? { ...sub, chapters: sub.chapters.map(c => (c.id === cId ? { ...c, status } : c)) } : sub)) } : s)));
  const deleteChapter = (sId, subId, cId) => setSyllabi(p => p.map(s => (s.id === sId ? { ...s, subjects: s.subjects.map(sub => (sub.id === subId ? { ...sub, chapters: sub.chapters.filter(c => c.id !== cId) } : sub)) } : s)));
  const addNote = (title, content) => { const n = { id: uuidv4(), title: title || 'Untitled', content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isPinned: false, isArchived: false }; setNotes(p => [n, ...p]); return n.id; };
  const updateNote = (id, title, content) => setNotes(p => p.map(n => (n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n)));
  const deleteNote = (id) => setNotes(p => p.filter(n => n.id !== id));
  const togglePinNote = (id) => setNotes(p => p.map(n => (n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n)));
  const toggleArchiveNote = (id) => setNotes(p => p.map(n => (n.id === id ? { ...n, isArchived: !n.isArchived, updatedAt: new Date().toISOString() } : n)));
  const searchNotes = (query) => { if (!query.trim()) return notes; const q = query.toLowerCase(); return notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)); };
  const addResource = (title, url) => setResources(p => [...p, { id: uuidv4(), title, url }]);
  const deleteResource = (id) => setResources(p => p.filter(r => r.id !== id));
  const updatePomodoroSettings = (settings) => setPomodoroSettings(settings);
  const addPomodoroSession = () => { const t = format(new Date(), 'yyyy-MM-dd'); const m = pomodoroSettings.workDuration; setPomodoroSessions(p => { const e = p.find(s => s.date === t); if(e) return p.map(s => s.date === t ? { ...s, count: s.count + 1, totalMinutes: s.totalMinutes + m } : s); else return [...p, { date: t, count: 1, totalMinutes: m }]; }); };
  const getTotalStudyHours = () => { const m = pomodoroSessions.reduce((s, c) => s + c.totalMinutes, 0); if (m === 0) return '0hr00min'; const h = Math.floor(m / 60); const min = m % 60; return `${h}${h > 1 ? 'hrs' : 'hr'}${String(min).padStart(2, '0')}min`; };
  const getTotalTasksCompleted = () => taskCompletions.reduce((s, c) => s + c.completedCount, 0);
  const addExam = (title, date) => { const newExam = { id: uuidv4(), title, date }; setExams(p => { const i = p.findIndex(e => e.isPlaceholder); if (i !== -1) return [newExam]; else return [...p, newExam]; }); };
  const updateExam = (id, title, date) => setExams(p => p.map(e => (e.id === id ? { ...e, title, date } : e)));
  const deleteExam = (id) => setExams(p => p.filter(e => e.id !== id));

  const addSyllabus = (title: string): string => {
    const newSyllabus: Syllabus = { id: uuidv4(), title, subjects: [] };
    setSyllabi(prevSyllabi => {
      const placeholderIndex = prevSyllabi.findIndex(s => s.isPlaceholder);
      if (placeholderIndex !== -1) {
        return [newSyllabus];
      } else {
        return [...prevSyllabi, newSyllabus];
      }
    });
    return newSyllabus.id;
  };
  
  const value: StudyDataContextType = {
    dailyTasks, getTodayTasks, updateTaskCompletion, resetDailyTasks, addCustomTask, editTask, deleteTask, reorderTasks,
    syllabi, addSyllabus, updateSyllabus, deleteSyllabus,
    addSubject, updateSubject, deleteSubject,
    addChapter, updateChapter, updateChapterStatus, deleteChapter,
    notes, addNote, updateNote, deleteNote, searchNotes, togglePinNote, toggleArchiveNote,
    resources, addResource, deleteResource,
    pomodoroSettings, updatePomodoroSettings, pomodoroSessions, addPomodoroSession, getTotalStudyHours,
    taskCompletions, getTotalTasksCompleted,
    exams, addExam, updateExam, deleteExam,
  };

  return (
    <StudyDataContext.Provider value={value}>
      {children}
    </StudyDataContext.Provider>
  );
}

export function useStudyData() {
  const context = useContext(StudyDataContext);
  if (context === undefined) {
    throw new Error('useStudyData must be used within a StudyDataProvider');
  }
  return context;
}