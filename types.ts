
// Fix: Use enum for Platform to allow value-level usage (e.g., Object.values)
export enum Platform {
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin'
}

export interface Post {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // Drive URL or local file
  platforms: Platform[];
  status: 'Scheduled' | 'Posted' | 'Failed' | 'Draft';
  scheduledTime: string;
  notes?: string;
  createdAt: string;
}

export interface UploadPostConfig {
  apiKey: string;
  userId: string;
}

export interface AICaptionResponse {
  caption: string;
  hashtags: string[];
  engagement_tip: string;
}

// Fix: Added missing interface for Composer suggestions
export interface AICaptionSuggestion {
  tone: string;
  text: string;
  hashtags: string[];
}

// Fix: Added missing interface for Accounts management
export interface SocialAccount {
  id: string;
  username: string;
  platform: Platform;
  avatar: string;
  connected: boolean;
}
