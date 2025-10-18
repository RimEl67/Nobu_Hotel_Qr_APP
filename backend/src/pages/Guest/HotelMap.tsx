// src/pages/Guest/HotelMap.tsx
import React, { useMemo, useState } from 'react';
import {
  MapPin,
  Navigation as NavigationIcon,
  Phone,
  Clock,
  Wifi,
  Car,
  Dumbbell,
  Martini,
  Utensils,
  Bath,
  Trees,
  ArrowRight,
  Info,
  Building2,
} from 'lucide-react';
import Card from '../../components/UI/Card';
import BackButton from '../../components/UI/BackButton';
import Navigation from '../../components/Layout/Navigation';

/* ----------------------------- Types & utils ----------------------------- */
type Category = 'service' | 'leisure';
type Floor = 'B1' | 'GF' | 'L1' | 'L2' | 'L3';

interface MapLocation {
  id: string;
  name: string;
  description: string;
  floor: Floor;
  category: Category;
  icon: React.ReactNode;
  coordinates: { x: number; y: number }; // % in the svg viewBox
  phone?: string;
  image?: string;
  externalUrl?: string; // e.g., spa menu or restaurant page
}

const floors: { key: Floor; label: string }[] = [
  { key: 'B1', label: 'Sous-sol' },
  { key: 'GF', label: 'Rez-de-chaussée' },
  { key: 'L1', label: 'Etage 1' },
  { key: 'L2', label: 'Etage 2' },
  { key: 'L3', label: 'Etage 3' },
];

