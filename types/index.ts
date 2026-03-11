// ============================================
// CONTENT BLOCKS
// ============================================

export type ContentBlock =
  | TextBlock
  | TimelineBlock
  | BarChartBlock
  | ComparisonBlock
  | FlowchartBlock
  | VocabCardBlock
  | CalloutBlock
  | PieChartBlock
  | RelationshipBlock
  | ScaleBlock
  | FlashcardBlock
  | QuizBlock
  | ImageBlock;

export interface TextBlock {
  type: 'text';
  content: string;
  highlights?: string[];
}

export interface TimelineBlock {
  type: 'timeline';
  title?: string;
  events: {
    date: string;
    label: string;
    description?: string;
    importance?: 'high' | 'medium' | 'low';
  }[];
  orientation?: 'horizontal' | 'vertical';
}

export interface BarChartBlock {
  type: 'bar-chart';
  title?: string;
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  unit?: string;
  maxValue?: number;
}

export interface ComparisonBlock {
  type: 'comparison';
  title?: string;
  columns: string[];
  rows: {
    attribute: string;
    values: string[];
  }[];
}

export interface FlowchartBlock {
  type: 'flowchart';
  title?: string;
  steps: {
    id: string;
    label: string;
    description?: string;
    type?: 'start' | 'process' | 'decision' | 'end';
  }[];
  connections: {
    from: string;
    to: string;
    label?: string;
  }[];
}

export interface VocabCardBlock {
  type: 'vocab-card';
  term: string;
  lang: string;
  pronunciation?: string;
  romanization?: string;
  translation: string;
  partOfSpeech?: 'noun' | 'verb' | 'adj' | 'adv' | 'phrase';
  example?: {
    text: string;
    lang: string;
    translation: string;
  };
  audio?: string;
  ttsEnabled?: boolean;
}

export interface CalloutBlock {
  type: 'callout';
  style: 'quote' | 'definition' | 'key-point' | 'warning' | 'tip';
  content: string;
  attribution?: string;
  icon?: string;
}

export interface PieChartBlock {
  type: 'pie-chart';
  title?: string;
  data: {
    label: string;
    value: number;
    color?: string;
  }[];
  showPercentages?: boolean;
}

export interface RelationshipBlock {
  type: 'relationship';
  title?: string;
  nodes: {
    id: string;
    label: string;
    type?: 'primary' | 'secondary' | 'tertiary';
  }[];
  edges: {
    from: string;
    to: string;
    label?: string;
    style?: 'solid' | 'dashed';
  }[];
}

export interface ScaleBlock {
  type: 'scale';
  title?: string;
  leftLabel: string;
  rightLabel: string;
  markers: {
    position: number;
    label: string;
  }[];
}

export interface FlashcardBlock {
  type: 'flashcard';
  cards: {
    front: string;
    back: string;
    hint?: string;
  }[];
}

export interface QuizBlock {
  type: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ImageBlock {
  type: 'image';
  alt: string;
  caption?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  placeholder: 'gradient' | 'pattern' | 'icon';
}

// ============================================
// MODULE & LESSON
// ============================================

export interface ModuleOutline {
  framework: string;
  context: string;
  generationPrompt: string;
  parameters: Record<string, unknown>;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  type: 'full' | 'outline';
  outline?: ModuleOutline;
  tags: string[];
  parentModuleId?: string;
  createdAt: Date;
  updatedAt: Date;
  isTopLevel: boolean;
  metadata: {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedMinutes: number;
    category: string;
  };
  questions?: ModuleQuestion[];
}

export interface LessonContent {
  type: 'micro' | 'standard';
  blocks: ContentBlock[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  order: number;
  content: LessonContent;
  summary?: string;
  duration: number;
  createdAt: Date;
  isAIGenerated: boolean;
  generationLog?: GenerationLog;
}

export interface GenerationLog {
  id: string;
  lessonId: string;
  prompt: string;
  response: string;
  model: string;
  timestamp: Date;
  reviewStatus: 'pending' | 'approved' | 'edited' | 'rejected';
  edits?: string;
}

// ============================================
// ACTIVITY & PROGRESS
// ============================================

export interface ActivityEntry {
  id: string;
  date: string;
  moduleId: string;
  lessonId: string;
  topicTags: string[];
  duration: number;
  completionType: 'view' | 'complete' | 'review';
}

export interface UserProgress {
  moduleId: string;
  lessonsCompleted: string[];
  lastAccessedAt: Date;
  masteryScore: number;
  streakDays: number;
}

export interface TopicLink {
  id: string;
  sourceModuleId: string;
  targetModuleId: string;
  relationshipType: 'related' | 'prerequisite' | 'deepDive' | 'similar';
  strength: number;
  createdBy: 'user' | 'ai';
  concepts: string[];
}

// ============================================
// AI GENERATION
// ============================================

export interface GenerationContext {
  lessonTopic: string;
  previousLessons: string[];
  targetMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface GeneratedLesson {
  title: string;
  summary: string;
  blocks: ContentBlock[];
}

// ============================================
// SUGGESTIONS
// ============================================

export interface Suggestion {
  module: Module;
  reason: string;
  priority: number;
  estimatedTime: number;
}

// ============================================
// Q&A
// ============================================

export interface ModuleQuestion {
  id: string;
  question: string;
  answer: string;
  createdAt: Date;
}
