import original from '../data/tao-chapters-original.json';
import editorial from '../data/tao-chapters-editorial.json';
import { Memorial, validateMemorial } from './memorials';

export const chapters = original.map((c, i) => ({ ...c, ...editorial[i] }));
export type Chapter = typeof chapters[number];
export type ReminderSettings = { memorials: boolean; lunarDays: boolean; when: 'morning' | 'evening-before' };
export type PersonalData = { favorites: number[]; notes: Record<string, string>; reminders: ReminderSettings };
export const EMPTY_PERSONAL: PersonalData = { favorites: [], notes: {}, reminders: { memorials: false, lunarDays: false, when: 'morning' } };
export function backupBytes(text: string) { let bytes = 0; for (const ch of text) { const n = ch.codePointAt(0)!; bytes += n <= 0x7f ? 1 : n <= 0x7ff ? 2 : n <= 0xffff ? 3 : 4; } return bytes; }
export const normalizeSearch = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
export function searchChapters(search: string, topic: string, favorites: boolean, personal: PersonalData) {
  const key = normalizeSearch(search.trim());
  return chapters.filter(c => (!favorites || personal.favorites.includes(c.chapter)) && (!topic || c.topic === topic) && (!key || normalizeSearch(`${c.chapter} ${c.title} ${c.topic} ${c.meaning}`).includes(key)));
}
export function validatePersonal(v: unknown): v is PersonalData {
  if (!v || typeof v !== 'object') return false;
  const p = v as PersonalData;
  return Array.isArray(p.favorites) && p.favorites.length <= 81 && p.favorites.every(n => Number.isInteger(n) && n >= 1 && n <= 81) && new Set(p.favorites).size === p.favorites.length &&
    !!p.notes && typeof p.notes === 'object' && !Array.isArray(p.notes) && Object.entries(p.notes).every(([k, value]) => /^([1-9]|[1-7][0-9]|8[01])$/.test(k) && typeof value === 'string' && value.length <= 10000) &&
    !!p.reminders && typeof p.reminders.memorials === 'boolean' && typeof p.reminders.lunarDays === 'boolean' && ['morning', 'evening-before'].includes(p.reminders.when);
}
export function encodeFullBackup(memorials: Memorial[], personal: PersonalData) { return JSON.stringify({ app: 'lich-am-duong', version: 2, exportedAt: new Date().toISOString(), memorials, personal }, null, 2); }
export function decodeFullBackup(text: string): { memorials: Memorial[]; personal: PersonalData } {
  if (backupBytes(text) > 2_000_000) throw new Error('Tệp sao lưu quá lớn.');
  const d = JSON.parse(text);
  if (d.app !== 'lich-am-duong' || ![1, 2].includes(d.version) || !Array.isArray(d.memorials) || d.memorials.length > 1000 || !d.memorials.every(validateMemorial) || new Set(d.memorials.map((m: Memorial) => m.id)).size !== d.memorials.length) throw new Error('Tệp sao lưu không hợp lệ.');
  const personal = d.version === 1 ? EMPTY_PERSONAL : d.personal;
  if (!validatePersonal(personal)) throw new Error('Ghi chú hoặc cài đặt trong tệp không hợp lệ.');
  return { memorials: d.memorials, personal };
}
