export type Language = 'en' | 'zh-TW';

export interface Theme {
  name: string;
  primary: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
}

export interface ApiKeys {
  gemini: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  content: string; // Text content or base64 for images
  timestamp: string;
  base64?: string; // For original file data
}

export interface OCRResult {
  docId: string;
  text: string;
  page: number;
}

export interface SmartNote {
  id: string;
  timestamp: string;
  originalText: string;
  formattedText: string;
  entities: string; // Markdown table
  mindGraph: any; // JSON object for graph
  keywords: string[];
  questions: string;
}

export interface MindGraphNode {
  id: string;
  label: string;
  val: number; // size
}

export interface MindGraphLink {
  source: string;
  target: string;
  value: number; // thickness
}

export interface MindGraphData {
  nodes: MindGraphNode[];
  links: MindGraphLink[];
}
