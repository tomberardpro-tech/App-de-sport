export type Goal = 'masse' | 'seche' | 'maintien';
export type Sex = 'H' | 'F';

export interface Profile {
  name: string;
  goal: Goal;
  weight: number;
  height: number;
  age: number;
  sex: Sex;
  sessionsPerWeek: number;
  days: boolean[]; // L → D
  kcalTarget: number;
}

export interface Machine {
  id: string;
  name: string;
  muscle: string;
  favorite: boolean;
  settings: string;
  photo?: string; // data URL
}

export interface WorkSet {
  id: string;
  machineId: string;
  date: string; // ISO
  weight: number;
  reps: number;
}

export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  unit: 'g' | 'ml' | 'pièce';
  kcal: number; // pour 100 g/ml, ou pour 1 pièce
}

export interface DishItem { foodId: string; qty: number }
export interface Dish { id: string; name: string; items: DishItem[] }

export type MealKey = 'petitdej' | 'dejeuner' | 'collation' | 'diner';

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealKey;
  label: string;
  detail: string;
  kcal: number;
  dishId?: string;
}

export interface WeightEntry { date: string; kg: number }

export type WidgetType = 'week' | 'calories' | 'record' | 'last' | 'progress' | 'weekKcal' | 'weight' | 'favorites' | 'meals';
export type WidgetSize = 'S' | 'M' | 'L';
export interface Widget { type: WidgetType; size: WidgetSize }
