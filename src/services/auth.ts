import { UserAccount } from '../types/library';

const USERS_KEY = 'lib_users';
const SESSION_KEY = 'lib_session';

export const getUsers = (): Record<string, UserAccount> => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveUsers = (users: Record<string, UserAccount>): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const hashPassword = async (salt: string, pass: string): Promise<string> => {
  const str = salt + ':' + pass;
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      // Fallback below
    }
  }

  // Pure JS fallback hash
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
};

export const registerUser = async (username: string, pass: string): Promise<{ success: boolean; message: string }> => {
  const u = username.trim();
  if (!u) {
    return { success: false, message: 'ইউজারনেম লিখুন' };
  }
  if (!pass || pass.length < 4) {
    return { success: false, message: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' };
  }

  const users = getUsers();
  if (users[u]) {
    return { success: false, message: 'এই ইউজারনেম আগে থেকেই নিবন্ধিত আছে' };
  }

  const salt = Math.random().toString(36).slice(2) + Date.now();
  const hash = await hashPassword(salt, pass);

  users[u] = {
    username: u,
    salt,
    hash,
    createdAt: Date.now(),
  };

  saveUsers(users);
  return { success: true, message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! এবার লগইন করুন।' };
};

export const loginUser = async (username: string, pass: string): Promise<{ success: boolean; user?: string; message?: string }> => {
  const u = username.trim();
  const users = getUsers();
  const rec = users[u];

  if (!rec) {
    return { success: false, message: 'এই নামে কোনো অ্যাকাউন্ট পাওয়া যায়নি' };
  }

  const computedHash = await hashPassword(rec.salt, pass);
  if (computedHash !== rec.hash) {
    return { success: false, message: 'ভুল ইউজারনেম বা পাসওয়ার্ড' };
  }

  localStorage.setItem(SESSION_KEY, u);
  return { success: true, user: u };
};

export const quickGuestLogin = async (): Promise<string> => {
  const guestName = 'পাঠক (Guest)';
  const users = getUsers();
  if (!users[guestName]) {
    const salt = 'guest_salt_123';
    const hash = await hashPassword(salt, 'guest1234');
    users[guestName] = {
      username: guestName,
      salt,
      hash,
      createdAt: Date.now(),
    };
    saveUsers(users);
  }
  localStorage.setItem(SESSION_KEY, guestName);
  return guestName;
};

export const getSavedSession = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const logoutSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
};
