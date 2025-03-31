export interface MoodData {
  time: string;
  type: string;
  content: string;
  emotion: string;
  weather: string;
  location: string;
  tags: string[];
  imageUrls: string[];
  aiAnalysis?: string;
}

export interface EmotionTrend {
  dates: string[];
  values: number[];
}

export interface AISuggestion {
  content: string;
  type: string;
}

export interface EmotionInput {
  type: string;
  intensity: number;
  tags?: string[];
}

export interface CreateDiaryParams {
  content: string;
  weather?: string;
  location?: string;
  tags?: string[];
  imageUrls?: string[];
  emotion: EmotionInput;
}

export interface DiaryResponse {
  time: string;
  type: string;
  content: string;
  emotion: string;
  weather: string;
  location: string;
  tags: string[];
  imageUrls: string[];
  aiAnalysis?: string;
} 