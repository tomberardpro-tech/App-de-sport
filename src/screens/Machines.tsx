import { useMemo, useState } from 'react';
import { Empty, SectionHead, Sheet } from '../ds/components';
import { Icon } from '../ds/Icon';
import { useStore } from '../lib/store';
import { MUSCLES, phraseOfDay } from '../lib/seed';
import type { Machine } from '../lib/types';
import { haptic, relativeDay } from '../lib/utils';
import type { Nav } from '../App';

/** Redimensionne une photo en data URL JPEG (~600 px). */
export async function readPhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });
  const scale = Math.min(1, 600 / Math.max(img.width, img.height));
  const c = document.createElement('canvas');
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL('image/jpeg', 0.8);
}

export function Thumb({ m, size }: { m: Machine; size: number | string }) {
  return (
    <div className="photo" style={{ width: size, height: size, flexShrink: 0, borderRadius: 'var(--r-control)' }}>
      {m.photo ? <img src={m.photo} alt="" /> : <Icon name="dumbbell" size={typeof size === 'number' ? Math.round(size / 2.2) : 26} stroke={1.5} />}
    </div>
  );
}

export function Machines({ nav }: { nav: Nav }) {
  const machines = useStore((s) => s.machines);
  const sets = useStore((s) => s.sets);
  const toggleFavorite = useStore((s) => s.toggleFavorite);
  const [q, setQ] = useState('');
  const [muscle, setMuscle] = useState<string>('Tous');
  const [adding, setAdding] = useState(false);

  const usage = useMemo(() => {
    const map = new Map<string, { days: Set<string>; last: string }>();
    sets.forEach((s) => {
      const e = map.get(s.machineId) ?? { days: new Set<string>(), last: '' };
      e.days.add(s.date.slice(0, 10));
      if (s.date > e.last) e.last = s.date;
      map.set(s.machineId, e);
    });
    return map;
  }, [sets]);

  const norm = (t: string) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const list = machines
    .filter((m) => muscle === 'Tous' || m.muscle === muscle)
    .filter((m) => !q || norm(m.name).includes(norm(q)));
  const favs = machines.filter((m) => m.favorite);

  const meta = (m: Machine) => {
    const u = usage.get(m.id);
    return u ? `${m.muscle} · ${u.days.size} séance${u.days.size > 1 ? 's' : ''}` : `${m.muscle} · jamais utilisée`;
  };

  return (
    <div className="page screen-enter">
      <div className="between" style={{ alignItems: 'flex-start' }}>
        <h1 className="title">Mes<br /><b>machines</b></h1>
        <p className="note note--right" style={{ marginTop: 6 }}>{phraseOfDay(4)}</p>
      </div>

      <label className="card row" style={{ height: 44, padding: '0 14px', gap: 10, borderRadius: 'var(--r-control)' }}>
        <span style={{ color: 'var(--muted)', display: 'flex' }}><Icon name="search" size={18} /></span>
        <input type="search" aria-label="Rechercher une machine" placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)}
          style={{ border: 0, outline: 'none', flex: 1, background: 'transparent', fontSize: 16 }} />
      </label>

      <div className="hscroll">
        {['Tous', ...MUSCLES].map((x) => (
          <button key={x} className="chip" aria-pressed={muscle === x} onClick={() => { haptic(); setMuscle(x); }}>{x}</button>
        ))}
      </div>

      {favs.length > 0 && !q && muscle === 'Tous' && (
        <>
          <SectionHead title="Favoris" />
          <div className="hscroll" style={{ gap: 12 }}>
            {favs.map((m) => (
              <button key={m.id} className="card press stack" onClick={() => nav({ tab: 'machines', machineId: m.id })}
                style={{ width: 140, flexShrink: 0, padding: 8, gap: 6, textAlign: 'left' }}>
                <div className="photo" style={{ height: 76, borderRadius: 'var(--r-control)', width: '100%' }}>
                  {m.photo ? <img src={m.photo} alt="" /> : <Icon name="dumbbell" size={26} stroke={1.5} />}
                </div>
                <span className="badge badge--neutral">{m.muscle}</span>
                <span className="item-title" style={{ fontSize: 13, lineHeight: 1.2 }}>{m.name}</span>
                <span className="cap">{usage.get(m.id) ? relativeDay(usage.get(m.id)!.last) : 'pas encore utilisée'}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <SectionHead title={muscle === 'Tous' ? 'Toutes les machines' : muscle} />
      {list.length ? (
        <div className="card card--list">
          {list.map((m) => (
            <div key={m.id} className="list-row" style={{ padding: '10px 14px' }}>
              <button className="row grow press" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => { haptic(); nav({ tab: 'machines', machineId: m.id }); }}>
                <Thumb m={m} size={40} />
                <span className="grow"><span className="item-title" style={{ display: 'block' }}>{m.name}</span><span className="cap">{meta(m)}</span></span>
              </button>
              <button aria-label={m.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={m.favorite}
                onClick={() => { haptic(); toggleFavorite(m.id); }}
                style={{ width: 44, height: 44, border: 0, background: 'none', color: m.favorite ? 'var(--accent)' : 'var(--line-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span key={String(m.favorite)} className={m.favorite ? 'pop' : ''} style={{ display: 'flex' }}><Icon name="star" size={20} filled={m.favorite} /></span>
              </button>
            </div>
          ))}
        </div>
      ) : <Empty>Aucune machine trouvée.</Empty>}

      <button className="btn btn--light" onClick={() => { haptic(); setAdding(true); }}><Icon name="plus" size={18} />Ajouter ma machine</button>

      <AddMachineSheet open={adding} onClose={() => setAdding(false)} onCreated={(id) => nav({ tab: 'machines', machineId: id })} />
    </div>
  );
}

function AddMachineSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const addMachine = useStore((s) => s.addMachine);
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState(MUSCLES[0]);
  const [photo, setPhoto] = useState<string | undefined>();

  const create = () => {
    const id = addMachine({ name: name.trim(), muscle, photo });
    haptic(20);
    setName(''); setPhoto(undefined);
    onClose();
    onCreated(id);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Nouvelle machine">
      <label className="photo press" style={{ height: 140, cursor: 'pointer', flexDirection: 'column', gap: 6 }}>
        {photo ? <img src={photo} alt="Aperçu" /> : <><Icon name="camera" size={26} /><span className="cap" style={{ color: 'var(--accent-ink)' }}>Ajouter une photo</span></>}
        <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await readPhoto(f)); }} />
      </label>
      <input className="input" placeholder="Nom de la machine" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        {MUSCLES.map((x) => <button key={x} className="chip" aria-pressed={muscle === x} onClick={() => setMuscle(x)}>{x}</button>)}
      </div>
      <button className="btn" disabled={!name.trim()} onClick={create}>Créer la machine</button>
    </Sheet>
  );
}
