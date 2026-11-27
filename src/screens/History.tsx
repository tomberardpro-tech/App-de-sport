import { useState } from 'react';
import { Empty, LineChart, Sheet, Stepper } from '../ds/components';
import { Icon } from '../ds/Icon';
import { useStore, useUi } from '../lib/store';
import { weekDone } from '../lib/stats';
import { dayKey, fmt, haptic, weekdayLetter } from '../lib/utils';
import type { Nav } from '../App';

export function History({ nav }: { nav: Nav }) {
  const { sets, machines, weights, profile, addWeight } = useStore();
  const showToast = useUi((s) => s.showToast);
  const [weighing, setWeighing] = useState(false);
  const cur = weights[weights.length - 1]?.kg ?? profile!.weight;
  const [kg, setKg] = useState(cur);
  const done = weekDone(sets);

  const byDay = new Map<string, typeof sets>();
  [...sets].sort((a, b) => b.date.localeCompare(a.date)).forEach((s) => {
    const k = dayKey(s.date);
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  });
  const days = [...byDay.entries()].slice(0, 30);

  return (
    <div className="page screen-enter">
      <h1 className="title">Mon<br /><b>historique</b></h1>

      <div className="card card--pad stack" style={{ gap: 10 }}>
        <div className="between"><p className="item-title">Cette semaine</p><span className="cap">{done.filter(Boolean).length} / {profile!.sessionsPerWeek} séances</span></div>
        <div className="row" style={{ gap: 6 }}>
          {weekdayLetter.map((l, i) => (
            <div key={i} style={{ flex: 1, height: 44, borderRadius: 'var(--r-control)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 500,
              background: done[i] ? 'var(--ink)' : profile!.days[i] ? 'var(--accent-soft)' : 'var(--bg)', color: done[i] ? '#fff' : profile!.days[i] ? 'var(--accent-ink)' : 'var(--muted)' }}>{l}</div>
          ))}
        </div>
        <span className="cap">Noir : séance faite · orange : jour prévu</span>
      </div>

      <div className="card card--pad stack" style={{ gap: 8 }}>
        <div className="between" style={{ alignItems: 'center' }}>
          <div><span className="cap">Poids de corps</span><p className="value">{fmt(cur, 1)} <span className="unit">kg</span></p></div>
          <button className="btn btn--sm" onClick={() => { setKg(cur); setWeighing(true); }}><Icon name="plus" size={16} />Pesée</button>
        </div>
        <LineChart values={weights.slice(-20).map((w) => w.kg)} height={50} empty="Ta courbe apparaîtra après la 2e pesée" />
      </div>

      <h2 className="h2">Séances</h2>
      {days.length ? (
        <div className="stack">
          {days.map(([day, list]) => {
            const ids = [...new Set(list.map((s) => s.machineId))];
            const vol = list.reduce((t, s) => t + s.weight * s.reps, 0);
            return (
              <div key={day} className="card card--list">
                <div className="list-row" style={{ justifyContent: 'space-between' }}>
                  <span className="item-title">{new Date(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  <span className="badge">{fmt(vol)} kg</span>
                </div>
                {ids.map((id) => {
                  const m = machines.find((x) => x.id === id);
                  const ms = list.filter((s) => s.machineId === id).reverse();
                  return (
                    <button key={id} className="list-row" onClick={() => nav({ tab: 'machines', machineId: id })}>
                      <span className="grow"><span className="item-title" style={{ fontSize: 13, display: 'block' }}>{m?.name ?? 'Machine supprimée'}</span>
                        <span className="cap">{ms.map((s) => `${fmt(s.weight, s.weight % 1 ? 1 : 0)}×${s.reps}`).join(' · ')}</span></span>
                      <Icon name="chevron" size={14} stroke={2} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : <Empty>Tes séances apparaîtront ici. Ouvre une machine pour noter ta première série.</Empty>}

      <Sheet open={weighing} onClose={() => setWeighing(false)} title="Pesée du jour">
        <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-control)', padding: 8 }}>
          <Stepper big value={kg} onChange={setKg} step={0.1} min={30} max={250} unit="kg" decimals={1} />
        </div>
        <button className="btn" onClick={() => { addWeight(kg); haptic(15); showToast('Pesée enregistrée'); setWeighing(false); }}>Enregistrer</button>
      </Sheet>
    </div>
  );
}
