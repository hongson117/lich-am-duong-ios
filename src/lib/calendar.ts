import rows from '../data/lunar-months.json';

export type CivilDate = { day: number; month: number; year: number };
export type LunarDate = CivilDate & { leap: boolean };
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
const DAY = 86400000;
export const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
export const BRANCHES = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
export const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
export const mod = (a: number, n: number) => ((a % n) + n) % n;
export const dayNumber = (d: CivilDate) => Math.floor(Date.UTC(d.year, d.month - 1, d.day) / DAY);
export function fromDay(n: number): CivilDate {
  const date = new Date(n * DAY);
  return { day: date.getUTCDate(), month: date.getUTCMonth() + 1, year: date.getUTCFullYear() };
}
export const todayVietnam = (now = new Date()) => fromDay(Math.floor((now.getTime() + 7 * 3600000) / DAY));
export const addDays = (d: CivilDate, n: number) => fromDay(dayNumber(d) + n);
export const dateKey = (d: CivilDate) => `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
export const formatDate = (d: CivilDate) => `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
export const weekday = (d: CivilDate) => mod(dayNumber(d) + 4, 7);
export const monthLength = (m: number, y: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export function isValidDate(d: CivilDate) {
  return [d.day, d.month, d.year].every(Number.isInteger) && d.year >= MIN_YEAR && d.year <= MAX_YEAR && d.month >= 1 && d.month <= 12 && d.day >= 1 && d.day <= monthLength(d.month, d.year);
}
export function parseDate(s: string): CivilDate | null {
  const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(s.trim());
  if (!match) return null;
  const date = { day: +match[1], month: +match[2], year: +match[3] };
  return isValidDate(date) ? date : null;
}
export function solarToLunar(date: CivilDate): LunarDate {
  if (!isValidDate(date)) throw new Error('Ngày dương lịch không hợp lệ (1900–2100).');
  const n = dayNumber(date);
  let lo = 0, hi = rows.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (rows[mid][0] <= n) lo = mid; else hi = mid - 1;
  }
  const [start, month, year, leap] = rows[lo];
  return { day: n - start + 1, month, year, leap: leap === 1 };
}
export function lunarMonthLength(month: number, year: number, leap = false): number | null {
  const i = rows.findIndex(r => r[1] === month && r[2] === year && r[3] === Number(leap));
  return i >= 0 && i < rows.length - 1 ? rows[i + 1][0] - rows[i][0] : null;
}
export function lunarToSolar(lunar: LunarDate): CivilDate | null {
  if (![lunar.day, lunar.month, lunar.year].every(Number.isInteger)) return null;
  const i = rows.findIndex(r => r[1] === lunar.month && r[2] === lunar.year && r[3] === Number(lunar.leap));
  if (i < 0 || i >= rows.length - 1 || lunar.day < 1 || lunar.day > rows[i + 1][0] - rows[i][0]) return null;
  const date = fromDay(rows[i][0] + lunar.day - 1);
  return isValidDate(date) ? date : null;
}
export function canChiYear(y: number) { return `${STEMS[mod(y + 6, 10)]} ${BRANCHES[mod(y + 8, 12)]}`; }
export function canChiDay(d: CivilDate) {
  const jd = dayNumber(d) + 2440588;
  return `${STEMS[mod(jd + 9, 10)]} ${BRANCHES[mod(jd + 1, 12)]}`;
}
export function canChiMonth(l: LunarDate) { return `${STEMS[mod(l.year * 12 + l.month + 3, 10)]} ${BRANCHES[mod(l.month + 1, 12)]}`; }
export function monthGrid(month: number, year: number) {
  const start = dayNumber({ day: 1, month, year });
  const offset = mod(weekday({ day: 1, month, year }) + 6, 7);
  return Array.from({ length: 42 }, (_, i) => fromDay(start - offset + i));
}
export function moveMonth(d: CivilDate, delta: number): CivilDate {
  const date = new Date(Date.UTC(d.year, d.month - 1 + delta, 1));
  const year = date.getUTCFullYear(), month = date.getUTCMonth() + 1;
  return { day: Math.min(d.day, monthLength(month, year)), month, year };
}
