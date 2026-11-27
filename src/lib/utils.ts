import type { Food, Goal, Sex } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const dayKey = (d: Date | string = new Date()) => {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const fmt = (n: number, digits = 0) =>
  n.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Lundi de la semaine de la date donnée (00:00). */
export const startOfWeek = (d = new Date()) => {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const wd = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - wd);
  return x;
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const weekdayShort = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const weekdayLetter = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const relativeDay = (iso: string) => {
  const today = new Date(dayKey());
  const d = new Date(dayKey(iso));
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000);
  if (diff <= 0) return "aujourd'hui";
  if (diff === 1) return 'hier';
  if (diff < 7) return `il y a ${diff} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

export const longDate = (d = new Date()) => {
  const s = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Mifflin-St Jeor × activité selon le nombre de séances, + ajustement d'objectif. */
export function computeKcal(p: { weight: number; height: number; age: number; sex: Sex; sessionsPerWeek: number; goal: Goal }) {
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex === 'H' ? 5 : -161);
  const activity = 1.2 + 0.075 * p.sessionsPerWeek;
  const adjust = p.goal === 'masse' ? 300 : p.goal === 'seche' ? -400 : 0;
  return Math.round((bmr * activity + adjust) / 50) * 50;
}

export const goalLabel: Record<Goal, string> = { masse: 'Prise de masse', seche: 'Sèche', maintien: 'Maintien' };
export const goalAdjust: Record<Goal, string> = { masse: '+300 · prise de masse', seche: '−400 · sèche', maintien: 'maintien' };

export const foodKcal = (f: Food, qty: number) => (f.unit === 'pièce' ? f.kcal * qty : (f.kcal * qty) / 100);

export const unitLabel = (f: Food) => (f.unit === 'pièce' ? '' : ` ${f.unit}`);

/** Petit retour haptique (Android). */
export const haptic = (ms = 8) => {
  try { navigator.vibrate?.(ms); } catch { /* rien */ }
};

/** Estimation 1RM (Epley) pour comparer des séries. */
export const oneRm = (w: number, r: number) => w * (1 + r / 30);
