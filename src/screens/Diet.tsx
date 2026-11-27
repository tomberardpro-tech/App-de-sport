import { useEffect, useRef, useState } from 'react';
import { Bump, Empty, IconButton, Ring, Segmented, Sheet, Stepper } from '../ds/components';
import { Icon, type IconName } from '../ds/Icon';
import { useStore, useUi } from '../lib/store';
import { canScan, fetchByBarcode, type OffProduct } from '../lib/off';
import { phraseOfDay } from '../lib/seed';
import { kcalOfDay } from '../lib/stats';
import type { Dish, DishItem, Food, MealKey } from '../lib/types';
import { addDays, dayKey, fmt, foodKcal, haptic, startOfWeek, unitLabel, weekdayShort } from '../lib/utils';

const MEALS: { key: MealKey; label: string; icon: IconName }[] = [
  { key: 'petitdej', label: 'Petit-déjeuner', icon: 'sun' },
  { key: 'dejeuner', label: 'Déjeuner', icon: 'bowl' },
  { key: 'collation', label: 'Collation', icon: 'cup' },
  { key: 'diner', label: 'Dîner', icon: 'moon' },
];

export const dishKcal = (d: Dish, foods: Food[]) =>
  d.items.reduce((t, it) => { const f = foods.find((x) => x.id === it.foodId); return t + (f ? foodKcal(f, it.qty) : 0); }, 0);

const itemLabel = (it: DishItem, foods: Food[]) => {
  const f = foods.find((x) => x.id === it.foodId);
  return f ? `${f.name} · ${fmt(it.qty)}${unitLabel(f)}` : '?';
};

