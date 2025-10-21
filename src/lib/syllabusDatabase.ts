// Syllabus Database Schema and Implementation

export interface ExamBoard {
  id: string;
  name: string;
  type: 'state' | 'central' | 'competitive' | 'professional';
  country: string;
  description: string;
}

export interface ExamPattern {
  id: string;
  board_id: string;
  name: string;
  class_level: string;
  duration_months: number;
  subjects: Subject[];
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits?: number;
  is_mandatory: boolean;
  chapters: Chapter[];
  color: string;
}

export interface Chapter {
  id: string;
  name: string;
  order: number;
  estimated_hours: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  subtopics: Subtopic[];
  learning_objectives: string[];
}

export interface Subtopic {
  id: string;
  name: string;
  order: number;
  estimated_hours: number;
  resources: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'book' | 'practice' | 'notes';
  url?: string;
  description?: string;
}

// Pre-coded Syllabus Database
export const EXAM_BOARDS: ExamBoard[] = [
  {
    id: 'cbse',
    name: 'Central Board of Secondary Education',
    type: 'central',
    country: 'India',
    description: 'National level board for secondary and senior secondary education'
  },
  {
    id: 'icse',
    name: 'Indian Certificate of Secondary Education',
    type: 'central',
    country: 'India',
    description: 'Private board focusing on comprehensive education'
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra State Board',
    type: 'state',
    country: 'India',
    description: 'State board for Maharashtra'
  },
  {
    id: 'karnataka',
    name: 'Karnataka State Board (PUC)',
    type: 'state',
    country: 'India',
    description: 'Pre-University Course board for Karnataka'
  },
  {
    id: 'jee',
    name: 'Joint Entrance Examination',
    type: 'competitive',
    country: 'India',
    description: 'Engineering entrance examination'
  },
  {
    id: 'neet',
    name: 'National Eligibility cum Entrance Test',
    type: 'competitive',
    country: 'India',
    description: 'Medical entrance examination'
  },
  {
    id: 'cat',
    name: 'Common Admission Test',
    type: 'competitive',
    country: 'India',
    description: 'MBA entrance examination'
  },
  {
    id: 'upsc',
    name: 'Union Public Service Commission',
    type: 'competitive',
    country: 'India',
    description: 'Civil services examination'
  }
];

