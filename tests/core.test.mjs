import test from 'node:test';
import assert from 'node:assert/strict';
import { localDateId, getWeekId, emptyProgress, rolloverProgress, completionStreak, daysUntil, remainingSeconds } from '../zen-core.js';

test('Monday boundaries use local dates, including Sunday and year rollover', () => {
  assert.equal(getWeekId(new Date(2026, 9, 5, 0, 1)), '2026-10-05');
  assert.equal(getWeekId(new Date(2026, 9, 11, 23, 59)), '2026-10-05');
  assert.equal(getWeekId(new Date(2027, 0, 1)), '2026-12-28');
  assert.equal(localDateId(new Date(2026, 9, 8)), '2026-10-08');
});
test('rollover keeps a complete archive and retains streak without mutating source', () => {
  const old = { ...emptyProgress(new Date(2026, 8, 28)), notes: { mon_1: 'example' }, taskStatus: { mon_1: 'completed' }, streak: 4, lastActive: '2026-10-04' };
  const result = rolloverProgress(old, new Date(2026, 9, 5));
  assert.deepEqual(result.archive.notes, old.notes);
  assert.deepEqual(result.progress.notes, {});
  assert.equal(result.progress.streak, 4);
  assert.equal(old.weekId, '2026-09-28');
  assert.equal(rolloverProgress(result.progress, new Date(2026, 9, 6)).archive, null);
});
test('streak increments once per local day and resets after a gap, supports old dates', () => {
  const now = new Date(2026, 9, 8);
  assert.deepEqual(completionStreak(3, '2026-10-07', now), { streak: 4, lastActive: '2026-10-08' });
  assert.equal(completionStreak(3, '2026-10-08', now).streak, 3);
  assert.equal(completionStreak(3, '2026-10-06', now).streak, 1);
  assert.equal(completionStreak(3, new Date(2026, 9, 7).toDateString(), now).streak, 4);
});
test('countdown handles unset dates, today and past dates', () => {
  const now = new Date(2026, 9, 8, 23, 59);
  assert.equal(daysUntil('', now), null);
  assert.equal(daysUntil('2026-10-09', now), 1);
  assert.equal(daysUntil('2026-10-08', now), 0);
  assert.equal(daysUntil('2026-04-10', now), 0);
});
test('timer catches up after background throttling and never becomes negative', () => {
  assert.equal(remainingSeconds(100000, 1000), 99);
  assert.equal(remainingSeconds(100000, 99400), 1);
  assert.equal(remainingSeconds(100000, 120000), 0);
});
