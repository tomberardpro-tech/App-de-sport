import { useEffect, useState } from 'react';
import { BottomNav, Toaster } from './ds/components';
import { useStore } from './lib/store';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Machines } from './screens/Machines';
import { MachineDetail } from './screens/MachineDetail';
import { Diet } from './screens/Diet';
import { History } from './screens/History';
import { Settings } from './screens/Settings';

export type Tab = 'home' | 'machines' | 'diet' | 'history' | 'settings';
export interface Route { tab: Tab; machineId?: string }
export type Nav = (r: Route) => void;

export default function App() {
  const hasProfile = useStore((s) => !!s.profile);
  const [route, setRoute] = useState<Route>({ tab: 'home' });

  const nav: Nav = (r) => {
    window.history.pushState(r, '');
    setRoute(r);
    window.scrollTo({ top: 0 });
  };

  // Bouton « retour » du téléphone
  useEffect(() => {
    window.history.replaceState({ tab: 'home' }, '');
    const onPop = (e: PopStateEvent) => setRoute((e.state as Route) ?? { tab: 'home' });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (!hasProfile) return <><Onboarding /><Toaster /></>;

  const back = () => window.history.back();
  let screen;
  if (route.tab === 'machines' && route.machineId) screen = <MachineDetail key={route.machineId} id={route.machineId} onBack={back} />;
  else if (route.tab === 'machines') screen = <Machines nav={nav} />;
  else if (route.tab === 'diet') screen = <Diet />;
  else if (route.tab === 'history') screen = <History nav={nav} />;
  else if (route.tab === 'settings') screen = <Settings onBack={back} />;
  else screen = <Home nav={nav} />;

  const showNav = !route.machineId && route.tab !== 'settings';

  return (
    <>
      <div key={route.tab + (route.machineId ?? '')}>{screen}</div>
      {showNav && <BottomNav tab={route.tab} onTab={(t) => nav({ tab: t })} />}
      <Toaster />
    </>
  );
}
