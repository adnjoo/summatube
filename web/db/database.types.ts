export type Video = {
  id: number;
  videoId: string; // YouTube video ID
  title: string | null;
};

export type Summary = {
  id: number;
  videoId: number;
  userId: string | null; // UUID
  content: string;
  version: number;
  created_at: string;
};

export type SummaryLike = {
  id: number;
  userId: string; // UUID
  summaryId: number;
  likedAt: string;
};
