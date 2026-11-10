import { Book, UserSettings, BackupPayload } from '../types/library';
import { saveBookToDB } from './db';

export const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const dataURLToBlob = (dataURL: string): Blob => {
  const parts = dataURL.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
  const bin = atob(parts[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
};

export const exportLibraryBackup = async (
  books: Book[],
  settings: UserSettings,
  user: string,
  onProgress?: (percent: number, current: number, total: number) => void
): Promise<void> => {
  if (!books.length) {
    throw new Error('ব্যাকআপ নেওয়ার মতো কোনো বই নেই');
  }

  const payload: BackupPayload = {
    app: 'offline-library',
    version: 2,
    exportedAt: new Date().toISOString(),
    settings,
    books: [],
  };

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    const { blob, ...rest } = b;
    const data = await blobToDataURL(blob);
    payload.books.push({
      ...rest,
      data,
    });
    if (onProgress) {
      onProgress(Math.round(((i + 1) / books.length) * 100), i + 1, books.length);
    }
  }

  const jsonStr = JSON.stringify(payload);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeUser = user.replace(/[^a-zA-Z0-9_\u0980-\u09FF]/g, '_');
  a.download = `library-backup-${safeUser}-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export const importLibraryBackup = async (
  file: File,
  currentUser: string,
  onProgress?: (percent: number, current: number, total: number) => void
): Promise<{ count: number; settings?: Partial<UserSettings> }> => {
  const text = await file.text();
  const payload: BackupPayload = JSON.parse(text);

  if (payload.app !== 'offline-library' || !Array.isArray(payload.books)) {
    throw new Error('অকার্যকর ব্যাকআপ ফাইল। ফাইলটি এই লাইব্রেরি অ্যাপের তৈরি নয়।');
  }

  let count = 0;
  const total = payload.books.length;

  for (let i = 0; i < total; i++) {
    const rawBook = payload.books[i];
    const blob = dataURLToBlob(rawBook.data);
    const { data, ...rest } = rawBook;

    const book: Book = {
      ...rest,
      owner: currentUser,
      blob,
      id: rest.id || Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      addedAt: rest.addedAt || Date.now(),
      lastPage: rest.lastPage || 0,
      note: rest.note || '',
    };

    await saveBookToDB(book);
    count++;
    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100), i + 1, total);
    }
  }

  return {
    count,
    settings: payload.settings,
  };
};
