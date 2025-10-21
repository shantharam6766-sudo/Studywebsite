import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, ArrowLeft, Trash2, Pin, Archive, ArchiveRestore } from 'lucide-react';
import { useStudyData } from '../contexts/StudyDataContext';
import { format, isToday, isThisWeek } from 'date-fns';

type SavingStatus = 'idle' | 'saving' | 'saved';

const Notes: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, togglePinNote, toggleArchiveNote } = useStudyData();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isViewingArchive, setIsViewingArchive] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');
  const [savingStatus, setSavingStatus] = useState<SavingStatus>('idle');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);

  const filteredNotes = useMemo(() => {
    const baseNotes = notes.filter(note => isViewingArchive ? note.isArchived : !note.isArchived);
    const sortedNotes = [...baseNotes].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    if (!searchQuery) return sortedNotes;
    const lowercasedQuery = searchQuery.toLowerCase();
    return sortedNotes.filter(note => note.title.toLowerCase().includes(lowercasedQuery) || note.content.toLowerCase().includes(lowercasedQuery));
  }, [searchQuery, notes, isViewingArchive]);

  const activeNote = useMemo(() => notes.find(note => note.id === activeNoteId), [activeNoteId, notes]);

  useEffect(() => {
    if (activeNote) {
      setEditingTitle(activeNote.title);
      setEditingContent(activeNote.content);
      setSavingStatus('idle');
    }
  }, [activeNote]);

  useEffect(() => {
    if (activeNoteId && activeNote && (editingTitle !== activeNote.title || editingContent !== activeNote.content)) {
      setSavingStatus('saving');
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        updateNote(activeNoteId, editingTitle, editingContent);
        setSavingStatus('saved');
        setTimeout(() => setSavingStatus('idle'), 2000);
      }, 750);
    }
    return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
  }, [editingTitle, editingContent, activeNoteId, activeNote, updateNote]);

  const handleCreateNote = () => {
    const newNoteId = addNote('Untitled Note', '');
    setIsViewingArchive(false);
    setActiveNoteId(newNoteId);
  };

  const handleTogglePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(activeNoteId) togglePinNote(activeNoteId);
  }

  const handleToggleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if(activeNoteId) {
        toggleArchiveNote(activeNoteId);
        setActiveNoteId(null);
    }
  }

  // --- MODIFIED: The window.confirm check has been removed ---
  const handleDeleteNote = (e: React.MouseEvent) => {
    e.stopPropagation();
    // The note will be deleted immediately upon click.
    if (activeNoteId) {
      deleteNote(activeNoteId);
      setActiveNoteId(null);
    }
  };

  const handleContentKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const { value, selectionStart } = e.currentTarget;
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = value.substring(lineStart, selectionStart);
      const numberedListMatch = currentLine.match(/^(\d+)\.\s*/);
      if (numberedListMatch) {
        e.preventDefault();
        const number = parseInt(numberedListMatch[1], 10);
        const newText = `\n${number + 1}. `;
        setEditingContent(value.slice(0, selectionStart) + newText + value.slice(selectionStart));
        setTimeout(() => { if(contentInputRef.current) contentInputRef.current.selectionStart = contentInputRef.current.selectionEnd = selectionStart + newText.length; }, 0);
        return;
      }
      const bulletListMatch = currentLine.match(/^([*-])\s*/);
      if (bulletListMatch) {
        e.preventDefault();
        const bullet = bulletListMatch[1];
        const newText = `\n${bullet} `;
        setEditingContent(value.slice(0, selectionStart) + newText + value.slice(selectionStart));
        setTimeout(() => { if(contentInputRef.current) contentInputRef.current.selectionStart = contentInputRef.current.selectionEnd = selectionStart + newText.length; }, 0);
      }
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isThisWeek(date)) return format(date, 'eee');
    return format(date, 'MMM d, yyyy');
  };

  const pageVariants = { initial: { opacity: 0, x: 300 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: -300 } };
  const pageTransition = { type: 'tween', ease: 'anticipate', duration: 0.4 };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 relative h-[calc(100vh-8rem)] overflow-hidden">
      <AnimatePresence mode="wait">
        {activeNoteId && activeNote ? (
          <motion.div key="editor" initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition} className="absolute inset-0 flex flex-col bg-white dark:bg-gray-800">
            <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setActiveNoteId(null)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <ArrowLeft size={22} />
              </motion.button>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleTogglePin} title={activeNote.isPinned ? "Unpin" : "Pin"} className={`p-2 rounded-full hover:bg-yellow-500/10 ${activeNote.isPinned ? 'text-yellow-500' : 'text-gray-500'}`}>
                    <Pin size={20} />
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleToggleArchive} title={activeNote.isArchived ? 'Unarchive' : 'Archive'} className="p-2 rounded-full hover:bg-blue-500/10 text-gray-500 hover:text-blue-500">
                    {activeNote.isArchived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleDeleteNote} title="Delete" className="p-2 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-500">
                    <Trash2 size={20} />
                </motion.button>
              </div>
            </header>
            <div className="flex-grow p-6 flex flex-col min-h-0">
              <input ref={titleInputRef} type="text" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} placeholder="Title" className="text-3xl font-bold bg-transparent outline-none w-full mb-4 text-gray-900 dark:text-gray-100 flex-shrink-0" />
              <textarea ref={contentInputRef} onKeyDown={handleContentKeyDown} value={editingContent} onChange={(e) => setEditingContent(e.target.value)} placeholder="Start writing..." className="flex-grow w-full h-full bg-transparent text-gray-700 dark:text-gray-300 resize-none outline-none text-base leading-relaxed" />
            </div>
            <footer className="p-4 flex-shrink-0 text-center text-xs text-gray-400 dark:text-gray-500">
                {savingStatus === 'saving' && "Saving..."}
                {savingStatus === 'saved' && "Saved"}
                {savingStatus === 'idle' && `Last updated ${formatDate(activeNote.updatedAt)}`}
            </footer>
          </motion.div>
        ) : (
        <motion.div key="grid" initial="initial" animate="in" exit="out" variants={{ initial: { opacity: 0, x: -300 }, in: { opacity: 1, x: 0 }, out: { opacity: 0, x: 300 } }} transition={pageTransition} className="absolute inset-0 flex flex-col">
          <header className="flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-4xl font-heading font-bold">{isViewingArchive ? 'Archived Notes' : 'Notes'}</h1>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setIsViewingArchive(!isViewingArchive)} className="btn-secondary flex items-center gap-2">
                    {isViewingArchive ? <ArrowLeft size={16}/> : <Archive size={16} />}
                    {isViewingArchive ? 'Back to Notes' : 'View Archive'}
                </motion.button>
            </div>
            <div className="relative mb-6">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={isViewingArchive ? "Search archive..." : "Search notes..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input w-full pl-12 pr-4"/>
            </div>
          </header>
          <div className="flex-grow overflow-y-auto pb-24">
            {filteredNotes.length > 0 ? (
                <div className="notes-grid">
                    {filteredNotes.map(note => (
                        <motion.div key={note.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={() => setActiveNoteId(note.id)} className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer break-inside-avoid hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
                            {note.isPinned && <Pin size={14} className="text-yellow-500 mb-2" />}
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">{note.title || 'Untitled Note'}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-6">{note.content}</p>
                        </motion.div>
                    ))}
                </div>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <FileText size={48} className="mx-auto mb-4" />
                <p>{searchQuery ? 'No notes found for your search.' : (isViewingArchive ? 'Your archived notes will appear here.' : 'Your notes will appear here.')}</p>
              </div>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!activeNoteId && !isViewingArchive && (
          <motion.button initial={{ scale: 0, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, y: 100 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} whileHover={{ scale: 1.1 }} onClick={handleCreateNote} className="btn-primary rounded-full w-16 h-16 fixed bottom-8 right-8 shadow-lg flex items-center justify-center">
            <Plus size={32} />
          </motion.button>
        )}
      </AnimatePresence>
      <style>{`.notes-grid { column-count: 2; column-gap: 1rem; } .notes-grid > div { margin-bottom: 1rem; } @media (min-width: 768px) { .notes-grid { column-count: 3; } } @media (min-width: 1024px) { .notes-grid { column-count: 4; } }`}</style>
    </div>
  );
};

export default Notes;