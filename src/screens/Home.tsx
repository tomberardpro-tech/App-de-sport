import { useEffect, useState } from 'react';
import { DndContext, PointerSensor, TouchSensor, KeyboardSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Segmented, SectionHead, Sheet } from '../ds/components';
import { Icon } from '../ds/Icon';
import { useStore } from '../lib/store';
import { phraseOfDay } from '../lib/seed';
import type { Widget, WidgetSize, WidgetType } from '../lib/types';
import { haptic } from '../lib/utils';
import { WIDGET_LABEL, WidgetView, span } from './widgets';
import type { Nav } from '../App';

const ALL: WidgetType[] = ['week', 'calories', 'record', 'last', 'progress', 'weekKcal', 'weight', 'favorites', 'meals'];

export function Home({ nav }: { nav: Nav }) {
  const profile = useStore((s) => s.profile)!;
  const widgets = useStore((s) => s.widgets);
  const [editing, setEditing] = useState(false);

  return editing ? <EditHome onDone={() => setEditing(false)} /> : (
    <div className="page screen-enter">
      <div className="between" style={{ alignItems: 'flex-start' }}>
        <p className="note">{phraseOfDay(0)}</p>
        <button className="press" aria-label="Réglages" onClick={() => nav({ tab: 'settings' })}
          style={{ width: 36, height: 36, borderRadius: '50%', border: 0, background: 'var(--ink)', color: '#fff', fontWeight: 600, fontSize: 14 }}>
          {profile.name.charAt(0).toUpperCase()}
        </button>
      </div>

      <div>
        <h1 className="title">Bonjour,<br /><b>{profile.name}</b></h1>
        <p className="sub">Une rep de plus que la dernière fois.</p>
      </div>

      <SectionHead title="Tableau de bord" action="Modifier" onAction={() => { haptic(); setEditing(true); }} />

      <div className="grid2 stagger">
        {widgets.map((w) => (
          <div key={w.type} style={{ gridColumn: span(w.size) }}>
            <WidgetView type={w.type} size={w.size} nav={nav} />
          </div>
        ))}
        {widgets.length < ALL.length && (
          <button className="card card--dashed press stack" onClick={() => { haptic(); setEditing(true); }}
            style={{ alignItems: 'center', justifyContent: 'center', minHeight: 110, gap: 6, color: 'var(--muted)', fontSize: 12 }}>
            <Icon name="plus" />Ajouter un widget
          </button>
        )}
      </div>

      <p className="note" style={{ marginLeft: 4 }}>{phraseOfDay(7)}</p>
    </div>
  );
}

function SortableWidget({ w, selected, onSelect, onRemove }: { w: Widget; selected: boolean; onSelect: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: w.type });
  return (
    <div ref={setNodeRef}
      style={{
        gridColumn: span(w.size), position: 'relative',
        transform: CSS.Transform.toString(transform), transition,
        zIndex: isDragging ? 5 : 1,
      }}>
      <div {...attributes} {...listeners} onClick={onSelect}
        className={`card stack ${isDragging ? '' : 'wiggle'}`}
        style={{
          padding: 14, gap: 8, minHeight: w.size === 'L' ? 120 : 84, touchAction: 'manipulation', cursor: 'grab',
          borderStyle: selected ? 'solid' : 'dashed', borderColor: selected ? 'var(--ink)' : 'var(--line-soft)',
          boxShadow: isDragging ? '0 16px 30px rgba(40,30,20,.14)' : 'none',
          transition: 'box-shadow var(--d-base), transform var(--d-base)',
        }}>
        <div className="between" style={{ alignItems: 'center' }}>
          <span className="cap">{WIDGET_LABEL[w.type]}</span>
          <span style={{ color: 'var(--muted)' }}><Icon name="grip" size={16} /></span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'var(--track)', width: '60%' }} />
        <div style={{ height: 6, borderRadius: 3, background: 'var(--track)', width: '40%' }} />
      </div>
      <button aria-label={`Retirer ${WIDGET_LABEL[w.type]}`} onClick={onRemove}
        style={{ position: 'absolute', top: -8, left: -8, width: 24, height: 24, borderRadius: '50%', background: 'var(--ink)', color: '#fff', border: '2px solid var(--bg)', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="minus" size={12} stroke={3} />
      </button>
    </div>
  );
}

function EditHome({ onDone }: { onDone: () => void }) {
  const widgets = useStore((s) => s.widgets);
  const setWidgets = useStore((s) => s.setWidgets);
  const [selected, setSelected] = useState<WidgetType | null>(null);
  const [adding, setAdding] = useState(false);

  // Le menu du bas disparaît pendant l'édition.
  useEffect(() => {
    document.body.classList.add('editing');
    return () => document.body.classList.remove('editing');
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      haptic(12);
      const from = widgets.findIndex((w) => w.type === active.id);
      const to = widgets.findIndex((w) => w.type === over.id);
      setWidgets(arrayMove(widgets, from, to));
    }
  };
  const available = ALL.filter((t) => !widgets.some((w) => w.type === t));
  const sel = widgets.find((w) => w.type === selected);

  return (
    <div className="page screen-enter" style={{ paddingBottom: 140 }}>
      <div className="between" style={{ alignItems: 'flex-start' }}>
        <p className="note">{'glisse, retire,\nredimensionne'}</p>
        <button className="btn btn--sm" onClick={() => { haptic(); onDone(); }}>OK</button>
      </div>
      <div>
        <h1 className="title">Modifier<br /><b>l'accueil</b></h1>
        <p className="sub">Appuie et glisse pour déplacer. Touche un widget pour changer sa taille.</p>
      </div>

      {sel && (
        <div className="card card--pad stack pop" style={{ gap: 10 }}>
          <div className="between"><p className="item-title">{WIDGET_LABEL[sel.type]}</p><span className="cap">taille</span></div>
          <Segmented<WidgetSize>
            value={sel.size}
            onChange={(size) => setWidgets(widgets.map((w) => (w.type === sel.type ? { ...w, size } : w)))}
            options={[{ value: 'S', label: 'Petit' }, { value: 'M', label: 'Moyen' }, { value: 'L', label: 'Grand' }]}
          />
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={() => haptic(15)} onDragEnd={onDragEnd}>
        <SortableContext items={widgets.map((w) => w.type)} strategy={rectSortingStrategy}>
          <div className="grid2" style={{ gap: 14 }}>
            {widgets.map((w) => (
              <SortableWidget key={w.type} w={w} selected={selected === w.type}
                onSelect={() => { haptic(); setSelected(selected === w.type ? null : w.type); }}
                onRemove={() => { haptic(20); setWidgets(widgets.filter((x) => x.type !== w.type)); if (selected === w.type) setSelected(null); }} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {available.length > 0 && (
        <button className="btn btn--light" onClick={() => { haptic(); setAdding(true); }}><Icon name="plus" size={18} />Ajouter un widget</button>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Ajouter un widget">
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          {available.map((t) => (
            <button key={t} className="chip" onClick={() => {
              haptic();
              setWidgets([...widgets, { type: t, size: t === 'week' ? 'L' : ['calories', 'record', 'weight'].includes(t) ? 'S' : 'M' }]);
              setAdding(false);
            }}>+ {WIDGET_LABEL[t]}</button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
