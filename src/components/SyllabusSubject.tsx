import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Check, X, Trash2, Edit,
  ChevronDown, Book, Clock, CheckCircle
} from 'lucide-react';
import { Subject, useStudyData, Chapter } from '../contexts/StudyDataContext';

// ====================================================================================
// START: Helper Components (now contained within this file)
// ====================================================================================

interface TitlePopoverProps {
  title: string;
  position: { top: number; left: number };
  onClose: () => void;
}

/**
 * A popover that displays the full text of a truncated title.
 * It's rendered in a portal to appear above all other content.
 */
const TitlePopover: React.FC<TitlePopoverProps> = ({ title, position, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside the popover or 'Escape' key to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listeners after a short delay to prevent the opening click from closing it
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)', // Position it just above the title
      }}
      className="z-50 p-3 bg-gray-900 dark:bg-black text-white text-sm rounded-lg shadow-xl max-w-xs break-words"
    >
      {title}
    </motion.div>,
    document.body
  );
};


const RadialProgressBar: React.FC<{ progress: number; color: string }> = ({ progress, color }) => {
  const size = 50, stroke = 5;
  const center = size/2, r = center - stroke;
  const c = 2 * Math.PI * r;
  const offset = c - (progress/100)*c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={center} cy={center} r={r}
              fill="none" stroke="currentColor" strokeWidth={stroke}
              className="text-gray-200 dark:text-gray-700" />
      <motion.circle cx={center} cy={center} r={r}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  );
};


const StatusPopover: React.FC<{ chapter: Chapter; syllabusId: string; subjectId: string }> = ({
  chapter, syllabusId, subjectId
}) => {
  const { updateChapterStatus } = useStudyData();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top:0, left:0, width:0 });

  const statuses = [
    { id: 'plan',    label: 'Planned',    icon: <Book size={14}/> },
    { id: 'studying',label: 'Study',   icon: <Clock size={14}/> },
    { id: 'mastered',label: 'Mastered',  icon: <CheckCircle size={14}/> },
  ];
  const current = statuses.find(s=>s.id===chapter.status)!;
  const colors: Record<string,string> = {
    plan:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    studying: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
    mastered: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
  };

  const toggle = () => {
    if(btnRef.current){
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom+window.scrollY+6, left: r.left+window.scrollX, width: r.width });
    }
    setOpen(o=>!o);
  };

  const Menu = () => (
    <motion.div
      initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} exit={{opacity:0,y:-5}}
      transition={{duration:0.15}}
      style={{ position:'absolute', top:pos.top, left:pos.left, minWidth:pos.width }}
      className="z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-1"
    >
      {statuses.map(s=>(
        <button key={s.id}
          onClick={()=>{
            updateChapterStatus(syllabusId,subjectId,chapter.id,s.id);
            setOpen(false);
          }}
          className={`w-full text-left flex items-center space-x-2 p-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700/50 ${
            chapter.status===s.id?'font-semibold':''}`}
        >
          {s.icon}<span>{s.label}</span>
        </button>
      ))}
    </motion.div>
  );

  return <>
    <button
      ref={btnRef}
      onClick={toggle}
      className={`flex items-center justify-center space-x-1 w-20 h-6 text-xs font-medium rounded-full ${colors[chapter.status]}`}
    >
      {current.icon}<span>{current.label}</span>
    </button>
    {open && ReactDOM.createPortal(<Menu/>, document.body)}
  </>;
};

// ====================================================================================
// END: Helper Components
// ====================================================================================


