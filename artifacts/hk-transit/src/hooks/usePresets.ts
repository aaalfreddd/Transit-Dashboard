import { useState, useEffect } from 'react';

export interface BusPreset {
  id: string;
  stopId: string;
  route: string;
  direction: string;
  serviceType: string;
}

export interface MtrPreset {
  id: string;
  line: string;
  station: string;
}

const DEFAULT_BUS_ROUTES: BusPreset[] = [
  { id: '271-E010S0200', route: '271', stopId: 'E010S0200', direction: 'outbound', serviceType: '1' },
  { id: '970-E010E0050', route: '970', stopId: 'E010E0050', direction: 'outbound', serviceType: '1' },
  { id: '11-E010S0100', route: '11', stopId: 'E010S0100', direction: 'inbound', serviceType: '1' }
];

const DEFAULT_MTR_STATIONS: MtrPreset[] = [
  { id: 'TML-TIS', line: 'TML', station: 'TIS' },
  { id: 'TWL-TSW', line: 'TWL', station: 'TSW' },
  { id: 'KTL-KOT', line: 'KTL', station: 'KOT' }
];

export function usePresets() {
  const [busPresets, setBusPresets] = useState<BusPreset[]>([]);
  const [mtrPresets, setMtrPresets] = useState<MtrPreset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedBus = localStorage.getItem('hk_transit_bus_presets');
      const storedMtr = localStorage.getItem('hk_transit_mtr_presets');

      if (storedBus) setBusPresets(JSON.parse(storedBus));
      else setBusPresets(DEFAULT_BUS_ROUTES);

      if (storedMtr) setMtrPresets(JSON.parse(storedMtr));
      else setMtrPresets(DEFAULT_MTR_STATIONS);
    } catch (e) {
      setBusPresets(DEFAULT_BUS_ROUTES);
      setMtrPresets(DEFAULT_MTR_STATIONS);
    }
    setIsLoaded(true);
  }, []);

  const addBusPreset = (preset: Omit<BusPreset, 'id'>) => {
    const newPreset = { ...preset, id: `${preset.route}-${preset.stopId}-${Date.now()}` };
    const updated = [...busPresets, newPreset];
    setBusPresets(updated);
    localStorage.setItem('hk_transit_bus_presets', JSON.stringify(updated));
  };

  const removeBusPreset = (id: string) => {
    const updated = busPresets.filter(p => p.id !== id);
    setBusPresets(updated);
    localStorage.setItem('hk_transit_bus_presets', JSON.stringify(updated));
  };

  const addMtrPreset = (preset: Omit<MtrPreset, 'id'>) => {
    const newPreset = { ...preset, id: `${preset.line}-${preset.station}-${Date.now()}` };
    const updated = [...mtrPresets, newPreset];
    setMtrPresets(updated);
    localStorage.setItem('hk_transit_mtr_presets', JSON.stringify(updated));
  };

  const removeMtrPreset = (id: string) => {
    const updated = mtrPresets.filter(p => p.id !== id);
    setMtrPresets(updated);
    localStorage.setItem('hk_transit_mtr_presets', JSON.stringify(updated));
  };

  return {
    busPresets,
    mtrPresets,
    isLoaded,
    addBusPreset,
    removeBusPreset,
    addMtrPreset,
    removeMtrPreset
  };
}
