import { useState } from 'react';
import { IconButton, LineChart, Sheet, Stepper } from '../ds/components';
import { Icon } from '../ds/Icon';
import { useStore, useUi } from '../lib/store';
import { machineStats } from '../lib/stats';
import { dayKey, fmt, haptic } from '../lib/utils';
import { readPhoto } from './Machines';

export function MachineDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const m = useStore((s) => s.machines.find((x) => x.id === id));
  const sets = useStore((s) => s.sets);
  const { toggleFavorite, addSet, deleteSet, updateMachine, deleteMachine } = useStore();
  const { celebrate, showToast } = useUi();
  const st = machineStats(sets, id);

  const [weight, setWeight] = useState(st?.last.weight ?? 20);
  const [reps, setReps] = useState(st?.last.reps ?? 10);
  const [editSettings, setEditSettings] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(m?.settings ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!m) return null;

  const todaySets = sets.filter((s) => s.machineId === id && dayKey(s.date) === dayKey());
  const pastSessions = (st?.sessions ?? []).filter((x) => x.day !== dayKey()).slice(-5).reverse();

  const add = () => {
    const isRecord = addSet(id, weight, reps);
    if (isRecord) { haptic(40); celebrate(`Nouveau record ! ${fmt(weight, weight % 1 ? 1 : 0)} kg × ${reps}`); }
    else { haptic(15); showToast(`Série ${todaySets.length + 1} enregistrée`); }
  };

  const sameAsLast = () => {
    if (!st) return;
    const ref = st.lastDaySets[Math.min(todaySets.length, st.lastDaySets.length - 1)];
    haptic(); setWeight(ref.weight); setReps(ref.reps);
  };

  const dayLabel = (k: string) => new Date(k).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="page screen-enter" style={{ paddingBottom: 320 }}>
      <div className="between" style={{ alignItems: 'center' }}>
        <IconButton icon="back" label="Retour" onClick={onBack} />
        <span style={{ fontSize: 15, fontWeight: 600 }}>Machine</span>
        <button className="icb" aria-label={m.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={m.favorite}
          onClick={() => { haptic(); toggleFavorite(id); }} style={{ color: m.favorite ? 'var(--accent)' : 'var(--ink)' }}>
          <span key={String(m.favorite)} className={m.favorite ? 'pop' : ''} style={{ display: 'flex' }}><Icon name="star" size={18} filled={m.favorite} /></span>
        </button>
      </div>

      <label className="photo press" style={{ height: 160, cursor: 'pointer', flexDirection: 'column', gap: 6 }}>
        {m.photo ? <img src={m.photo} alt={m.name} /> : <><Icon name="camera" size={30} stroke={1.4} /><span className="cap" style={{ color: 'var(--accent-ink)' }}>Ajouter ta photo</span></>}
        <input type="file" accept="image/*" capture="environment" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) updateMachine(id, { photo: await readPhoto(f) }); }} />
      </label>

      <div>
        <h1 className="title" style={{ fontSize: 26 }}><b>{m.name}</b></h1>
        <div className="row" style={{ gap: 6, marginTop: 8 }}><span className="badge badge--neutral" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>{m.muscle}</span></div>
      </div>

      <div className="grid2">
        <div className="card card--pad stack" style={{ gap: 4 }}>
          <span className="cap">Record</span>
          {st ? <>
            <p className="value">{fmt(st.record.weight, st.record.weight % 1 ? 1 : 0)} kg <span className="unit">× {st.record.reps}</span></p>
            <span className="badge">{new Date(st.record.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
          </> : <span className="cap">—</span>}
        </div>
        <div className="card card--pad stack" style={{ gap: 4 }}>
          <span className="cap">Volume du mois</span>
          <p className="value">{st ? fmt(st.monthVolume / 1000, 1) : '0'} <span className="unit">t</span></p>
          <span className="cap">{st?.count ?? 0} séance{(st?.count ?? 0) > 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="card card--pad stack" style={{ gap: 8 }}>
        <div className="between"><p className="item-title">Progression</p><span className="cap">charge max</span></div>
        <LineChart values={(st?.sessions ?? []).slice(-12).map((x) => x.max)} height={60} />
      </div>

      <div className="card row" style={{ padding: '12px 14px' }}>
        <div className="grow">
          <span className="cap">Mes réglages</span>
          <p style={{ margin: '2px 0 0', fontFamily: 'var(--font-note)', fontSize: 19, lineHeight: 1.1 }}>{m.settings || 'Note ici la hauteur du siège, le dossier…'}</p>
        </div>
        <IconButton icon="pencil" label="Modifier les réglages" small onClick={() => { setSettingsDraft(m.settings); setEditSettings(true); }} />
      </div>

      {todaySets.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <h2 className="h2">Aujourd'hui</h2>
          <div className="card card--list">
            {todaySets.map((s, i) => (
              <div key={s.id} className="list-row pop">
                <span className="tile tile--accent" style={{ width: 30, height: 30, fontSize: 12, fontWeight: 600 }}>{i + 1}</span>
                <span className="item-title grow">{fmt(s.weight, s.weight % 1 ? 1 : 0)} kg × {s.reps}</span>
                <IconButton icon="trash" label="Supprimer la série" small onClick={() => deleteSet(s.id)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {pastSessions.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <h2 className="h2">Historique</h2>
          <div className="card card--list">
            {pastSessions.map((x) => (
              <div key={x.day} className="list-row" style={{ justifyContent: 'space-between' }}>
                <span className="item-title" style={{ fontSize: 13 }}>{dayLabel(x.day)}</span>
                <span className="cap">{x.list.map((s) => `${fmt(s.weight, s.weight % 1 ? 1 : 0)}×${s.reps}`).join(' · ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="link" style={{ alignSelf: 'center', color: 'var(--danger)' }} onClick={() => setConfirmDelete(true)}>Supprimer cette machine</button>

      {/* Saisie rapide d'une série */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div className="sheet" style={{ animation: 'none', boxShadow: '0 -8px 24px rgba(40,30,20,.06)', borderTop: '1px solid var(--border)', gap: 14 }}>
          <div className="sheet-handle" />
          <div className="between" style={{ alignItems: 'center' }}>
            <h2 className="h2">Série {todaySets.length + 1}</h2>
            {st && (
              <button className="press" onClick={sameAsLast}
                style={{ height: 32, border: 0, borderRadius: 'var(--r-control)', background: 'var(--accent-soft)', color: 'var(--accent-ink)', padding: '0 12px', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="undo" size={14} stroke={2} />Comme la dernière
              </button>
            )}
          </div>
          <div className="grid2">
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-control)', padding: 8 }}><Stepper value={weight} onChange={setWeight} step={2.5} max={500} unit="kg" decimals={1} /></div>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-control)', padding: 8 }}><Stepper value={reps} onChange={setReps} min={1} max={100} unit="reps" /></div>
          </div>
          <button className="btn" onClick={add}>Ajouter la série</button>
        </div>
      </div>

      <Sheet open={editSettings} onClose={() => setEditSettings(false)} title="Mes réglages">
        <textarea className="input" rows={3} style={{ height: 'auto', padding: 14, resize: 'none', fontFamily: 'var(--font-note)', fontSize: 20 }}
          value={settingsDraft} onChange={(e) => setSettingsDraft(e.target.value)} placeholder="Siège cran 4 · dossier 2…" />
        <button className="btn" onClick={() => { updateMachine(id, { settings: settingsDraft.trim() }); setEditSettings(false); showToast('Réglages enregistrés'); }}>Enregistrer</button>
      </Sheet>

      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Supprimer la machine ?">
        <p className="sub" style={{ margin: 0 }}>Toutes les séries de « {m.name} » seront aussi supprimées.</p>
        <button className="btn" style={{ background: 'var(--danger)' }} onClick={() => { deleteMachine(id); onBack(); }}>Supprimer</button>
      </Sheet>
    </div>
  );
}
