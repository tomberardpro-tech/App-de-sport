import type { Machine, Widget } from './types';

const m = (id: string, name: string, muscle: string): Machine => ({ id, name, muscle, favorite: false, settings: '' });

export const MUSCLES = ['Pectoraux', 'Dos', 'Jambes', 'Épaules', 'Bras', 'Abdos'];

export const SEED_MACHINES: Machine[] = [
  m('presse-cuisses', 'Presse à cuisses', 'Jambes'),
  m('leg-extension', 'Leg extension', 'Jambes'),
  m('leg-curl', 'Leg curl', 'Jambes'),
  m('adducteurs', 'Adducteurs', 'Jambes'),
  m('abducteurs', 'Abducteurs', 'Jambes'),
  m('mollets', 'Mollets debout', 'Jambes'),
  m('hack-squat', 'Hack squat', 'Jambes'),
  m('developpe-couche', 'Développé couché', 'Pectoraux'),
  m('developpe-incline', 'Développé incliné', 'Pectoraux'),
  m('pec-deck', 'Pec deck (butterfly)', 'Pectoraux'),
  m('chest-press', 'Chest press', 'Pectoraux'),
  m('tirage-vertical', 'Tirage vertical', 'Dos'),
  m('tirage-horizontal', 'Tirage horizontal', 'Dos'),
  m('rowing-machine', 'Rowing machine', 'Dos'),
  m('lombaires', 'Extension lombaires', 'Dos'),
  m('developpe-epaules', 'Développé épaules', 'Épaules'),
  m('elevations-laterales', 'Élévations latérales', 'Épaules'),
  m('oiseau', 'Oiseau (reverse fly)', 'Épaules'),
  m('curl-biceps', 'Curl biceps machine', 'Bras'),
  m('triceps-poulie', 'Triceps à la poulie', 'Bras'),
  m('dips-assistes', 'Dips assistés', 'Bras'),
  m('crunch-machine', 'Crunch machine', 'Abdos'),
];

export const DEFAULT_WIDGETS: Widget[] = [
  { type: 'week', size: 'L' },
  { type: 'calories', size: 'S' },
  { type: 'record', size: 'S' },
  { type: 'last', size: 'M' },
  { type: 'progress', size: 'M' },
  { type: 'weekKcal', size: 'M' },
  { type: 'weight', size: 'S' },
];

export const PHRASES = [
  'Petits pas,\ngros résultats',
  "Mieux\nqu'hier",
  "Une rep de plus,\nc'est gagné",
  'La régularité\nbat le talent',
  "Pas de zéro\naujourd'hui",
  'Lent mais\nconstant',
  'Ton futur toi\nte remercie',
  "Bois de l'eau,\nsérieux",
  'Le repos fait\npartie du plan',
  'Un jour\nà la fois',
  "Fier d'être\nvenu",
  "Le plus dur,\nc'est la porte",
  "Protéines\nd'abord",
  'Respire,\npousse, recommence',
];

/** Phrase du jour, décalée par écran pour ne jamais se répéter. */
export const phraseOfDay = (offset = 0) => {
  const d = new Date();
  const day = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  return PHRASES[(day + offset) % PHRASES.length];
};
