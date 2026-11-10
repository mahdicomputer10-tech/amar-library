import { Book } from '../types/library';

const DB_NAME = 'offlineLibraryDB';
const DB_VERSION = 2;
const STORE_NAME = 'books';

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => {
      dbInstance = (e.target as IDBOpenDBRequest).result;
      // Request persistent storage if supported
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

const getStore = async (mode: IDBTransactionMode): Promise<IDBObjectStore> => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, mode);
  return tx.objectStore(STORE_NAME);
};

const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getBooksByOwner = async (owner: string): Promise<Book[]> => {
  const store = await getStore('readonly');
  const all = await requestToPromise<Book[]>(store.getAll());
  return all
    .filter((b) => b.owner === owner)
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
};

export const saveBookToDB = async (book: Book): Promise<void> => {
  const store = await getStore('readwrite');
  await requestToPromise(store.put(book));
};

export const deleteBookFromDB = async (id: string): Promise<void> => {
  const store = await getStore('readwrite');
  await requestToPromise(store.delete(id));
};

export const batchSaveBooks = async (books: Book[]): Promise<number> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    let count = 0;

    for (const b of books) {
      store.put(b);
      count++;
    }

    tx.oncomplete = () => resolve(count);
    tx.onerror = () => reject(tx.error);
  });
};

/**
 * Generates a valid multi-page PDF Blob for the demo / starter book
 */
export const createSamplePdfBlob = (): Blob => {
  // A minimal valid multi-page PDF structure with text in PDF 1.4 format
  const pdfString = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Resources << /Font << /F1 6 0 R >> >>
/Contents 7 0 R >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Resources << /Font << /F1 6 0 R >> >>
/Contents 8 0 R >>
endobj
5 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]
/Resources << /Font << /F1 6 0 R >> >>
/Contents 9 0 R >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
7 0 obj
<< /Length 285 >>
stream
BT
/F1 28 Tf
50 720 Td
(Bangla Offline Digital Library) Tj
/F1 16 Tf
0 -40 Td
(Welcome to your offline personal library!) Tj
/F1 12 Tf
0 -30 Td
(- Read your PDF books anytime without internet) Tj
0 -20 Td
(- Automatic bookmark and reading page tracker) Tj
0 -20 Td
(- Custom theme colors, Dark mode, and Backup) Tj
0 -40 Td
(Page 1 of 3 - Guide & Introduction) Tj
ET
endstream
endobj
8 0 obj
<< /Length 310 >>
stream
BT
/F1 24 Tf
50 720 Td
(Features & Keyboard Shortcuts) Tj
/F1 14 Tf
0 -40 Td
(1. Click 'Read' to open the built-in reader.) Tj
0 -25 Td
(2. Update your last-read page anytime.) Tj
0 -25 Td
(3. Keep personalized notes for every chapter.) Tj
0 -25 Td
(4. Export complete backup as JSON file.) Tj
0 -40 Td
(Page 2 of 3 - Reader Shortcuts) Tj
ET
endstream
endobj
9 0 obj
<< /Length 270 >>
stream
BT
/F1 24 Tf
50 720 Td
(Reading Notes & Quotes) Tj
/F1 13 Tf
0 -35 Td
("Boipora shokh ta shobcheye boro shokh." - Pramatha Chaudhuri) Tj
0 -30 Td
("Knowledge has no boundaries. Read every day.") Tj
0 -45 Td
(You have completed this starter book!) Tj
0 -25 Td
(Add your own Bangla & English PDFs now.) Tj
0 -40 Td
(Page 3 of 3 - Conclusion) Tj
ET
endstream
endobj
xref
0 10
0000000000 65535 f 
0000000015 00000 n 
0000000068 00000 n 
0000000147 00000 n 
0000000266 00000 n 
0000000385 00000 n 
0000000504 00000 n 
0000000583 00000 n 
0000000921 00000 n 
0000001284 00000 n 
trailer
<< /Size 10 /Root 1 0 R >>
startxref
1607
%%EOF`;

  return new Blob([pdfString], { type: 'application/pdf' });
};
