import type { ReactNode } from 'react';
import { LineChart, Ring } from '../ds/components';
import { Icon } from '../ds/Icon';
import { useStore } from '../lib/store';
import { kcalOfDay, lastSession, latestRecord, machineStats, progressMachine, weekDone, weekKcal, weekStreak } from '../lib/stats';
import type { WidgetSize, WidgetType } from '../lib/types';
import { dayKey, fmt, relativeDay, weekdayLetter } from '../lib/utils';
import type { Nav } from '../App';

export const WIDGET_LABEL: Record<WidgetType, string> = {
  week: 'Cette semaine',
  calories: 'Calories du jour',
  record: 'Record récent',
  last: 'Dernière séance',
  progress: 'Progression',
  weekKcal: 'Calories de la semaine',
  weight: 'Poids de corps',
  favorites: 'Machines favorites',
  meals: 'Repas du jour',
};

export const span = (size: WidgetSize) => (size === 'S' ? 'span 1' : 'span 2');

function Shell({ children, onClick, style }: { children: ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  return (
    <div className={`card stack ${onClick ? 'press' : ''}`} onClick={onClick} style={{ padding: 14, gap: 6, height: '100%', ...style }}>
      {children}
    </div>
  );
}

export function WidgetView({ type, size, nav }: { type: WidgetType; size: WidgetSize; nav: Nav }) {
  const s = useStore();
  const profile = s.profile!;

  switch (type) {
    case 'week': {
      const done = weekDone(s.sets);
      const n = done.filter(Boolean).length;
      const target = profile.sessionsPerWeek;
      const streak = weekStreak(s.sets, target);
      const tall = size === 'L';
      return (
        <div className="press" onClick={() => nav({ tab: 'history' })} style={{ position: 'relative', height: tall ? 168 : size === 'M' ? 120 : 140, borderRadius: 'var(--r-card)', overflow: 'hidden', color: '#fff', background: 'linear-gradient(160deg, #c9784e, #5c2d1b)' }}>
          <svg style={{ position: 'absolute', inset: 0 }} width="100%" height="100%" viewBox="0 0 350 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <path d="M0 110 L50 70 L90 95 L140 50 L190 90 L240 60 L300 95 L350 75 V200 H0Z" fill="#E6A57C" opacity=".55" />
            <path d="M0 135 L40 110 L80 128 L130 98 L180 125 L230 105 L290 130 L350 112 V200 H0Z" fill="#C9784E" opacity=".8" />
            <path d="M0 165 L30 150 L70 160 L120 140 L170 158 L220 146 L280 162 L350 150 V200 H0Z" fill="#8F4A2C" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(52,26,14,.72), rgba(52,26,14,0) 70%)' }} />
          {streak > 0 && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,.22)', borderRadius: 'var(--r-badge)', padding: '3px 8px' }}>{streak} sem. d'affilée</span>}
          <div style={{ position: 'absolute', left: 16, bottom: 14 }}>
            <span style={{ fontSize: 12, opacity: 0.9 }}>Cette semaine</span>
            <p style={{ margin: '2px 0 0', fontSize: tall ? 30 : 24, fontWeight: 600, lineHeight: 1, letterSpacing: '-.02em' }}>{n} / {target}</p>
            <span style={{ fontSize: 12, opacity: 0.9 }}>séances</span>
            <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
              {done.map((d, i) => <div key={i} title={weekdayLetter[i]} style={{ width: 14, height: 3, borderRadius: 2, background: d ? '#fff' : 'rgba(255,255,255,.3)' }} />)}
            </div>
          </div>
          {size !== 'S' && <span style={{ position: 'absolute', right: 14, bottom: 14, fontSize: 12, fontWeight: 500 }}>{n >= target ? 'Objectif atteint ✓' : 'Continue ›'}</span>}
        </div>
      );
    }

    case 'calories': {
      const eaten = kcalOfDay(s.meals);
      const target = profile.kcalTarget;
      const pct = eaten / target;
      if (size === 'S') {
        return (
          <Shell onClick={() => nav({ tab: 'diet' })}>
            <span className="cap">Calories du jour</span>
            <p className="value">{fmt(eaten)} <span className="unit">/ {fmt(target)}</span></p>
            <div className="bar"><div style={{ width: `${Math.min(100, pct * 100)}%` }} /></div>
            <span className="cap">{eaten <= target ? `Reste ${fmt(target - eaten)} kcal` : `+${fmt(eaten - target)} kcal`}</span>
          </Shell>
        );
      }
      return (
        <Shell onClick={() => nav({ tab: 'diet' })} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Ring value={pct} size={size === 'L' ? 96 : 72} label={`${Math.round(pct * 100)} %`} />
          <div className="stack" style={{ gap: 2 }}>
            <span className="cap">Calories du jour</span>
            <p className="value">{fmt(eaten)} <span className="unit">/ {fmt(target)}</span></p>
            <span className="badge">{eaten <= target ? `Reste ${fmt(target - eaten)} kcal` : `+${fmt(eaten - target)} kcal`}</span>
          </div>
        </Shell>
      );
    }

    case 'record': {
      const rec = latestRecord(s.sets);
      const m = rec && s.machines.find((x) => x.id === rec.set.machineId);
      return (
        <Shell onClick={m ? () => nav({ tab: 'machines', machineId: m.id }) : undefined}>
          <span className="cap">Record récent</span>
          {rec && m ? (
            <>
              <p className="value">{fmt(rec.set.weight, rec.set.weight % 1 ? 1 : 0)} kg <span className="unit">× {rec.set.reps}</span></p>
              {rec.gain > 0 && <span className="badge">+{fmt(rec.gain, rec.gain % 1 ? 1 : 0)} kg</span>}
              <span className="cap">{m.name} · {relativeDay(rec.set.date)}</span>
            </>
          ) : (
            <>
              <span style={{ color: 'var(--muted)' }}><Icon name="trophy" size={26} /></span>
              <span className="cap">Ton premier record t'attend</span>
            </>
          )}
        </Shell>
      );
    }

    case 'last': {
      const last = lastSession(s.sets, s.machines);
      return (
        <Shell onClick={() => nav({ tab: 'history' })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
          <span className="tile"><Icon name="dumbbell" /></span>
          <div className="grow">
            {last ? (
              <>
                <p className="item-title">Dernière séance · {last.muscles.slice(0, 2).join(' & ') || 'Séance'}</p>
                <span className="cap">{relativeDay(last.date)} · {last.machines} machine{last.machines > 1 ? 's' : ''} · {last.sets} séries · {fmt(last.volume)} kg</span>
              </>
            ) : (
              <>
                <p className="item-title">Aucune séance pour l'instant</p>
                <span className="cap">Ouvre une machine pour noter ta première série</span>
              </>
            )}
          </div>
          <span style={{ color: 'var(--muted)' }}><Icon name="chevron" size={16} stroke={2} /></span>
        </Shell>
      );
    }

    case 'progress': {
      const m = progressMachine(s.sets, s.machines);
      const st = m ? machineStats(s.sets, m.id) : null;
      const vals = st ? st.sessions.slice(-12).map((x) => x.max) : [];
      const gain = vals.length > 1 ? vals[vals.length - 1] - vals[0] : 0;
      return (
        <Shell onClick={m ? () => nav({ tab: 'machines', machineId: m.id }) : () => nav({ tab: 'machines' })} style={{ gap: 8 }}>
          <div className="between" style={{ alignItems: 'center' }}>
            <div>
              <p className="item-title">{m ? m.name : 'Progression'}</p>
              <span className="cap">Charge max · {vals.length} séance{vals.length > 1 ? 's' : ''}</span>
            </div>
            {gain > 0 && <span className="badge">+{fmt(gain, gain % 1 ? 1 : 0)} kg</span>}
          </div>
          <LineChart values={vals} height={size === 'S' ? 40 : 64} />
        </Shell>
      );
    }

    case 'weekKcal': {
      const vals = weekKcal(s.meals);
      const target = profile.kcalTarget;
      const max = Math.max(target * 1.15, ...vals);
      const today = (new Date().getDay() + 6) % 7;
      const logged = vals.filter((v, i) => v > 0 && i <= today);
      const avg = logged.length ? logged.reduce((a, b) => a + b, 0) / logged.length : 0;
      return (
        <Shell onClick={() => nav({ tab: 'diet' })} style={{ gap: 10 }}>
          <div className="between">
            <p className="item-title">Calories de la semaine</p>
            <span className="cap">{avg ? `moy. ${fmt(avg)}` : '—'}</span>
          </div>
          <div style={{ position: 'relative', height: 64, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 6px' }}>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: (target / max) * 64, borderTop: '1px dashed var(--line-soft)' }} />
            {vals.map((v, i) => (
              <div key={i} style={{ width: 10, height: Math.max(6, (v / max) * 64), borderRadius: 5, background: i === today ? 'var(--accent)' : i < today && v ? 'var(--ink)' : 'var(--track-strong)', transition: 'height var(--d-slow) var(--ease-out)' }} />
            ))}
          </div>
          <div className="cap" style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            {weekdayLetter.map((l, i) => <span key={i} style={i === today ? { color: 'var(--ink)', fontWeight: 600 } : undefined}>{l}</span>)}
          </div>
        </Shell>
      );
    }

    case 'weight': {
      const ws = s.weights.slice(-10);
      const cur = ws[ws.length - 1]?.kg ?? profile.weight;
      const monthAgo = s.weights.find((w) => new Date(w.date).getTime() > Date.now() - 30 * 86400000);
      const diff = monthAgo ? cur - monthAgo.kg : 0;
      return (
        <Shell onClick={() => nav({ tab: 'history' })}>
          <span className="cap">Poids de corps</span>
          <p className="value">{fmt(cur, 1)} <span className="unit">kg</span></p>
          <LineChart values={ws.map((w) => w.kg)} height={28} empty="Pèse-toi dans Historique" />
          {diff !== 0 && <span className="cap">{`${diff > 0 ? '+' : ''}${fmt(diff, 1)} ce mois`}</span>}
        </Shell>
      );
    }

    case 'favorites': {
      const favs = s.machines.filter((m) => m.favorite).slice(0, size === 'S' ? 2 : 4);
      return (
        <Shell>
          <span className="cap">Machines favorites</span>
          {favs.length ? favs.map((m) => (
            <button key={m.id} className="list-row press" style={{ padding: '6px 0' }} onClick={() => nav({ tab: 'machines', machineId: m.id })}>
              <span style={{ color: 'var(--accent)' }}><Icon name="star" size={14} filled /></span>
              <span className="item-title grow" style={{ fontSize: 13 }}>{m.name}</span>
            </button>
          )) : <span className="cap">Ajoute une étoile sur tes machines</span>}
        </Shell>
      );
    }

    case 'meals': {
      const today = s.meals.filter((m) => m.date === dayKey());
      return (
        <Shell onClick={() => nav({ tab: 'diet' })}>
          <span className="cap">Repas du jour</span>
          {today.length ? today.slice(-4).map((m) => (
            <div key={m.id} className="between"><span className="item-title" style={{ fontSize: 13 }}>{m.label}</span><span className="cap">{fmt(m.kcal)}</span></div>
          )) : <span className="cap">Rien de noté aujourd'hui</span>}
        </Shell>
      );
    }
  }
}