const gmapsUrl = (q: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

/* ----------------------------- Mocked content ---------------------------- */
const ALL_LOCATIONS: MapLocation[] = [
  {
    id: 'reception',
    name: 'Réception',
    description: 'Accueil & services clients 24/7',
    floor: 'GF',
    category: 'service',
    icon: <Phone className="text-sky-600" size={18} />,
    coordinates: { x: 50, y: 82 },
    phone: '0',
    image:
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'restaurant',
    name: 'Restaurant Nobu',
    description: 'Cuisine japonaise fusion',
    floor: 'GF',
    category: 'leisure',
    icon: <Utensils className="text-orange-600" size={18} />,
    coordinates: { x: 26, y: 60 },
    image:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bar',
    name: 'Rooftop Bar',
    description: 'Cocktails & vue panoramique',
    floor: 'L3',
    category: 'leisure',
    icon: <Martini className="text-fuchsia-600" size={18} />,
    coordinates: { x: 72, y: 22 },
    image:
      'data:image/jpeg;base64,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',
  },
  {
    id: 'spa',
    name: 'Spa & Wellness',
    description: 'Soins, massages & détente',
    floor: 'L2',
    category: 'leisure',
    icon: <Bath className="text-emerald-600" size={18} />,
    coordinates: { x: 78, y: 38 },
    externalUrl: '#',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'fitness',
    name: 'Centre de Fitness',
    description: 'Ouvert 24/7 • équipements modernes',
    floor: 'L2',
    category: 'service',
    icon: <Dumbbell className="text-violet-600" size={18} />,
    coordinates: { x: 84, y: 28 },
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'garden',
    name: 'Jardin & Piscine',
    description: 'Piscine extérieure, transats & jardins',
    floor: 'L1',
    category: 'leisure',
    icon: <Trees className="text-emerald-700" size={18} />,
    coordinates: { x: 32, y: 35 },
    image:
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'parking',
    name: 'Parking Privé',
    description: 'Parking client sécurisé',
    floor: 'B1',
    category: 'service',
    icon: <Car className="text-slate-600" size={18} />,
    coordinates: { x: 60, y: 88 },
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80',
  },
];

/* --------------------------------- View ---------------------------------- */
const HotelMap: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<Floor>('GF');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [selected, setSelected] = useState<MapLocation | null>(null);

  const locations = useMemo(() => {
    return ALL_LOCATIONS.filter(
      (l) => l.floor === selectedFloor && (categoryFilter === 'all' || l.category === categoryFilter)
    );
  }, [selectedFloor, categoryFilter]);

  const hotelInfo = [
    { icon: <MapPin size={16} />, label: 'Adresse', value: 'Avenue Mohammed VI, Marrakech' },
    { icon: <Phone size={16} />, label: 'Téléphone', value: '+212 524 42 46 00' },
    { icon: <Wifi size={16} />, label: 'Wi-Fi', value: 'NobuGuest_Free' },
    { icon: <Clock size={16} />, label: 'Check-out', value: '12:00 PM' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-24 lg:pb-0">
      {/* HERO */}
      <div className="relative mb-8">
        <div className="h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-b-3xl">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"
            alt="Hotel overview"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 rounded-b-3xl bg-gradient-to-b from-black/10 via-black/20 to-black/40" />
        <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <BackButton to="/dashboard" />
              <h1 className="text-2xl sm:text-3xl font-semibold drop-shadow">Plan de l’Hôtel</h1>
            </div>
            <p className="opacity-95">Découvrez nos espaces et services</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-white/90">
            <Building2 size={18} />
            <span className="text-sm">Nobu Hotel • Marrakech</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
            {floors.map((f) => {
              const active = f.key === selectedFloor;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setSelectedFloor(f.key);
                    setSelected(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    active ? 'bg-sky-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
            {([
              { key: 'all', label: 'Tous' },
              { key: 'service', label: 'Services' },
              { key: 'leisure', label: 'Loisirs' },
            ] as const).map((f) => {
              const active = f.key === categoryFilter;
              return (
                <button
                  key={f.key}
                  onClick={() => {
                    setCategoryFilter(f.key);
                    setSelected(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    active ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <div className="relative h-[460px] md:h-[540px] bg-gradient-to-br from-orange-100 to-blue-100">
                {/* Building schema (SVG) */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                  {/* outer shape */}
                  <rect x="8" y="18" width="84" height="64" rx="3" fill="#ffffff" stroke="#e5e7eb" />
                  {/* grid rooms */}
                  {Array.from({ length: 6 }, (_, i) => {
                    const cx = 14 + (i % 3) * 28;
                    const cy = 24 + Math.floor(i / 3) * 28;
                    return (
                      <rect
                        key={i}
                        x={cx}
                        y={cy}
                        width="22"
                        height="22"
                        rx="2"
                        fill="#f9fafb"
                        stroke="#eef2f7"
                      />
                    );
                  })}
                </svg>

                {/* Markers */}
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelected(loc)}
                    className={`group absolute -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lg border-2 flex items-center justify-center transition
                                ${selected?.id === loc.id ? 'border-sky-600 scale-110' : 'border-orange-500 hover:scale-110'}`}
                    style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                    aria-label={loc.name}
                  >
                    {loc.icon}
                    {/* tooltip */}
                    <span className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900/90 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
                      {loc.name}
                    </span>
                  </button>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 text-xs text-gray-700 shadow">
                  <div className="font-semibold text-gray-900 mb-2">Légende</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-orange-500" />
                      Services
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-emerald-500" />
                      Loisirs
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected location */}
            <Card>
              {!selected ? (
                <div className="text-sm text-gray-600">
                  Sélectionnez un point sur le plan pour afficher les détails.
                </div>
              ) : (
                <div className="space-y-3">
                  {selected.image && (
                    <div className="h-40 w-full overflow-hidden rounded-lg">
                      <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    {selected.icon}
                    <div>
                      <h3 className="font-semibold text-gray-900">{selected.name}</h3>
                      <div className="text-xs text-gray-500">{floors.find(f => f.key === selected.floor)?.label}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{selected.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={gmapsUrl('Nobu Hotel Marrakech')}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-700 hover:bg-orange-100"
                    >
                      <NavigationIcon size={16} /> Itinéraire
                    </a>
                    <a
                      href={`tel:${selected.phone ?? '0'}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
                    >
                      <Phone size={16} /> Appeler
                    </a>
                  </div>

                  {selected.externalUrl && (
                    <a
                      href={selected.externalUrl}
                      className="inline-flex items-center gap-1 text-sm text-sky-700 hover:text-sky-900"
                    >
                      Plus d’infos <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              )}
            </Card>

            {/* Practical info */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-3">Informations pratiques</h3>
              <div className="space-y-2">
                {hotelInfo.map((row, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="text-orange-600">{row.icon}</div>
                    <div>
                      <span className="text-gray-600">{row.label} :</span>
                      <span className="ml-2 font-medium text-gray-900">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Help */}
            <Card>
              <div className="flex items-start gap-3">
                <Info className="text-emerald-600" size={18} />
                <div className="text-sm text-gray-700">
                  Besoin d’aide ? Composez <a href="tel:0" className="text-sky-700 hover:underline">0</a> depuis le
                  téléphone de la chambre, notre équipe est disponible 24/7.
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default HotelMap;