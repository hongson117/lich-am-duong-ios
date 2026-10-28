import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solarToLunar, lunarToSolar, lunarMonthLength, parseDate, todayVietnam, dayNumber, fromDay, monthGrid, dateKey, canChiYear } from '../src/lib/calendar';
import { nextOccurrence, validateMemorial, encodeBackup, decodeBackup, Memorial } from '../src/lib/memorials';
import { almanac } from '../src/lib/almanac';
import { quotes, dailyQuote } from '../src/data/quotes';
import months from '../src/data/lunar-months.json';
const date = (d: number, m: number, y: number) => ({ day: d, month: m, year: y });
const record: Memorial = { id: 'fixture', name: 'Ông nội', relation: 'Gia đình', day: 1, month: 1, leapPolicy: 'regular', shortMonthPolicy: 'last-day', note: '', createdAt: '2026-01-01T00:00:00Z' };

test('Vietnamese Tet fixtures, including Vietnam/China divergence in 2007 and 1985', () => {
  for (const [d, m, y] of [[21, 1, 1985], [17, 2, 2007], [25, 1, 2020], [12, 2, 2021], [1, 2, 2022], [22, 1, 2023], [10, 2, 2024], [29, 1, 2025], [17, 2, 2026], [6, 2, 2027]]) {
    assert.deepEqual(solarToLunar(date(d, m, y)), { ...date(1, 1, y), leap: false });
  }
  assert.equal(canChiYear(2026), 'Bính Ngọ');
});
test('Known leap months and an ordinary lunar festival', () => {
  assert.deepEqual(solarToLunar(date(22, 3, 2023)), { ...date(1, 2, 2023), leap: true });
  assert.deepEqual(solarToLunar(date(25, 7, 2025)), { ...date(1, 6, 2025), leap: true });
  assert.deepEqual(solarToLunar(date(29, 9, 2023)), { ...date(15, 8, 2023), leap: false });
  assert.equal(lunarToSolar({ ...date(1, 2, 2026), leap: true }), null);
});
test('All 73,414 civil days 1900–2100 round-trip, and all lunar months have 29 or 30 days', () => {
  for (let i = 0; i < months.length - 1; i++) assert.ok([29, 30].includes(months[i + 1][0] - months[i][0]), `month ${i}`);
  for (let n = dayNumber(date(1, 1, 1900)); n <= dayNumber(date(31, 12, 2100)); n++) {
    const d = fromDay(n), l = solarToLunar(d);
    assert.ok(l.day >= 1 && l.day <= 30);
    assert.deepEqual(lunarToSolar(l), d, dateKey(d));
  }
});
test('Input validation and Vietnamese midnight are independent of device timezone', () => {
  assert.equal(parseDate('31/02/2026'), null); assert.equal(parseDate('29/02/1900'), null);
  assert.deepEqual(parseDate('29/02/2000'), date(29, 2, 2000));
  assert.equal(parseDate('01/01/2101'), null);
  assert.deepEqual(todayVietnam(new Date('2026-10-27T16:59:59Z')), date(27, 10, 2026));
  assert.deepEqual(todayVietnam(new Date('2026-10-27T17:00:00Z')), date(28, 10, 2026));
  assert.equal(monthGrid(2, 2026).length, 42);
});
test('Memorial on today is not skipped; the next day advances to the next lunar year', () => {
  assert.equal(nextOccurrence(record, date(17, 2, 2026))?.days, 0);
  assert.deepEqual(nextOccurrence(record, date(18, 2, 2026))?.date, date(6, 2, 2027));
});
test('Memorial leap policy selects leap month only when that month exists', () => {
  const m = { ...record, day: 1, month: 6, leapPolicy: 'prefer-leap' as const };
  assert.deepEqual(nextOccurrence(m, date(1, 1, 2025))?.date, date(25, 7, 2025));
  assert.equal(nextOccurrence(m, date(1, 1, 2026))?.leap, false);
  assert.deepEqual(nextOccurrence({ ...m, leapPolicy: 'regular' }, date(1, 1, 2025))?.date, date(25, 6, 2025));
});
test('Day 30 in a short month follows the saved family preference', () => {
  assert.equal(lunarMonthLength(12, 2025), 29);
  const m = { ...record, day: 30, month: 12 };
  assert.deepEqual(nextOccurrence(m, date(1, 1, 2026))?.date, date(16, 2, 2026));
  assert.equal(nextOccurrence(m, date(1, 1, 2026))?.adjusted, true);
  assert.deepEqual(nextOccurrence({ ...m, shortMonthPolicy: 'next-day' }, date(1, 1, 2026))?.date, date(17, 2, 2026));
});
test('Backup validates records, rejects invalid data and duplicate IDs', () => {
  assert.ok(validateMemorial(record)); assert.equal(validateMemorial({ ...record, day: 31 }), false);
  assert.deepEqual(decodeBackup(encodeBackup([record])), [record]);
  assert.throws(() => decodeBackup(encodeBackup([{ ...record, month: 13 }])));
  assert.throws(() => decodeBackup(encodeBackup([record, record])));
  assert.throws(() => decodeBackup('{"app":"wrong","version":1,"memorials":[]}'));
});
test('Six auspicious hours each day; almanac and quotes change deterministically', () => {
  for (let i = 1; i <= 31; i++) assert.equal(almanac(date(i, 1, 2026)).hours.length, 6);
  assert.equal(almanac(date(28, 10, 2026)).term, 'Sương giáng');
  assert.equal(quotes.length, 81);
  assert.ok(quotes.every(q => q.chapter >= 1 && q.chapter <= 81 && q.author.includes('Đạo Đức Kinh') && q.original && q.meaning && q.practice));
  assert.notEqual(dailyQuote(date(27, 10, 2026)).original, dailyQuote(date(28, 10, 2026)).original);
  assert.deepEqual(dailyQuote(date(28, 10, 2026)), dailyQuote(date(28, 10, 2026)));
});

test('Daily sequence visits all 81 chapters and repeats after 81 days', () => {
  const start = dayNumber(date(1, 1, 2026));
  const sequence = Array.from({ length: 81 }, (_, i) => dailyQuote(fromDay(start + i)).chapter);
  assert.equal(new Set(sequence).size, 81);
  assert.deepEqual([...sequence].sort((a, b) => a - b), Array.from({ length: 81 }, (_, i) => i + 1));
  assert.equal(dailyQuote(fromDay(start)).chapter, dailyQuote(fromDay(start + 81)).chapter);
});
