export const STORAGE_KEY = 'ielts-zen-progress-v1';

export function localDateId(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function getWeekId(date = new Date()) {
  const monday = new Date(date);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return localDateId(monday);
}

export function emptyProgress(date = new Date()) {
  return { weekId: getWeekId(date), taskStatus: {}, notes: {}, extraTasks: {}, dailyMoods: {}, streak: 0, lastActive: null };
}

export function rolloverProgress(data, date = new Date()) {
  const weekId = getWeekId(date);
  if (!data.weekId || data.weekId >= weekId) return { progress: { ...data, weekId: data.weekId || weekId }, archive: null };
  return {
    archive: { ...data, archivedAt: date.toISOString() },
    progress: { ...data, weekId, taskStatus: {}, notes: {}, extraTasks: {}, dailyMoods: {} },
  };
}

function calendarDay(dateId) {
  const [year, month, day] = dateId.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function completionStreak(streak, lastActive, date = new Date()) {
  const today = localDateId(date);
  const previous = /^\d{4}-\d{2}-\d{2}$/.test(lastActive || '') ? lastActive : lastActive ? localDateId(new Date(lastActive)) : null;
  if (previous === today) return { streak, lastActive: today };
  const gap = previous ? calendarDay(today) - calendarDay(previous) : Infinity;
  return { streak: gap === 1 ? streak + 1 : 1, lastActive: today };
}

export function daysUntil(dateId, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateId || '')) return null;
  return Math.max(0, calendarDay(dateId) - calendarDay(localDateId(now)));
}

export function remainingSeconds(deadline, now = Date.now()) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}
