import { useRef, useState } from 'react';
import { IconButton, Segmented, Sheet, Stepper } from '../ds/components';
import { useStore, useUi } from '../lib/store';
import type { Goal } from '../lib/types';
import { computeKcal, fmt, haptic, weekdayLetter } from '../lib/utils';

export function Settings({ onBack }: { onBack: () => void }) {
  const store = useStore();
  const p = store.profile!;
  const showToast = useUi((s) => s.showToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const update = (patch: Partial<typeof p>, recompute = true) => {
    const next = { ...p, ...patch };
    store.updateProfile(recompute ? { ...patch, kcalTarget: computeKcal(next) } : patch);
  };

  const exportData = () => {
    const { profile, machines, sets, foods, dishes, meals, weights, widgets } = useStore.getState();
    const blob = new Blob([JSON.stringify({ profile, machines, sets, foods, dishes, meals, weights, widgets }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `salle-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Sauvegarde téléchargée');
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!data.profile) throw new Error();
      store.importData(data);
      showToast('Données restaurées');
    } catch { showToast('Fichier invalide'); }
  };

  return (
    <div className="page page--flow screen-enter">
      <div className="row"><IconButton icon="back" label="Retour" onClick={onBack} /></div>
      <h1 className="title">Mes<br /><b>réglages</b></h1>

      <div className="card card--pad stack" style={{ gap: 8 }}>
        <label className="cap" htmlFor="name">Prénom</label>
        <input id="name" className="input" value={p.name} onChange={(e) => store.updateProfile({ name: e.target.value })} />
      </div>

      <div className="card card--pad stack" style={{ gap: 10 }}>
        <span className="cap">Objectif</span>
        <Segmented<Goal> value={p.goal} onChange={(goal) => update({ goal })} options={[{ value: 'masse', label: 'Masse' }, { value: 'seche', label: 'Sèche' }, { value: 'maintien', label: 'Maintien' }]} />
      </div>

      <div className="card card--pad stack" style={{ gap: 8 }}>
        <div className="between"><span className="cap">Cible quotidienne</span><button className="link" onClick={() => update({})}>Recalculer</button></div>
        <Stepper value={p.kcalTarget} onChange={(v) => update({ kcalTarget: v }, false)} step={50} min={1000} max={6000} unit="kcal" />
      </div>

      <div className="grid2">
        <div className="card card--pad stack" style={{ gap: 6 }}><span className="cap">Taille</span><Stepper value={p.height} onChange={(height) => update({ height })} min={120} max={230} unit="cm" /></div>
        <div className="card card--pad stack" style={{ gap: 6 }}><span className="cap">Âge</span><Stepper value={p.age} onChange={(age) => update({ age })} min={12} max={99} /></div>
      </div>

      <div className="card card--pad stack" style={{ gap: 10 }}>
        <div className="between"><span className="cap">Séances par semaine</span><span className="cap">{p.days.filter(Boolean).length} jours choisis</span></div>
        <Stepper value={p.sessionsPerWeek} onChange={(sessionsPerWeek) => update({ sessionsPerWeek })} min={1} max={7} />
        <div className="row" style={{ gap: 6 }}>
          {weekdayLetter.map((l, i) => (
            <button key={i} className={`card day-btn ${p.days[i] ? 'is-selected' : ''}`} style={{ flex: 1, height: 40, borderRadius: 'var(--r-control)', fontSize: 13 }}
              onClick={() => { haptic(); const d = p.days.slice(); d[i] = !d[i]; store.updateProfile({ days: d }); }}>{l}</button>
          ))}
        </div>
      </div>

      <h2 className="h2">Mes données</h2>
      <p className="sub" style={{ marginTop: -10 }}>Tout est stocké sur ce téléphone. Fais une sauvegarde de temps en temps ({fmt(store.sets.length)} séries, {fmt(store.meals.length)} repas).</p>
      <div className="grid2">
        <button className="btn btn--light" onClick={exportData}>Sauvegarder</button>
        <button className="btn btn--light" onClick={() => fileRef.current?.click()}>Restaurer</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importData(f); }} />
      <button className="link" style={{ color: 'var(--danger)', alignSelf: 'center' }} onClick={() => setConfirmReset(true)}>Tout effacer</button>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="Tout effacer ?">
        <p className="sub" style={{ margin: 0 }}>Profil, séances, repas et pesées seront supprimés de ce téléphone. Pense à sauvegarder avant.</p>
        <button className="btn" style={{ background: 'var(--danger)' }} onClick={() => { store.reset(); }}>Tout effacer</button>
      </Sheet>
    </div>
  );
}