// Sample Syllabus Data - CBSE Class 12 Science
export const CBSE_CLASS_12_SCIENCE: ExamPattern = {
  id: 'cbse-12-science',
  board_id: 'cbse',
  name: 'CBSE Class 12 Science',
  class_level: '12',
  duration_months: 12,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  subjects: [
    {
      id: 'physics-12',
      name: 'Physics',
      code: 'PHY',
      credits: 70,
      is_mandatory: true,
      color: '#3B82F6',
      chapters: [
        {
          id: 'electric-charges',
          name: 'Electric Charges and Fields',
          order: 1,
          estimated_hours: 15,
          difficulty_level: 'medium',
          learning_objectives: [
            'Understand electric charge and its properties',
            'Apply Coulomb\'s law',
            'Calculate electric field and potential'
          ],
          subtopics: [
            {
              id: 'electric-charge-properties',
              name: 'Properties of Electric Charge',
              order: 1,
              estimated_hours: 3,
              resources: [
                {
                  id: 'res-1',
                  title: 'Electric Charge Basics',
                  type: 'video',
                  description: 'Introduction to electric charge'
                }
              ]
            },
            {
              id: 'coulombs-law',
              name: 'Coulomb\'s Law',
              order: 2,
              estimated_hours: 4,
              resources: []
            },
            {
              id: 'electric-field',
              name: 'Electric Field',
              order: 3,
              estimated_hours: 4,
              resources: []
            },
            {
              id: 'electric-flux',
              name: 'Electric Flux and Gauss\'s Law',
              order: 4,
              estimated_hours: 4,
              resources: []
            }
          ]
        },
        {
          id: 'electrostatic-potential',
          name: 'Electrostatic Potential and Capacitance',
          order: 2,
          estimated_hours: 12,
          difficulty_level: 'hard',
          learning_objectives: [
            'Understand electrostatic potential',
            'Calculate capacitance',
            'Analyze capacitor combinations'
          ],
          subtopics: [
            {
              id: 'electrostatic-potential-energy',
              name: 'Electrostatic Potential Energy',
              order: 1,
              estimated_hours: 3,
              resources: []
            },
            {
              id: 'potential-due-to-point-charge',
              name: 'Potential due to Point Charge',
              order: 2,
              estimated_hours: 3,
              resources: []
            },
            {
              id: 'capacitors',
              name: 'Capacitors and Capacitance',
              order: 3,
              estimated_hours: 3,
              resources: []
            },
            {
              id: 'combination-of-capacitors',
              name: 'Combination of Capacitors',
              order: 4,
              estimated_hours: 3,
              resources: []
            }
          ]
        }
        // ... more chapters
      ]
    },
    {
      id: 'chemistry-12',
      name: 'Chemistry',
      code: 'CHE',
      credits: 70,
      is_mandatory: true,
      color: '#10B981',
      chapters: [
        {
          id: 'solid-state',
          name: 'The Solid State',
          order: 1,
          estimated_hours: 10,
          difficulty_level: 'medium',
          learning_objectives: [
            'Understand crystal lattices',
            'Classify solids',
            'Calculate packing efficiency'
          ],
          subtopics: [
            {
              id: 'classification-of-solids',
              name: 'Classification of Solids',
              order: 1,
              estimated_hours: 2,
              resources: []
            },
            {
              id: 'crystal-lattices',
              name: 'Crystal Lattices and Unit Cells',
              order: 2,
              estimated_hours: 3,
              resources: []
            },
            {
              id: 'packing-in-solids',
              name: 'Packing in Solids',
              order: 3,
              estimated_hours: 3,
              resources: []
            },
            {
              id: 'imperfections-in-solids',
              name: 'Imperfections in Solids',
              order: 4,
              estimated_hours: 2,
              resources: []
            }
          ]
        }
        // ... more chapters
      ]
    },
    {
      id: 'mathematics-12',
      name: 'Mathematics',
      code: 'MAT',
      credits: 100,
      is_mandatory: true,
      color: '#F59E0B',
      chapters: [
        {
          id: 'relations-functions',
          name: 'Relations and Functions',
          order: 1,
          estimated_hours: 20,
          difficulty_level: 'medium',
          learning_objectives: [
            'Understand types of relations',
            'Classify functions',
            'Perform function operations'
          ],
          subtopics: [
            {
              id: 'types-of-relations',
              name: 'Types of Relations',
              order: 1,
              estimated_hours: 5,
              resources: []
            },
            {
              id: 'types-of-functions',
              name: 'Types of Functions',
              order: 2,
              estimated_hours: 5,
              resources: []
            },
            {
              id: 'composition-of-functions',
              name: 'Composition of Functions',
              order: 3,
              estimated_hours: 5,
              resources: []
            },
            {
              id: 'inverse-functions',
              name: 'Inverse Functions',
              order: 4,
              estimated_hours: 5,
              resources: []
            }
          ]
        }
        // ... more chapters
      ]
    }
  ]
};

// JEE Main Syllabus
export const JEE_MAIN_SYLLABUS: ExamPattern = {
  id: 'jee-main',
  board_id: 'jee',
  name: 'JEE Main',
  class_level: 'Competitive',
  duration_months: 24,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  subjects: [
    {
      id: 'jee-physics',
      name: 'Physics',
      code: 'PHY',
      is_mandatory: true,
      color: '#3B82F6',
      chapters: [
        {
          id: 'mechanics',
          name: 'Mechanics',
          order: 1,
          estimated_hours: 40,
          difficulty_level: 'hard',
          learning_objectives: [
            'Master kinematics and dynamics',
            'Understand work, energy, and power',
            'Apply conservation laws'
          ],
          subtopics: [
            {
              id: 'kinematics',
              name: 'Kinematics',
              order: 1,
              estimated_hours: 10,
              resources: []
            },
            {
              id: 'laws-of-motion',
              name: 'Laws of Motion',
              order: 2,
              estimated_hours: 10,
              resources: []
            },
            {
              id: 'work-energy-power',
              name: 'Work, Energy and Power',
              order: 3,
              estimated_hours: 10,
              resources: []
            },
            {
              id: 'rotational-motion',
              name: 'Rotational Motion',
              order: 4,
              estimated_hours: 10,
              resources: []
            }
          ]
        }
        // ... more chapters
      ]
    }
    // ... more subjects
  ]
};

