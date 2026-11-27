import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, Food, MealEntry, Machine, Profile, WeightEntry, Widget, WorkSet } from './types';
import { DEFAULT_WIDGETS, SEED_MACHINES } from './seed';
import { dayKey, oneRm, uid } from './utils';

interface State {
  profile: Profile | null;
  machines: Machine[];
  sets: WorkSet[];
  foods: Food[];
  dishes: Dish[];
  meals: MealEntry[];
  weights: WeightEntry[];
  widgets: Widget[];

  setProfile: (p: Profile) => void;
  updateProfile: (p: Partial<Profile>) => void;

  addMachine: (m: Omit<Machine, 'id' | 'favorite' | 'settings'>) => string;
  updateMachine: (id: string, patch: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;
  toggleFavorite: (id: string) => void;

  /** Ajoute une série ; renvoie true si c'est un nouveau record. */
  addSet: (machineId: string, weight: number, reps: number) => boolean;
  deleteSet: (id: string) => void;

  upsertFood: (f: Omit<Food, 'id'> & { id?: string }) => string;
  saveDish: (d: Omit<Dish, 'id'> & { id?: string }) => string;
  deleteDish: (id: string) => void;
  addMeal: (e: Omit<MealEntry, 'id'>) => void;
  deleteMeal: (id: string) => void;

  addWeight: (kg: number) => void;

  setWidgets: (w: Widget[]) => void;

  importData: (data: Partial<State>) => void;
  reset: () => void;
}

const initial = {
  profile: null,
  machines: SEED_MACHINES,
  sets: [] as WorkSet[],
  foods: [] as Food[],
  dishes: [] as Dish[],
  meals: [] as MealEntry[],
  weights: [] as WeightEntry[],
  widgets: DEFAULT_WIDGETS,
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      setProfile: (p) => set((s) => ({
        profile: p,
        weights: s.weights.length ? s.weights : [{ date: new Date().toISOString(), kg: p.weight }],
      })),
      updateProfile: (p) => set((s) => (s.profile ? { profile: { ...s.profile, ...p } } : {})),

      addMachine: (m) => {
        const id = uid();
        set((s) => ({ machines: [...s.machines, { ...m, id, favorite: false, settings: '' }] }));
        return id;
      },
      updateMachine: (id, patch) => set((s) => ({ machines: s.machines.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      deleteMachine: (id) => set((s) => ({ machines: s.machines.filter((m) => m.id !== id), sets: s.sets.filter((x) => x.machineId !== id) })),
      toggleFavorite: (id) => set((s) => ({ machines: s.machines.map((m) => (m.id === id ? { ...m, favorite: !m.favorite } : m)) })),

      addSet: (machineId, weight, reps) => {
        // Record = mieux que toutes les séances précédentes (pas les séries du jour),
        // et on ne fête qu'une fois par jour et par machine.
        const today = dayKey();
        const mine = get().sets.filter((x) => x.machineId === machineId);
        const before = mine.filter((x) => dayKey(x.date) !== today);
        const best = before.reduce((b, x) => Math.max(b, oneRm(x.weight, x.reps)), 0);
        const todayBest = mine.filter((x) => dayKey(x.date) === today).reduce((b, x) => Math.max(b, oneRm(x.weight, x.reps)), 0);
        const isRecord = before.length > 0 && oneRm(weight, reps) > best && todayBest <= best;
        set((s) => ({ sets: [...s.sets, { id: uid(), machineId, date: new Date().toISOString(), weight, reps }] }));
        return isRecord;
      },
      deleteSet: (id) => set((s) => ({ sets: s.sets.filter((x) => x.id !== id) })),

      upsertFood: (f) => {
        const existing = f.barcode ? get().foods.find((x) => x.barcode === f.barcode) : undefined;
        const id = f.id ?? existing?.id ?? uid();
        set((s) => ({ foods: [...s.foods.filter((x) => x.id !== id), { ...f, id }] }));
        return id;
      },
      saveDish: (d) => {
        const id = d.id ?? uid();
        set((s) => ({ dishes: [...s.dishes.filter((x) => x.id !== id), { ...d, id }] }));
        return id;
      },
      deleteDish: (id) => set((s) => ({ dishes: s.dishes.filter((x) => x.id !== id) })),
      addMeal: (e) => set((s) => ({ meals: [...s.meals, { ...e, id: uid() }] })),
      deleteMeal: (id) => set((s) => ({ meals: s.meals.filter((x) => x.id !== id) })),

      addWeight: (kg) => set((s) => {
        const today = dayKey();
        const others = s.weights.filter((w) => dayKey(w.date) !== today);
        return {
          weights: [...others, { date: new Date().toISOString(), kg }].sort((a, b) => a.date.localeCompare(b.date)),
          profile: s.profile ? { ...s.profile, weight: kg } : s.profile,
        };
      }),

      setWidgets: (w) => set({ widgets: w }),

      importData: (data) => set((s) => ({ ...s, ...data })),
      reset: () => set({ ...initial }),
    }),
    { name: 'salle-data', version: 1 },
  ),
);

/* ---------- Interface : toast & confettis ---------- */
interface UiState {
  toast: string | null;
  confetti: number;
  showToast: (t: string) => void;
  celebrate: (t: string) => void;
}

let toastTimer: number | undefined;
export const useUi = create<UiState>()((set) => ({
  toast: null,
  confetti: 0,
  showToast: (t) => {
    window.clearTimeout(toastTimer);
    set({ toast: t });
    toastTimer = window.setTimeout(() => set({ toast: null }), 2200);
  },
  celebrate: (t) => {
    window.clearTimeout(toastTimer);
    set((s) => ({ toast: t, confetti: s.confetti + 1 }));
    toastTimer = window.setTimeout(() => set({ toast: null }), 2600);
  },
}));
