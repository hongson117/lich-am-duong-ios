import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chapters, searchChapters, EMPTY_PERSONAL, validatePersonal, encodeFullBackup, decodeFullBackup, backupBytes } from '../src/lib/personal';
import { reminderPlan } from '../src/lib/reminders';
import { validPlan, Memorial, encodeBackup } from '../src/lib/memorials';
const m: Memorial = { id: 'm', name: 'Gia đình', day: 1, month: 1, relation: '', note: '', leapPolicy: 'regular', shortMonthPolicy: 'last-day', createdAt: '2026-01-01T00:00:00Z' };
test('Backup limits count Vietnamese and Chinese UTF-8 bytes consistently', () => {
  const value = 'Lịch Âm Dương 道德經 🌿';
  assert.equal(backupBytes(value), Buffer.byteLength(value, 'utf8'));
  assert.throws(() => decodeFullBackup('道'.repeat(666667)), /quá lớn/);
});
test('81 chapters have source, original and original editorial explanation', () => {
  assert.equal(chapters.length, 81);
  chapters.forEach((c, i) => { assert.equal(c.chapter, i + 1); assert.ok(c.original.length > 10 && c.meaning.length > 80 && c.source.startsWith('https://zh.wikisource.org/')); assert.ok(!c.original.includes('编辑')); });
  assert.ok(searchChapters('lanh dao', '', false, EMPTY_PERSONAL).length > 5);
  assert.equal(searchChapters('', '', true, { ...EMPTY_PERSONAL, favorites: [17] })[0].chapter, 17);
});
test('Full backup preserves journals, bookmarks and annual ceremony plans; v1 migrates', () => {
  const personal = { ...EMPTY_PERSONAL, favorites: [8, 17], notes: { '8': 'Giúp người mà không tranh.' } };
  const plan = { menu: 'Cơm nhà', guests: 'Gia đình', calls: '', budget: 2000000, expenses: [{ label: 'Hoa', amount: 200000 }], tasks: [{ label: 'Mua hoa', done: true }] };
  assert.ok(validPlan(plan)); assert.equal(validPlan({ ...plan, budget: -1 }), false);
  const full = { ...m, plans: { '2026': plan } };
  assert.deepEqual(decodeFullBackup(encodeFullBackup([full], personal)), { memorials: [full], personal });
  assert.deepEqual(decodeFullBackup(encodeBackup([m])).personal, EMPTY_PERSONAL);
  assert.equal(validatePersonal({ ...personal, favorites: [82] }), false);
  assert.equal(validatePersonal({ ...personal, notes: { '__proto__': 'bad', '90': 'bad' } }), false);
});
test('Reminder queue uses UTC+7, skips elapsed reminders and respects 50-slot cap', () => {
  const start = new Date('2026-02-15T00:00:00Z');
  const morning = reminderPlan([m], { memorials: true, lunarDays: false, when: 'morning' }, start);
  assert.equal(new Date(morning[0].at).toISOString(), '2026-02-17T00:00:00.000Z');
  const evening = reminderPlan([m], { memorials: true, lunarDays: false, when: 'evening-before' }, start);
  assert.equal(new Date(evening[0].at).toISOString(), '2026-02-16T11:00:00.000Z');
  assert.ok(evening.every(r => r.at > start.getTime() && !r.body.includes('Gia đình')));
  const many = Array.from({ length: 80 }, (_, i) => ({ ...m, id: `m${i}` }));
  assert.equal(reminderPlan(many, { memorials: true, lunarDays: true, when: 'morning' }, start).length, 50);
  assert.equal(reminderPlan([m], { memorials: false, lunarDays: false, when: 'morning' }, start).length, 0);
  const before = new Date('2026-02-16T20:00:00Z');
  assert.ok(reminderPlan([], { memorials: false, lunarDays: true, when: 'morning' }, before).some(r => r.title === 'Nhắc ngày Mùng 1' && new Date(r.at).toISOString() === '2026-02-17T00:00:00.000Z'));
});
