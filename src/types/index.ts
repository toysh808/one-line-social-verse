
export interface Line {
  id: string;
  text: string;
  author: string;
  authorId: string;
  likes: number;
  timestamp: Date;
  isLiked: boolean;
  isBookmarked: boolean;
  theme?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  isPremium: boolean;
}

export interface Profile {
  id: string;
  username: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}