const SyllabusSubject: React.FC<{ syllabus: Subject }> = ({ syllabus }) => {
  const {
    addSubject, deleteSubject,
    addChapter, deleteChapter,
    updateChapter, updateChapterStatus
  } = useStudyData();

  const [expanded, setExpanded] = useState<string[]>([]);
  const [addingSub, setAddingSub] = useState(false);
  const [newSub, setNewSub] = useState('');
  const [addingChapTo, setAddingChapTo] = useState<string|null>(null);
  const [newChap, setNewChap] = useState('');
  
  const [editing, setEditing] = useState<{ subId:string; chapId:string }|null>(null);
  const [editText, setEditText] = useState('');

  const [viewingTitle, setViewingTitle] = useState<{
    chapterId: string;
    fullTitle: string;
    position: { top: number; left: number };
  } | null>(null);

  const toggle = (id:string) =>
    setExpanded(e=> e.includes(id)?e.filter(x=>x!==id):[...e,id]);

  const startEdit = (subId:string, chap:Chapter) => {
    setEditing({ subId, chapId:chap.id });
    setEditText(chap.title);
  };

  const saveEdit = () => {
    if(editing && editText.trim()) {
      updateChapter(syllabus.id, editing.subId, editing.chapId, editText.trim());
      setEditing(null);
    }
  };

  const cancelEdit = () => setEditing(null);
  
  const handleTitleClick = (event: React.MouseEvent<HTMLSpanElement>, chapter: Chapter) => {
    const element = event.currentTarget;
    if (element.scrollWidth > element.clientWidth) {
      const rect = element.getBoundingClientRect();
      setViewingTitle({
        chapterId: chapter.id,
        fullTitle: chapter.title,
        position: {
          top: rect.top + window.scrollY - 8,
          left: rect.left + window.scrollX,
        },
      });
    }
  };
  
  return (
    <div className="space-y-6">
      {syllabus.subjects.map(subject=>{
        const isOpen = expanded.includes(subject.id);
        const masteredCount = subject.chapters.filter(c=>c.status==='mastered').length;
        const total = subject.chapters.length;
        const pct = total ? Math.round((masteredCount / total) * 100) : 0;

        return (
          <motion.div key={subject.id} layout
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
          >
            <div
              onClick={()=>toggle(subject.id)}
              className="flex items-center p-5 gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
              <div className="relative">
  <RadialProgressBar progress={pct} color={subject.color} />
  <div className="absolute inset-0 flex items-center justify-center font-bold text-sm" style={{ color: subject.color }}>
    {/* --- EDIT THIS PART --- */}
    {pct === 100 ? (
      <Check size={20} strokeWidth={3} />
    ) : (
      <>{Math.round(pct)}%</>
    )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{subject.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {total} chapters • {masteredCount} mastered
                </p>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={e=>{ e.stopPropagation(); deleteSubject(syllabus.id,subject.id); }}
                  whileTap={{scale:0.9}}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full"
                ><Trash2 size={18}/></motion.button>
                <motion.div animate={{ rotate: isOpen?180:0 }}>
                  <ChevronDown size={24} className="text-gray-400"/>
                </motion.div>
              </div>
            </div>

            <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{height:0, opacity:0}}
                animate={{height:'auto', opacity:1}}
                exit={{height:0, opacity:0}}
                className="px-5 pb-5 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4"
              >
                {subject.chapters.length===0 && !addingChapTo && (
                  <div className="text-center text-gray-500 py-4">No chapters yet.</div>
                )}

                {subject.chapters.map(chap => {
                  const isEditMode = editing?.subId === subject.id && editing.chapId === chap.id;
                  return (
                    <motion.div key={chap.id}
                      initial={{opacity:0,y:-5}} animate={{opacity:1,y:0}}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/60 rounded-lg"
                    >
                      {isEditMode ? (
                        <>
                          <input
                            className="input flex-grow min-w-0"
                            value={editText}
                            onChange={e=>setEditText(e.target.value)}
                            onKeyPress={e=>e.key==='Enter' && saveEdit()}
                            autoFocus
                          />
                          <div className="flex items-center gap-1">
                            <button onClick={saveEdit} className="p-2 rounded-md hover:bg-green-500/10 text-green-500"><Check size={16}/></button>
                            <button onClick={cancelEdit} className="p-2 rounded-md hover:bg-red-500/10 text-red-500"><X size={16}/></button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span 
                            className="flex-grow truncate min-w-0 cursor-pointer"
                            onClick={(e) => handleTitleClick(e, chap)}
                          >
                            {chap.title}
                          </span>
                          <StatusPopover chapter={chap} syllabusId={syllabus.id} subjectId={subject.id}/>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={()=>startEdit(subject.id,chap)}
                              className="p-2 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-500/10"
                            ><Edit size={16}/></button>
                            <button
                              onClick={()=>deleteChapter(syllabus.id,subject.id,chap.id)}
                              className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-500/10"
                            ><Trash2 size={16}/></button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  );
                })}

                {addingChapTo===subject.id ? (
                  <div className="flex items-center gap-2 mt-4">
                    <input
                      className="input flex-grow"
                      placeholder="New chapter title..."
                      value={newChap}
                      onChange={e=>setNewChap(e.target.value)}
                      onKeyPress={e=>{if(e.key==='Enter' && newChap.trim()){addChapter(syllabus.id,subject.id,newChap.trim()); setNewChap('');}}}
                      autoFocus
                    />
                    <button onClick={()=>{if(newChap.trim()){addChapter(syllabus.id,subject.id,newChap.trim()); setNewChap('');}}} className="btn-primary p-2"><Check/></button>
                    <button onClick={()=>{setAddingChapTo(null); setNewChap('');}} className="btn-outline p-2"><X/></button>
                  </div>
                ) : (
                  <button
                    onClick={()=>{setAddingChapTo(subject.id);}}
                    className="w-full text-center p-3 mt-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >+ Add Chapter</button>
                )}
              </motion.div>
            )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {addingSub ? (
        <motion.div layout className="bg-white dark:bg-gray-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-lg font-bold">Add New Subject</h3>
          <input
            className="input w-full"
            placeholder="e.g. Corporate Finance"
            value={newSub}
            onChange={e=>setNewSub(e.target.value)}
            onKeyPress={e=>{if(e.key==='Enter' && newSub.trim()){addSubject(syllabus.id,newSub.trim()); setAddingSub(false); setNewSub('');}}}
            autoFocus
          />
          <div className="flex gap-3">
            <button onClick={()=>{if(newSub.trim()){addSubject(syllabus.id,newSub.trim()); setAddingSub(false); setNewSub('');}}} className="btn-primary flex-grow">Save Subject</button>
            <button onClick={()=>setAddingSub(false)} className="btn-outline">Cancel</button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={()=>setAddingSub(true)}
          className="w-full flex items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 hover:text-primary hover:border-primary transition-colors"
        >
          <Plus size={24}/><span className="ml-3 font-bold">Add Subject</span>
        </button>
      )}

      <AnimatePresence>
        {viewingTitle && (
          <TitlePopover
            title={viewingTitle.fullTitle}
            position={viewingTitle.position}
            onClose={() => setViewingTitle(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SyllabusSubject;