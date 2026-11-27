import { useState } from 'react';
import { IconButton, Ruler, Segmented, Stepper, Steps, Title } from '../ds/components';
import { Icon, type IconName } from '../ds/Icon';
import { useStore } from '../lib/store';
import type { Goal, Sex } from '../lib/types';
import { computeKcal, fmt, goalAdjust, goalLabel, haptic, weekdayLetter } from '../lib/utils';

const GOALS: { id: Goal; icon: IconName; title: string; sub: string }[] = [
  { id: 'masse', icon: 'trend', title: 'Prendre du muscle', sub: 'Prise de masse · léger surplus' },
  { id: 'seche', icon: 'flame', title: 'Perdre du gras', sub: 'Sèche · léger déficit' },
  { id: 'maintien', icon: 'balance', title: 'Rester en forme', sub: 'Maintien · ni plus ni moins' },
];

export function Onboarding() {
  const setProfile = useStore((s) => s.setProfile);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goalChoice, setGoal] = useState<Goal | null>(null);
  const goal: Goal = goalChoice ?? 'maintien';
  const [weight, setWeight] = useState(72);
  const [height, setHeight] = useState(178);
  const [age, setAge] = useState(27);
  const [sex, setSex] = useState<Sex>('H');
  const [countChoice, setCount] = useState<number | null>(null);
  const count = countChoice ?? 0;
  const [days, setDays] = useState([false, false, false, false, false, false, false]);

  const picked = days.filter(Boolean).length;
  const kcal = computeKcal({ weight, height, age, sex, sessionsPerWeek: count || 3, goal });
  const next = () => { haptic(); setStep((s) => s + 1); };

  const finish = () => {
    haptic(20);
    setProfile({ name: name.trim(), goal, weight, height, age, sex, sessionsPerWeek: count, days, kcalTarget: kcal });
  };

  const header = (
    <div className="row" style={{ height: 44, gap: 14 }}>
      {step > 1 && step < 5 && <IconButton icon="back" label="Retour" onClick={() => setStep((s) => s - 1)} />}
      <Steps total={5} current={step} done={step === 5} />
      <span className="cap">{step} / 5</span>
    </div>
  );

  return (
    <div className="page page--flow" key={step}>
      {header}

      {step === 1 && (
        <div className="stack stagger" style={{ gap: 18, marginTop: 12 }}>
          <Title light="Salut," bold="on fait connaissance ?" sub="5 petites questions, moins d'une minute." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="prenom" className="cap">Comment tu t'appelles ?</label>
            <input id="prenom" className="input" placeholder="Ton prénom" value={name} autoComplete="given-name"
              onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) next(); }} />
            <div className="row" style={{ justifyContent: 'flex-end', alignItems: 'flex-start', gap: 4, margin: '2px 12px 0 0' }}>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M31 25 C20 27 9 23 8 5" /><path d="M4 9 L8 4 L12 8" />
              </svg>
              <p className="note note--right" style={{ marginTop: 9 }}>tout commence ici</p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack stagger" style={{ gap: 18, marginTop: 12 }}>
          <Title light="Quel est" bold="ton objectif ?" sub="On adapte ta cible de calories en fonction." note={'tu pourras\nchanger d\'avis'} />
          <div className="stack">
            {GOALS.map((g) => {
              const on = goalChoice === g.id;
              return (
                <button key={g.id} className="option press" aria-pressed={on} onClick={() => { haptic(); setGoal(g.id); }}>
                  <span className="tile"><Icon name={g.icon} /></span>
                  <span className="grow"><span className="item-title" style={{ display: 'block', fontSize: 15 }}>{g.title}</span><span className="cap">{g.sub}</span></span>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${on ? 'var(--ink)' : 'var(--line-soft)'}`, background: on ? 'var(--ink)' : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all var(--d-base) var(--ease-out)' }}>
                    {on && <span className="pop" style={{ display: 'flex' }}><Icon name="check" size={12} stroke={3.5} /></span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="stack stagger" style={{ gap: 16, marginTop: 12 }}>
          <Title light="Parle-moi" bold="un peu de toi" sub="Pour estimer tes besoins en calories." note={'ça reste\nsur ton téléphone'} />
          <div className="card" style={{ padding: '14px 16px' }}>
            <span className="cap">Poids</span>
            <Stepper big value={weight} onChange={setWeight} min={30} max={250} unit="kg" />
          </div>
          <div className="card" style={{ padding: '14px 16px' }}>
            <span className="cap">Taille</span>
            <Stepper big value={height} onChange={setHeight} min={120} max={230} unit="cm" />
            <div style={{ marginTop: 8 }}><Ruler value={height} onChange={setHeight} min={120} max={230} label="Taille en centimètres" /></div>
          </div>
          <div className="grid2">
            <div className="card card--pad stack" style={{ gap: 8 }}>
              <span className="cap">Âge</span>
              <Stepper value={age} onChange={setAge} min={12} max={99} />
            </div>
            <div className="card card--pad stack" style={{ gap: 8 }}>
              <span className="cap">Sexe</span>
              <Segmented value={sex} onChange={setSex} options={[{ value: 'H', label: 'Homme' }, { value: 'F', label: 'Femme' }]} />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="stack stagger" style={{ gap: 18, marginTop: 12 }}>
          <Title light="Combien de séances" bold="par semaine ?" sub="Un bon objectif, c'est celui qu'on tient." />
          <div className="row" style={{ gap: 8 }}>
            {[2, 3, 4, 5, 6].map((v) => (
              <button key={v} className={`card num-btn ${v === countChoice ? 'is-selected' : ''}`} style={{ flex: 1, height: 56, borderRadius: 'var(--r-control)', fontSize: 20, fontWeight: 600 }}
                onClick={() => {
                  haptic(); setCount(v);
                  if (picked > v) { let extra = picked - v; setDays(days.slice().reverse().map((d) => (d && extra-- > 0 ? false : d)).reverse()); }
                }}>{v}</button>
            ))}
          </div>
          <div className="stack" style={{ gap: 10, marginTop: 8 }}>
            <div className="between">
              <p className="item-title">Quels jours ?</p>
              <span className="cap">{count ? `${picked} / ${count} choisis` : 'optionnel'}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              {weekdayLetter.map((l, i) => (
                <button key={i} className={`card day-btn ${days[i] ? 'is-selected' : ''}`} style={{ flex: 1, height: 44, borderRadius: 'var(--r-control)', fontSize: 13, fontWeight: 500 }}
                  onClick={() => {
                    if (!days[i] && count && picked >= count) { haptic(30); return; }
                    haptic(); const n = days.slice(); n[i] = !n[i]; setDays(n);
                  }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="stack stagger" style={{ gap: 18 }}>
          <div className="row pop" style={{ justifyContent: 'center', marginTop: 28 }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={28} stroke={2.5} />
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <p className="note note--right" style={{ position: 'absolute', right: 2, top: 2 }}>{'tout reste\nmodifiable'}</p>
            <h1 className="title">Ton plan<br /><b>est prêt.</b></h1>
            <p className="sub">Calculé à partir de tes réponses.</p>
          </div>
          <div className="card stack" style={{ padding: 16, gap: 6 }}>
            <span className="cap">Cible quotidienne</span>
            <p className="value value--big">{fmt(kcal)} <span className="unit">kcal</span></p>
            <span className="badge">{goalAdjust[goal]}</span>
          </div>
          <div className="card card--list">
            <div className="list-row" style={{ justifyContent: 'space-between', padding: '14px 16px' }}><span className="cap">Objectif</span><span className="item-title">{goalLabel[goal]}</span></div>
            <div className="list-row" style={{ justifyContent: 'space-between', padding: '14px 16px' }}><span className="cap">Rythme</span><span className="item-title">{count} séances / semaine</span></div>
            <div className="list-row" style={{ justifyContent: 'space-between', padding: '14px 16px' }}><span className="cap">Jours</span><span className="item-title">{weekdayLetter.filter((_, i) => days[i]).join(' · ') || '—'}</span></div>
          </div>
        </div>
      )}

      <div className="push">
        {step === 1 && (
          <button className="btn" disabled={!name.trim()} onClick={next}>C'est parti <Icon name="chevron" size={16} stroke={2} /></button>
        )}
        {step === 2 && <button className="btn" disabled={!goalChoice} onClick={next}>Continuer</button>}
        {step === 3 && <button className="btn" onClick={next}>Continuer</button>}
        {step === 4 && <button className="btn" disabled={!countChoice} onClick={next}>Voir mon plan</button>}
        {step === 5 && <button className="btn" onClick={finish}>Découvrir mon tableau de bord</button>}
      </div>
    </div>
  );
}