// Database Service Class
export class SyllabusDatabase {
  private static instance: SyllabusDatabase;
  private syllabusData: Map<string, ExamPattern> = new Map();

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): SyllabusDatabase {
    if (!SyllabusDatabase.instance) {
      SyllabusDatabase.instance = new SyllabusDatabase();
    }
    return SyllabusDatabase.instance;
  }

  private initializeDatabase() {
    // Load pre-coded syllabus data
    this.syllabusData.set('cbse-12-science', CBSE_CLASS_12_SCIENCE);
    this.syllabusData.set('jee-main', JEE_MAIN_SYLLABUS);
    
    // TODO: Add more syllabus patterns
    // this.syllabusData.set('neet', NEET_SYLLABUS);
    // this.syllabusData.set('cat', CAT_SYLLABUS);
    // this.syllabusData.set('upsc', UPSC_SYLLABUS);
  }

  // Get all available exam boards
  public getExamBoards(): ExamBoard[] {
    return EXAM_BOARDS;
  }

  // Get exam patterns by board
  public getExamPatternsByBoard(boardId: string): ExamPattern[] {
    return Array.from(this.syllabusData.values())
      .filter(pattern => pattern.board_id === boardId);
  }

  // Get specific syllabus by ID
  public getSyllabus(syllabusId: string): ExamPattern | null {
    return this.syllabusData.get(syllabusId) || null;
  }

  // Search syllabi
  public searchSyllabi(query: string): ExamPattern[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.syllabusData.values())
      .filter(pattern => 
        pattern.name.toLowerCase().includes(lowercaseQuery) ||
        pattern.subjects.some(subject => 
          subject.name.toLowerCase().includes(lowercaseQuery) ||
          subject.chapters.some(chapter => 
            chapter.name.toLowerCase().includes(lowercaseQuery)
          )
        )
      );
  }

  // Get syllabus statistics
  public getSyllabusStats(syllabusId: string) {
    const syllabus = this.getSyllabus(syllabusId);
    if (!syllabus) return null;

    const stats = {
      totalSubjects: syllabus.subjects.length,
      totalChapters: 0,
      totalSubtopics: 0,
      estimatedHours: 0,
      difficultyDistribution: { easy: 0, medium: 0, hard: 0 }
    };

    syllabus.subjects.forEach(subject => {
      stats.totalChapters += subject.chapters.length;
      
      subject.chapters.forEach(chapter => {
        stats.totalSubtopics += chapter.subtopics.length;
        stats.estimatedHours += chapter.estimated_hours;
        stats.difficultyDistribution[chapter.difficulty_level]++;
      });
    });

    return stats;
  }

  // Create custom syllabus based on template
  public createCustomSyllabus(templateId: string, customizations: any): ExamPattern {
    const template = this.getSyllabus(templateId);
    if (!template) throw new Error('Template not found');

    // Deep clone and customize
    const customSyllabus: ExamPattern = JSON.parse(JSON.stringify(template));
    customSyllabus.id = `custom-${Date.now()}`;
    customSyllabus.name = customizations.name || `Custom ${template.name}`;
    
    // Apply customizations
    if (customizations.subjects) {
      customSyllabus.subjects = customSyllabus.subjects.filter(
        subject => customizations.subjects.includes(subject.id)
      );
    }

    return customSyllabus;
  }
}

// Export singleton instance
export const syllabusDB = SyllabusDatabase.getInstance();