export function Diet() {
  const { profile, meals, deleteMeal } = useStore();
  const [day, setDay] = useState(dayKey());
  const [open, setOpen] = useState<string | null>(null);
  const [addFor, setAddFor] = useState<MealKey | null>(null);
  const [showDishes, setShowDishes] = useState(false);
  const [scanFor, setScanFor] = useState<MealKey | 'library' | null>(null);

  const target = profile!.kcalTarget;
  const eaten = kcalOfDay(meals, day);
  const mon = startOfWeek(new Date(day));
  const dayMeals = meals.filter((m) => m.date === day);
  const isToday = day === dayKey();

  return (
    <div className="page screen-enter">
      <div className="between" style={{ alignItems: 'flex-start' }}>
        <h1 className="title">Ma diète,<br /><b>{isToday ? "aujourd'hui" : new Date(day).toLocaleDateString('fr-FR', { weekday: 'long' })}</b></h1>
        <p className="note note--right" style={{ marginTop: 6 }}>{phraseOfDay(9)}</p>
      </div>

      <div className="row" style={{ justifyContent: 'space-between', gap: 4 }}>
        {weekdayShort.map((w, i) => {
          const d = addDays(mon, i);
          const k = dayKey(d);
          const sel = k === day;
          return (
            <button key={k} className="press" onClick={() => { haptic(); setDay(k); }}
              style={{ width: 44, padding: '8px 0', borderRadius: 'var(--r-control)', border: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 11,
                background: sel ? 'var(--ink)' : 'transparent', color: sel ? '#d9d6ce' : 'var(--muted)', transition: 'background var(--d-base) var(--ease-out)' }}>
              {w}<b style={{ fontSize: 15, fontWeight: 600, color: sel ? '#fff' : 'var(--ink)' }}>{d.getDate()}</b>
            </button>
          );
        })}
      </div>

      <div className="card row" style={{ padding: 16, gap: 18 }}>
        <Ring value={eaten / target} label={`${Math.round((eaten / target) * 100)} %`} />
        <div className="stack" style={{ gap: 2 }}>
          <span className="cap">Calories {isToday ? 'du jour' : 'de la journée'}</span>
          <p className="value" style={{ fontSize: 28 }}><Bump value={eaten}>{fmt(eaten)}</Bump> <span className="unit">/ {fmt(target)}</span></p>
          <span className="badge" style={{ marginTop: 4 }}>{eaten <= target ? `Reste ${fmt(target - eaten)} kcal` : `+${fmt(eaten - target)} kcal`}</span>
        </div>
      </div>

      <div className="grid2">
        <button className="btn" style={{ height: 48 }} onClick={() => { haptic(); setScanFor('library'); }}><Icon name="barcode" size={18} />Scanner</button>
        <button className="btn btn--light" style={{ height: 48 }} onClick={() => { haptic(); setShowDishes(true); }}><Icon name="bowl" size={18} />Mes plats</button>
      </div>

      <div className="between">
        <h2 className="h2">Repas</h2>
        <span className="cap">{MEALS.filter((m) => dayMeals.some((x) => x.meal === m.key)).length} sur 4</span>
      </div>

      <div className="stack" style={{ gap: 12 }}>
        {MEALS.map((meal) => {
          const entries = dayMeals.filter((x) => x.meal === meal.key);
          const total = entries.reduce((t, e) => t + e.kcal, 0);
          return (
            <div key={meal.key} className="card card--list">
              <div className="list-row" style={{ padding: '12px 14px' }}>
                <span className={`tile ${entries.length ? '' : ''}`}><Icon name={meal.icon} size={18} /></span>
                <div className="grow"><p className="item-title">{meal.label}</p><span className="cap">{entries.length ? `${fmt(total)} kcal` : 'Rien pour l\'instant'}</span></div>
                <IconButton icon="plus" label={`Ajouter au ${meal.label}`} small onClick={() => setAddFor(meal.key)} />
              </div>
              {entries.map((e) => (
                <div key={e.id}>
                  <button className="list-row" onClick={() => { haptic(); setOpen(open === e.id ? null : e.id); }} style={{ padding: '10px 14px 10px 64px' }}>
                    <span className="grow"><span className="item-title" style={{ fontSize: 13, display: 'block' }}>{e.label}</span></span>
                    <span className="cap" style={{ color: 'var(--ink)', fontWeight: 600 }}>{fmt(e.kcal)}</span>
                    <span style={{ color: 'var(--muted)', display: 'flex', transform: open === e.id ? 'rotate(180deg)' : undefined, transition: 'transform var(--d-base) var(--ease-out)' }}><Icon name="down" size={14} stroke={2} /></span>
                  </button>
                  {open === e.id && (
                    <div className="screen-enter" style={{ padding: '0 14px 12px 64px' }}>
                      {e.detail && e.detail.split('\n').map((l, i) => <div key={i} className="cap" style={{ padding: '3px 0' }}>{l}</div>)}
                      <button className="link" style={{ color: 'var(--danger)', marginTop: 6 }} onClick={() => { haptic(20); deleteMeal(e.id); }}>Retirer</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <AddSheet meal={addFor} day={day} onClose={() => setAddFor(null)} onScan={(m) => { setAddFor(null); setScanFor(m); }} />
      <DishesSheet open={showDishes} onClose={() => setShowDishes(false)} />
      <ScanSheet target={scanFor} day={day} onClose={() => setScanFor(null)} />
    </div>
  );
}

/* ---------- Ajouter à un repas ---------- */
function AddSheet({ meal, day, onClose, onScan }: { meal: MealKey | null; day: string; onClose: () => void; onScan: (m: MealKey) => void }) {
  const { dishes, foods, addMeal } = useStore();
  const showToast = useUi((s) => s.showToast);
  const [tab, setTab] = useState<'plats' | 'aliments'>('plats');
  const [food, setFood] = useState<Food | null>(null);
  const [qty, setQty] = useState(100);
  const [newFood, setNewFood] = useState(false);

  useEffect(() => { if (meal) { setFood(null); setNewFood(false); setTab(dishes.length ? 'plats' : 'aliments'); } }, [meal, dishes.length]);
  if (!meal) return null;
  const label = MEALS.find((m) => m.key === meal)!.label;

  const addDish = (d: Dish) => {
    addMeal({ date: day, meal, label: d.name, kcal: Math.round(dishKcal(d, foods)), dishId: d.id, detail: d.items.map((it) => itemLabel(it, foods)).join('\n') });
    haptic(15); showToast(`${d.name} ajouté`); onClose();
  };
  const addFood = () => {
    if (!food) return;
    addMeal({ date: day, meal, label: food.name, kcal: Math.round(foodKcal(food, qty)), detail: `${fmt(qty)}${unitLabel(food)}` });
    haptic(15); showToast(`${food.name} ajouté`); onClose();
  };

  return (
    <Sheet open onClose={onClose} title={food ? food.name : newFood ? 'Nouvel aliment' : label}>
      {newFood ? (
        <FoodForm onSaved={(f) => { setNewFood(false); setFood(f); setQty(f.unit === 'pièce' ? 1 : 100); }} />
      ) : food ? (
        <>
          <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-control)', padding: 8 }}>
            <Stepper value={qty} onChange={setQty} step={food.unit === 'pièce' ? 1 : 10} min={food.unit === 'pièce' ? 1 : 5} max={2000} unit={food.unit === 'pièce' ? 'pièce' : food.unit} />
          </div>
          <div className="between"><span className="cap">Total</span><span className="badge"><Bump value={qty}>{fmt(foodKcal(food, qty))} kcal</Bump></span></div>
          <button className="btn" onClick={addFood}>Ajouter</button>
        </>
      ) : (
        <>
          <Segmented value={tab} onChange={setTab} options={[{ value: 'plats', label: 'Mes plats' }, { value: 'aliments', label: 'Aliments' }]} />
          {tab === 'plats' ? (
            dishes.length ? (
              <div className="card card--list">
                {dishes.map((d) => (
                  <button key={d.id} className="list-row" onClick={() => addDish(d)}>
                    <span className="grow"><span className="item-title" style={{ display: 'block' }}>{d.name}</span><span className="cap">{d.items.length} aliment{d.items.length > 1 ? 's' : ''}</span></span>
                    <span className="badge">{fmt(dishKcal(d, foods))} kcal</span>
                  </button>
                ))}
              </div>
            ) : <Empty>Crée tes plats et shakers depuis « Mes plats ».</Empty>
          ) : (
            foods.length ? (
              <div className="card card--list">
                {foods.map((f) => (
                  <button key={f.id} className="list-row" onClick={() => { haptic(); setFood(f); setQty(f.unit === 'pièce' ? 1 : 100); }}>
                    <span className="grow"><span className="item-title" style={{ display: 'block' }}>{f.name}</span><span className="cap">{f.kcal} kcal / {f.unit === 'pièce' ? 'pièce' : `100 ${f.unit}`}</span></span>
                    <Icon name="chevron" size={16} stroke={2} />
                  </button>
                ))}
              </div>
            ) : <Empty>Aucun aliment encore. Scanne un code-barres ou crée-le à la main.</Empty>
          )}
          <div className="grid2">
            <button className="btn btn--light" style={{ height: 44 }} onClick={() => onScan(meal)}><Icon name="barcode" size={18} />Scanner</button>
            <button className="btn btn--light" style={{ height: 44 }} onClick={() => setNewFood(true)}><Icon name="plus" size={18} />Aliment</button>
          </div>
        </>
      )}
    </Sheet>
  );
}

/* ---------- Création manuelle d'un aliment ---------- */
function FoodForm({ initial, onSaved }: { initial?: Partial<Food>; onSaved: (f: Food) => void }) {
  const upsertFood = useStore((s) => s.upsertFood);
  const [name, setName] = useState(initial?.name ?? '');
  const [unit, setUnit] = useState<Food['unit']>(initial?.unit ?? 'g');
  const [kcal, setKcal] = useState(initial?.kcal ?? 100);
  const save = () => {
    const f = { name: name.trim(), unit, kcal, brand: initial?.brand, barcode: initial?.barcode };
    const id = upsertFood(f);
    haptic(15);
    onSaved({ ...f, id });
  };
  return (
    <>
      <input className="input" placeholder="Nom de l'aliment" value={name} onChange={(e) => setName(e.target.value)} />
      <Segmented value={unit} onChange={setUnit} options={[{ value: 'g', label: 'Grammes' }, { value: 'ml', label: 'Millilitres' }, { value: 'pièce', label: 'À la pièce' }]} />
      <div className="card card--pad stack" style={{ gap: 6 }}>
        <span className="cap">Calories pour {unit === 'pièce' ? '1 pièce' : `100 ${unit}`}</span>
        <Stepper value={kcal} onChange={setKcal} step={5} max={2000} unit="kcal" />
      </div>
      <button className="btn" disabled={!name.trim()} onClick={save}>Enregistrer l'aliment</button>
    </>
  );
}

/* ---------- Scan code-barres ---------- */
function ScanSheet({ target, day, onClose }: { target: MealKey | 'library' | null; day: string; onClose: () => void }) {
  const { addMeal } = useStore();
  const showToast = useUi((s) => s.showToast);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'notfound' | 'error'>('idle');
  const [product, setProduct] = useState<OffProduct | null>(null);
  const [saved, setSaved] = useState<Food | null>(null);
  const [qty, setQty] = useState(100);

  const lookup = async (c: string) => {
    setStatus('loading');
    try {
      const p = await fetchByBarcode(c);
      if (p) { haptic(25); setProduct(p); setStatus('idle'); } else setStatus('notfound');
    } catch { setStatus('error'); }
  };

  useEffect(() => {
    if (!target) { setProduct(null); setSaved(null); setCode(''); setStatus('idle'); return; }
    if (!canScan() || product) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stop = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (stop || !videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        // @ts-expect-error BarcodeDetector n'est pas encore typé
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
        const tick = async () => {
          if (stop || !videoRef.current) return;
          const found = await detector.detect(videoRef.current).catch(() => []);
          if (found[0]?.rawValue) { setCode(found[0].rawValue); lookup(found[0].rawValue); return; }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch { /* caméra refusée : saisie manuelle */ }
    })();
    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, product]);

  if (!target) return null;

  return (
    <Sheet open onClose={onClose} title={saved ? saved.name : product ? 'Produit trouvé' : 'Scanner un aliment'}>
      {saved ? (
        target === 'library' ? null : (
          <>
            <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-control)', padding: 8 }}>
              <Stepper value={qty} onChange={setQty} step={10} min={5} max={2000} unit={saved.unit} />
            </div>
            <div className="between"><span className="cap">Total</span><span className="badge">{fmt(foodKcal(saved, qty))} kcal</span></div>
            <button className="btn" onClick={() => {
              addMeal({ date: day, meal: target, label: saved.name, kcal: Math.round(foodKcal(saved, qty)), detail: `${fmt(qty)}${unitLabel(saved)}` });
              haptic(15); showToast(`${saved.name} ajouté`); onClose();
            }}>Ajouter au repas</button>
          </>
        )
      ) : product ? (
        <FoodForm initial={{ name: product.brand ? `${product.name} (${product.brand})` : product.name, kcal: product.kcal100 ?? 100, unit: 'g', barcode: product.barcode, brand: product.brand }}
          onSaved={(f) => {
            showToast('Aliment enregistré');
            if (target === 'library') onClose(); else { setSaved(f); setQty(100); }
          }} />
      ) : (
        <>
          {canScan() ? (
            <div className="photo" style={{ height: 200, position: 'relative', background: 'var(--ink)' }}>
              <video ref={videoRef} muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', left: '15%', right: '15%', top: '50%', height: 2, background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)', animation: 'scan 1.6s ease-in-out infinite alternate' }} />
              <style>{'@keyframes scan { from { transform: translateY(-50px); } to { transform: translateY(50px); } }'}</style>
            </div>
          ) : (
            <p className="sub" style={{ margin: 0 }}>Ton navigateur ne sait pas lire les codes-barres avec la caméra. Tape les chiffres sous le code.</p>
          )}
          <div className="row">
            <input className="input" inputMode="numeric" placeholder="Code-barres (ex. 3017620422003)" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
            <IconButton icon="search" label="Chercher" onClick={() => code.length >= 8 && lookup(code)} />
          </div>
          {status === 'loading' && <span className="cap">Recherche dans Open Food Facts…</span>}
          {status === 'notfound' && <span className="cap">Produit introuvable. Tu peux le créer à la main depuis un repas.</span>}
          {status === 'error' && <span className="cap">Pas de connexion. Réessaie plus tard.</span>}
        </>
      )}
    </Sheet>
  );
}

/* ---------- Mes plats ---------- */
function DishesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dishes, foods, deleteDish } = useStore();
  const [editing, setEditing] = useState<Dish | 'new' | null>(null);
  useEffect(() => { if (!open) setEditing(null); }, [open]);
  if (!open) return null;
  return (
    <Sheet open onClose={onClose} title={editing ? (editing === 'new' ? 'Nouveau plat' : editing.name) : 'Mes plats'}>
      {editing ? (
        <DishEditor dish={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />
      ) : (
        <>
          {dishes.length ? (
            <div className="card card--list">
              {dishes.map((d) => (
                <div key={d.id} className="list-row">
                  <button className="grow press" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => setEditing(d)}>
                    <span className="item-title" style={{ display: 'block' }}>{d.name}</span>
                    <span className="cap">{d.items.map((it) => foods.find((f) => f.id === it.foodId)?.name).filter(Boolean).join(', ')}</span>
                  </button>
                  <span className="badge">{fmt(dishKcal(d, foods))} kcal</span>
                  <IconButton icon="trash" label={`Supprimer ${d.name}`} small onClick={() => { haptic(20); deleteDish(d.id); }} />
                </div>
              ))}
            </div>
          ) : <Empty>Un plat ou un shaker = une liste d'aliments avec leurs quantités. Le total se calcule tout seul.</Empty>}
          <button className="btn" onClick={() => setEditing('new')}><Icon name="plus" size={18} />Créer un plat</button>
        </>
      )}
    </Sheet>
  );
}

function DishEditor({ dish, onDone }: { dish: Dish | null; onDone: () => void }) {
  const { foods, saveDish } = useStore();
  const showToast = useUi((s) => s.showToast);
  const [name, setName] = useState(dish?.name ?? '');
  const [items, setItems] = useState<DishItem[]>(dish?.items ?? []);
  const [picking, setPicking] = useState(false);
  const [creating, setCreating] = useState(false);
  const total = items.reduce((t, it) => { const f = foods.find((x) => x.id === it.foodId); return t + (f ? foodKcal(f, it.qty) : 0); }, 0);

  if (creating) return <FoodForm onSaved={(f) => { setCreating(false); setItems([...items, { foodId: f.id, qty: f.unit === 'pièce' ? 1 : 100 }]); }} />;

  return (
    <>
      <input className="input" placeholder="Nom (ex. Shaker post-séance)" value={name} onChange={(e) => setName(e.target.value)} />
      {items.length > 0 && (
        <div className="card card--list">
          {items.map((it, i) => {
            const f = foods.find((x) => x.id === it.foodId);
            if (!f) return null;
            return (
              <div key={i} className="list-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <div className="between"><span className="item-title" style={{ fontSize: 13 }}>{f.name}</span><span className="cap">{fmt(foodKcal(f, it.qty))} kcal</span></div>
                <div className="row">
                  <div className="grow"><Stepper value={it.qty} step={f.unit === 'pièce' ? 1 : 10} min={1} max={2000} unit={f.unit} onChange={(q) => setItems(items.map((x, j) => (j === i ? { ...x, qty: q } : x)))} /></div>
                  <IconButton icon="trash" label="Retirer" small onClick={() => setItems(items.filter((_, j) => j !== i))} />
                </div>
              </div>
            );
          })}
          <div className="list-row" style={{ justifyContent: 'space-between' }}><span className="item-title">Total</span><span className="badge"><Bump value={Math.round(total)}>{fmt(total)} kcal</Bump></span></div>
        </div>
      )}
      {picking ? (
        <div className="card card--list">
          {foods.map((f) => (
            <button key={f.id} className="list-row" onClick={() => { haptic(); setItems([...items, { foodId: f.id, qty: f.unit === 'pièce' ? 1 : 100 }]); setPicking(false); }}>
              <span className="item-title grow">{f.name}</span><span className="cap">{f.kcal} kcal</span>
            </button>
          ))}
          <button className="list-row" onClick={() => { setPicking(false); setCreating(true); }}><Icon name="plus" size={16} /><span className="item-title">Nouvel aliment</span></button>
        </div>
      ) : (
        <button className="btn btn--light" onClick={() => (foods.length ? setPicking(true) : setCreating(true))}><Icon name="plus" size={18} />Ajouter un aliment</button>
      )}
      <button className="btn" disabled={!name.trim() || !items.length} onClick={() => { saveDish({ id: dish?.id, name: name.trim(), items }); haptic(20); showToast('Plat enregistré'); onDone(); }}>Enregistrer le plat</button>
    </>
  );
}
