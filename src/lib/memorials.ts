import { CivilDate, addDays, dayNumber, lunarMonthLength, lunarToSolar, solarToLunar, MAX_YEAR, isValidDate } from './calendar';

export type MemorialPlan = { menu: string; guests: string; calls: string; budget: number; tasks: { label: string; done: boolean }[]; expenses: { label: string; amount: number }[] };
export type Memorial = {
  id: string; name: string; relation: string; day: number; month: number;
  leapPolicy: 'regular' | 'prefer-leap'; shortMonthPolicy: 'last-day' | 'next-day'; note: string;
  createdAt: string; plans?: Record<string, MemorialPlan>;
};
export type Occurrence = { date: CivilDate; days: number; adjusted: boolean; leap: boolean; lunarYear: number };
export function validPlan(p: unknown): p is MemorialPlan {
  if (!p || typeof p !== 'object') return false;
  const v = p as MemorialPlan;
  return [v.menu, v.guests, v.calls].every(t => typeof t === 'string' && t.length <= 5000) && Number.isFinite(v.budget) && v.budget >= 0 && v.budget <= 1e12 && Array.isArray(v.tasks) && v.tasks.length <= 100 && v.tasks.every(t => t && typeof t.label === 'string' && t.label.length > 0 && t.label.length <= 200 && typeof t.done === 'boolean') && Array.isArray(v.expenses) && v.expenses.length <= 100 && v.expenses.every(e => e && typeof e.label === 'string' && e.label.length > 0 && e.label.length <= 200 && Number.isFinite(e.amount) && e.amount >= 0 && e.amount <= 1e12);
}
export function validateMemorial(value: unknown): value is Memorial {
  if (!value || typeof value !== 'object') return false;
  const v = value as Memorial;
  return typeof v.id === 'string' && v.id.length > 0 && v.id.length <= 100 && typeof v.name === 'string' && v.name.trim().length > 0 && v.name.length <= 120 &&
    typeof v.relation === 'string' && v.relation.length <= 80 && Number.isInteger(v.day) && v.day >= 1 && v.day <= 30 && Number.isInteger(v.month) && v.month >= 1 && v.month <= 12 &&
    ['regular', 'prefer-leap'].includes(v.leapPolicy) && ['last-day', 'next-day'].includes(v.shortMonthPolicy) && typeof v.note === 'string' && v.note.length <= 2000 && typeof v.createdAt === 'string' && !Number.isNaN(Date.parse(v.createdAt)) && (v.plans === undefined || (v.plans !== null && typeof v.plans === 'object' && !Array.isArray(v.plans) && Object.entries(v.plans).every(([key, plan]) => /^\d{4}$/.test(key) && +key >= 1900 && +key <= 2100 && validPlan(plan))));
}
export function nextOccurrence(m: Memorial, from: CivilDate): Occurrence | null {
  const year = solarToLunar(from).year;
  for (let y = year; y <= Math.min(year + 2, MAX_YEAR); y++) {
    const leap = m.leapPolicy === 'prefer-leap' && lunarMonthLength(m.month, y, true) !== null;
    const length = lunarMonthLength(m.month, y, leap);
    if (!length) continue;
    const adjusted = m.day > length;
    let date = lunarToSolar({ day: Math.min(m.day, length), month: m.month, year: y, leap });
    if (!date) continue;
    if (adjusted && m.shortMonthPolicy === 'next-day') date = addDays(date, 1);
    if (!isValidDate(date)) continue;
    const days = dayNumber(date) - dayNumber(from);
    if (days >= 0) return { date, days, adjusted, leap, lunarYear: y };
  }
  return null;
}
export function decodeBackup(text: string): Memorial[] {
  if (text.length > 2_000_000) throw new Error('Tệp sao lưu quá lớn.');
  const data = JSON.parse(text);
  if (data.app !== 'lich-am-duong' || data.version !== 1 || !Array.isArray(data.memorials) || data.memorials.length > 1000 || !data.memorials.every(validateMemorial)) throw new Error('Bản sao lưu không đúng định dạng Lịch Âm Dương.');
  const ids = new Set(data.memorials.map((m: Memorial) => m.id));
  if (ids.size !== data.memorials.length) throw new Error('Bản sao lưu có mã ngày giỗ bị trùng.');
  return data.memorials;
}
export const encodeBackup = (memorials: Memorial[]) => JSON.stringify({ app: 'lich-am-duong', version: 1, exportedAt: new Date().toISOString(), memorials }, null, 2);
