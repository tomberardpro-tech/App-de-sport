import type { MealEntry, Machine, WorkSet } from './types';
import { addDays, dayKey, oneRm, startOfWeek } from './utils';

export const trainingDays = (sets: WorkSet[]) => new Set(sets.map((s) => dayKey(s.date)));

/** Jours de la semaine en cours (L→D) où une séance a été faite. */
export function weekDone(sets: WorkSet[]) {
  const days = trainingDays(sets);
  const mon = startOfWeek();
  return Array.from({ length: 7 }, (_, i) => days.has(dayKey(addDays(mon, i))));
}

/** Nombre de semaines d'affilée (en remontant depuis la semaine dernière, + celle-ci si objectif atteint) où l'objectif est atteint. */
export function weekStreak(sets: WorkSet[], target: number) {
  const days = trainingDays(sets);
  const countWeek = (mon: Date) => Array.from({ length: 7 }, (_, i) => days.has(dayKey(addDays(mon, i)))).filter(Boolean).length;
  let mon = startOfWeek();
  let streak = countWeek(mon) >= target ? 1 : 0;
  mon = addDays(mon, -7);
  while (countWeek(mon) >= target) {
    streak++;
    mon = addDays(mon, -7);
  }
  return streak;
}

export function lastSession(sets: WorkSet[], machines: Machine[]) {
  if (!sets.length) return null;
  const last = sets.reduce((a, b) => (a.date > b.date ? a : b));
  const key = dayKey(last.date);
  const daySets = sets.filter((s) => dayKey(s.date) === key);
  const ids = [...new Set(daySets.map((s) => s.machineId))];
  const muscles = [...new Set(ids.map((id) => machines.find((m) => m.id === id)?.muscle).filter(Boolean))] as string[];
  return {
    date: last.date,
    machines: ids.length,
    sets: daySets.length,
    volume: daySets.reduce((t, s) => t + s.weight * s.reps, 0),
    muscles,
  };
}

export function machineStats(sets: WorkSet[], machineId: string) {
  const ms = sets.filter((s) => s.machineId === machineId).sort((a, b) => a.date.localeCompare(b.date));
  if (!ms.length) return null;
  const record = ms.reduce((b, s) => (oneRm(s.weight, s.reps) > oneRm(b.weight, b.reps) ? s : b));
  const last = ms[ms.length - 1];
  const byDay = new Map<string, WorkSet[]>();
  ms.forEach((s) => {
    const k = dayKey(s.date);
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  });
  const sessions = [...byDay.entries()].map(([day, list]) => ({ day, list, max: Math.max(...list.map((x) => x.weight)) }));
  const lastDaySets = sessions[sessions.length - 1].list;
  const monthAgo = Date.now() - 30 * 86400000;
  const monthVolume = ms.filter((s) => new Date(s.date).getTime() > monthAgo).reduce((t, s) => t + s.weight * s.reps, 0);
  return { record, last, lastDaySets, sessions, monthVolume, count: sessions.length };
}

/** Dernier record battu (meilleure série d'une journée qui dépasse tous les jours précédents). */
export function latestRecord(sets: WorkSet[]) {
  const byMachine = new Map<string, Map<string, WorkSet[]>>();
  for (const s of sets) {
    const days = byMachine.get(s.machineId) ?? new Map<string, WorkSet[]>();
    const k = dayKey(s.date);
    days.set(k, [...(days.get(k) ?? []), s]);
    byMachine.set(s.machineId, days);
  }
  let latest: { set: WorkSet; gain: number } | null = null;
  for (const days of byMachine.values()) {
    const keys = [...days.keys()].sort();
    let best = -1;
    let bestWeight = 0;
    keys.forEach((k, i) => {
      const top = days.get(k)!.reduce((a, b) => (oneRm(b.weight, b.reps) > oneRm(a.weight, a.reps) ? b : a));
      const v = oneRm(top.weight, top.reps);
      if (i > 0 && v > best && (!latest || top.date > latest.set.date)) latest = { set: top, gain: top.weight - bestWeight };
      if (v > best) { best = v; bestWeight = Math.max(bestWeight, top.weight); }
    });
  }
  return latest as { set: WorkSet; gain: number } | null;
}

/** Machine pour le widget de progression : favorite la plus utilisée, sinon la plus utilisée. */
export function progressMachine(sets: WorkSet[], machines: Machine[]) {
  const count = (id: string) => sets.filter((s) => s.machineId === id).length;
  const used = machines.filter((m) => count(m.id) > 0).sort((a, b) => count(b.id) - count(a.id));
  return used.find((m) => m.favorite) ?? used[0] ?? null;
}

export const kcalOfDay = (meals: MealEntry[], key = dayKey()) =>
  meals.filter((m) => m.date === key).reduce((t, m) => t + m.kcal, 0);

export function weekKcal(meals: MealEntry[]) {
  const mon = startOfWeek();
  return Array.from({ length: 7 }, (_, i) => kcalOfDay(meals, dayKey(addDays(mon, i))));
}
