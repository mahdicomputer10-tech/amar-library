export interface Book {
  id: string;
  owner: string;
  title: string;
  category: string;
  cover?: string; // Base64 data URL or empty
  lastPage: number;
  totalPages?: number;
  status?: 'reading' | 'completed' | 'want_to_read' | 'unread';
  rating?: number; // 1-5
  favorite?: boolean;
  note: string;
  fileName: string;
  size: number;
  addedAt: number;
  lastReadAt?: number;
  blob: Blob | File;
}

export interface UserSettings {
  name: string;
  color: string;
  dark: boolean;
  viewMode: 'grid' | 'compact' | 'list';
  sortBy: 'recent' | 'lastRead' | 'title' | 'page' | 'size';
  sortOrder: 'asc' | 'desc';
}

export interface UserAccount {
  username: string;
  salt: string;
  hash: string;
  createdAt: number;
}

export interface BackupPayload {
  app: 'offline-library';
  version: number;
  exportedAt: string;
  settings?: Partial<UserSettings>;
  books: Array<Omit<Book, 'blob'> & { data: string }>;
}
