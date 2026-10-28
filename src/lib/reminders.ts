import { addDays, CivilDate, dateKey, dayNumber, formatDate, isValidDate, solarToLunar, todayVietnam } from './calendar';
import { Memorial, nextOccurrence } from './memorials';
import { ReminderSettings } from './personal';
export type Reminder = { id: string; at: number; title: string; body: string; route: 'memorials' | 'today' };
export function reminderPlan(memorials: Memorial[], settings: ReminderSettings, now = new Date()): Reminder[] {
  const today = todayVietnam(now), events: Reminder[] = [];
  const add = (d: CivilDate, id: string, title: string, body: string, route: Reminder['route']) => {
    const at = (dayNumber(d) - (settings.when === 'evening-before' ? 1 : 0)) * 86400000 + ((settings.when === 'morning' ? 7 : 18) - 7) * 3600000;
    if (at > now.getTime()) events.push({ id: `lad-${id}-${dateKey(d)}`, at, title, body, route });
  };
  if (settings.lunarDays) for (let i = 0; i < 400; i++) { const date = addDays(today, i); if (!isValidDate(date)) break; const lunar = solarToLunar(date); if ([1, 15].includes(lunar.day)) add(date, 'lunar', lunar.day === 1 ? 'Nhắc ngày Mùng 1' : 'Nhắc ngày Rằm', `${lunar.day}/${lunar.month}${lunar.leap ? ' nhuận' : ''} âm lịch · ${formatDate(date)}. Dành một khoảng thời gian cho gia đình.`, 'today'); }
  if (settings.memorials) for (const m of memorials) { let cursor = today; for (let i = 0; i < 2; i++) { const occurrence = nextOccurrence(m, cursor); if (!occurrence) break; add(occurrence.date, m.id, 'Nhắc ngày giỗ gia đình', `Ngày ${formatDate(occurrence.date)} có ngày giỗ đã lưu. Mở sổ chuẩn bị để xem chi tiết.`, 'memorials'); cursor = addDays(occurrence.date, 1); if (!isValidDate(cursor)) break; } }
  return events.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id)).slice(0, 50);
}
