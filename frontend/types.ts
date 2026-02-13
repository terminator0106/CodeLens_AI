export interface User {
  id: string;
  email: string;
  avatarUrl?: string;
  profile_image_url?: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  url: string;
  language: string;
  status: 'indexed' | 'processing' | 'error';
  fileCount: number;
  lastUpdated: string;
  branch: string;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: string;
  fileId?: number;
  filePath?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface AnalyticsData {
  tokensUsed: number;
  filesIndexed: number;
  compressionRatio: number;
  repoSizeMB: number;
}

export interface DashboardOverview {
  total_repos: number;
  total_files: number;
  total_chunks: number;
  last_ingestion_time: string | null;
}

export interface AnalyticsUsage {
  totalRepos: number;
  totalFiles: number;
  totalChunks: number;
  avgQueryLatencyMs: number;
  tokenUsage: number;
}
