import { addDays, todayVietnam, dayNumber, solarToLunar, isValidDate } from '../lib/calendar';
import { dailyQuote } from '../data/quotes';
export async function refreshWidgets() {
  const { default: DayWidget } = await import('../widgets/LunarDayWidget');
  const today = todayVietnam();
  const entries = [];
  for (let i = 0; i < 60; i++) {
    const d = addDays(today, i); if (!isValidDate(d)) break;
    const lunar = solarToLunar(d), quote = dailyQuote(d);
    entries.push({ date: i === 0 ? new Date() : new Date(dayNumber(d) * 86400000 - 7 * 3600000), props: { solar: `Tháng ${d.month} · ${d.year}`, day: String(d.day), lunar: `${lunar.day}/${lunar.month}${lunar.leap ? ' nhuận' : ''}`, quote: quote.text, chapter: quote.chapter, stale: false } });
  }
  const staleDate = addDays(today, entries.length);
  entries.push({ date: new Date(dayNumber(staleDate) * 86400000 - 7 * 3600000), props: { solar: '', day: '', lunar: '', quote: '', chapter: 0, stale: true } });
  DayWidget.updateTimeline(entries);
  return true;
}
