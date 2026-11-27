import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from './Icon';
import { useUi } from '../lib/store';
import { haptic } from '../lib/utils';

/** Titre de page : une ligne légère + une ligne grasse. */
export function Title({ light, bold, sub, note }: { light: string; bold: string; sub?: string; note?: string }) {
  return (
    <div style={{ position: 'relative' }}>
      {note && <p className="note note--right" style={{ position: 'absolute', right: 2, top: 2 }}>{note}</p>}
      <h1 className="title">{light}<br /><b>{bold}</b></h1>
      {sub && <p className="sub">{sub}</p>}
    </div>
  );
}

export function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="between">
      <h2 className="h2">{title}</h2>
      {action && <button className="link" onClick={onAction}>{action} ›</button>}
    </div>
  );
}

export function IconButton({ icon, label, onClick, small, className = '', repeat }: { icon: IconName; label: string; onClick?: () => void; small?: boolean; className?: string; repeat?: boolean }) {
  const timer = useRef<number | undefined>(undefined);
  const fired = useRef(false);
  const latest = useRef(onClick);
  latest.current = onClick;
  const stop = () => { window.clearTimeout(timer.current); window.clearInterval(timer.current); };
  useEffect(() => stop, []);
  const holdProps = repeat ? {
    onPointerDown: () => {
      fired.current = false;
      timer.current = window.setTimeout(() => {
        fired.current = true;
        timer.current = window.setInterval(() => { latest.current?.(); haptic(4); }, 90);
      }, 420);
    },
    onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  } : {};
  return (
    <button className={`icb ${small ? 'icb--sm' : ''} ${className}`} aria-label={label} {...holdProps}
      onClick={() => { if (fired.current) { fired.current = false; return; } haptic(); onClick?.(); }}>
      <Icon name={icon} size={small ? 16 : 18} stroke={2} />
    </button>
  );
}

/** Valeur numérique qui « rebondit » quand elle change. */
export function Bump({ value, children }: { value: unknown; children: ReactNode }) {
  const [k, setK] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setK((x) => x + 1);
  }, [value]);
  return <span key={k} className={k ? 'bump' : ''} style={{ display: 'inline-block' }}>{children}</span>;
}

export function Stepper({ value, onChange, step = 1, min = 0, max = 999, unit, big, decimals = 0 }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; unit?: string; big?: boolean; decimals?: number;
}) {
  const valueRef = useRef(value);
  valueRef.current = value;
  const set = (v: number) => {
    const next = Math.min(max, Math.max(min, Math.round(v * 100) / 100));
    valueRef.current = next;
    onChange(next);
  };
  return (
    <div className="row" style={{ justifyContent: 'space-between' }}>
      <IconButton icon="minus" label="Moins" small={!big} repeat onClick={() => set(valueRef.current - step)} />
      <p className={`value ${big ? 'value--big' : ''}`} style={{ margin: 0, whiteSpace: 'nowrap' }}>
        <Bump value={value}>{value.toLocaleString('fr-FR', { maximumFractionDigits: decimals })}</Bump>
        {unit && <span className="unit"> {unit}</span>}
      </p>
      <IconButton icon="plus" label="Plus" small={!big} repeat onClick={() => set(valueRef.current + step)} />
    </div>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map((o) => (
        <button key={o.value} aria-pressed={o.value === value} onClick={() => { haptic(); onChange(o.value); }}>{o.label}</button>
      ))}
    </div>
  );
}

export function Steps({ total, current, done }: { total: number; current: number; done?: boolean }) {
  return (
    <div className={`steps ${done ? 'steps--done' : ''}`} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => <div key={i} className={i < current ? 'on' : ''} />)}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('sheet-open');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('sheet-open'); };
  }, [open, onClose]);
  if (!open) return null;
  // Portail : le tiroir passe toujours au-dessus du menu et des animations d'écran.
  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        {title && (
          <div className="between" style={{ alignItems: 'center' }}>
            <h2 className="h2">{title}</h2>
            <IconButton icon="close" label="Fermer" small onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Ring({ value, size = 92, stroke = 6, label }: { value: number; size?: number; stroke?: number; label?: string }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setShown(Math.min(1, Math.max(0, value)))); return () => cancelAnimationFrame(t); }, [value]);
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--track)" strokeWidth={stroke} />
      <circle className="ring-fg" cx="40" cy="40" r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - shown)} transform="rotate(-90 40 40)" />
      {label && <text x="40" y="45" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="600" fill="var(--ink)">{label}</text>}
    </svg>
  );
}

/** Courbe fine noire, point final orange. */
export function LineChart({ values, height = 64, empty }: { values: number[]; height?: number; empty?: string }) {
  if (values.length < 2) {
    return <div className="cap" style={{ minHeight: height, display: 'flex', alignItems: 'center' }}>{empty ?? `Encore ${2 - values.length} séance${values.length ? '' : 's'} pour voir ta courbe`}</div>;
  }
  const w = 320;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [4 + (i * (w - 12)) / (values.length - 1), height - 8 - ((v - min) / span) * (height - 16)]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path d={`M0 ${height * 0.25} H${w} M0 ${height * 0.62} H${w}`} stroke="var(--divider)" strokeWidth="1" />
      <path d={d} stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
        style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animation: 'draw 600ms var(--ease-out) forwards' }} />
      <circle cx={lx} cy={ly} r="3.5" fill="var(--accent)" className="pop" />
      <style>{'@keyframes draw { to { stroke-dashoffset: 0; } }'}</style>
    </svg>
  );
}

export function BottomNav({ tab, onTab }: { tab: string; onTab: (t: 'home' | 'machines' | 'diet' | 'history') => void }) {
  const items: { id: 'home' | 'machines' | 'diet' | 'history'; icon: IconName; label: string }[] = [
    { id: 'home', icon: 'home', label: 'Accueil' },
    { id: 'machines', icon: 'dumbbell', label: 'Machines' },
    { id: 'diet', icon: 'apple', label: 'Diète' },
    { id: 'history', icon: 'calendar', label: 'Historique' },
  ];
  return (
    <div className="nav-wrap">
      <nav className="nav">
        {items.map((it) => (
          <button key={it.id} aria-label={it.label} aria-current={tab === it.id ? 'page' : undefined} onClick={() => { haptic(); onTab(it.id); }}>
            <Icon name={it.icon} />
          </button>
        ))}
      </nav>
    </div>
  );
}

const CONFETTI_COLORS = ['#e8956a', '#1c1c1a', '#f3c9a6', '#fcebdf', '#c9784e'];

export function Toaster() {
  const { toast, confetti } = useUi();
  const [burst, setBurst] = useState(0);
  useEffect(() => {
    if (!confetti) return;
    setBurst(confetti);
    const t = window.setTimeout(() => setBurst(0), 1600);
    return () => window.clearTimeout(t);
  }, [confetti]);
  return (
    <>
      {burst > 0 && (
        <div className="confetti" key={burst} aria-hidden="true">
          {Array.from({ length: 36 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, background: CONFETTI_COLORS[i % CONFETTI_COLORS.length], animationDelay: `${(i % 9) * 40}ms` }} />
          ))}
        </div>
      )}
      {toast && <div className="toast" role="status"><Icon name="check" size={16} stroke={2.4} />{toast}</div>}
    </>
  );
}

/** Élément fixé à l'écran, rendu hors de l'écran animé (sinon il bouge avec l'animation d'entrée). */
export function Fixed({ children }: { children: ReactNode }) {
  return createPortal(children, document.body);
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
