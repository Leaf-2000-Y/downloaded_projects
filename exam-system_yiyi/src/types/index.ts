export interface Question {
  id: string;
  type: 'mc' | 'fitb' | 'calc' | 'proof';
  text: string;
  options?: string[]; // for multiple choice
  answer: string;
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  chapter: string;
  grade?: string;
  sectionId?: string;
  isVerified?: boolean;
  svgDiagram?: string;
}

export interface ExamConfig {
  schoolName: string;
  title: string;
  grade: string;
  term: string;
  curriculum: string;
  timeLimit: number; // in minutes
  difficultyEasy: number; // percentage
  difficultyMedium: number; // percentage
  difficultyHard: number; // percentage
  mcCount: number;
  fitbCount: number;
  calcCount: number;
  selectedChapters?: string[];
  annotation?: string;
  logoBase64?: string;
  layoutTemplate?: 'standard' | 'minimal' | 'art';
}
