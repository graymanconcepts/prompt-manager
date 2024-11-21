export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  created: string;
  lastModified: string;
  isActive: boolean;
  historyId?: string;  // ID of the associated upload history entry, if any
  historyIsActive?: boolean;
  rating?: number;
  isFavorite: boolean;
  ratingCount: number;
}

export interface UploadHistory {
  id: string;
  fileName: string;
  uploadDate: string;
  status: 'success' | 'error';
  isActive: boolean;
  promptCount: number;
  errorMessage: string | null;
}

export interface RatingAnalytics {
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  favoriteCount: number;
  mostRatedPrompts: Prompt[];
}

export interface QualityMetrics {
  activeCorrelations: {
    category: string;
    metrics: {
      avgTags: number;
      activePercentage: number;
      promptCount: number;
    };
  }[];
  sourceCharacteristics: {
    source: string;
    metrics: {
      avgLength: number;
      avgTags: number;
      activePercentage: number;
      promptCount: number;
    };
  }[];
  ratingAnalytics: RatingAnalytics;
}