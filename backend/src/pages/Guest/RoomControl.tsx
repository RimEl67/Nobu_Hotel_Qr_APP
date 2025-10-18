// src/pages/Guest/RoomInformation.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Phone,
  Utensils,
  Wifi,
  MapPin,
  Info,
  Users,
  Car,
  Dumbbell,
  Coffee,
  Waves,
  Shirt,
  BedDouble,
  CalendarRange,
  KeyRound,
  Copy,
  ArrowRight,
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import BackButton from '../../components/UI/BackButton';
import Navigation from '../../components/Layout/Navigation';
import { useAuth } from '../../contexts/AuthContext';

const RoomInformation: React.FC = () => {
  const { user } = useAuth();

  // --------- DATA ---------
  const roomDetails = [
    { label: 'Room Number', value: user?.roomNumber || '1205', icon: <KeyRound size={18} className="text-sky-600" /> },
    { label: 'Guests', value: '2 Adults', icon: <Users size={18} className="text-emerald-600" /> },
    { label: 'Check-in', value: 'January 15, 2025', icon: <CalendarRange size={18} className="text-violet-600" /> },
    { label: 'Check-out', value: 'January 18, 2025', icon: <Clock size={18} className="text-blue-600" /> },
  ];

  const hotelInfo = [
    {
      title: 'Check-out Time',
      value: '12:00 PM',
      icon: <Clock className="text-blue-600" size={24} />,
      description: 'Late check-out available upon request.',
    },
    {
      title: 'Concierge',
      value: 'Available 24/7',
      icon: <Phone className="text-green-600" size={24} />,
      description: 'Dial 0 from your room phone.',
      action: { label: 'Call Concierge', href: 'tel:0' },
    },
    {
      title: 'Room Service',
      value: 'Until 11:00 PM',
      icon: <Utensils className="text-orange-600" size={24} />,
      description: 'Full menu available in your room.',
    },
    {
      title: 'Wi-Fi Network',
      value: 'NobuGuest_Free',
      icon: <Wifi className="text-purple-600" size={24} />,
      description: 'High-speed complimentary internet.',
      copy: 'NobuGuest_Free',
    },
  ];

  const hotelAmenities = [
    { name: 'Spa & Wellness', icon: <Waves size={18} />, color: 'text-sky-600', hours: '6:00 AM – 10:00 PM', location: 'Ground Floor' },
    { name: 'Fitness Center', icon: <Dumbbell size={18} />, color: 'text-rose-600', hours: '24/7 Access', location: '2nd Floor' },
    { name: 'Restaurant', icon: <Coffee size={18} />, color: 'text-amber-600', hours: '6:00 AM – 11:00 PM', location: 'Lobby Level' },
    { name: 'Valet Parking', icon: <Car size={18} />, color: 'text-slate-600', hours: '24/7 Service', location: 'Main Entrance' },
    { name: 'Laundry Service', icon: <Shirt size={18} />, color: 'text-indigo-600', hours: '7:00 AM – 9:00 PM', location: 'Same-day service' },
    { name: 'Business Center', icon: <Users size={18} />, color: 'text-emerald-600', hours: '24/7 Access', location: 'Lobby Level' },
  ];

  const emergencyContacts = [
    { service: 'Front Desk', number: '0' },
    { service: 'Concierge', number: '2' },
    { service: 'Room Service', number: '3' },
    { service: 'Housekeeping', number: '4' },
    { service: 'Emergency', number: '911' },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      /* no-op */
    }
  };

  // --------- UI ---------
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-24 lg:pb-0">
      {/* HERO */}
      <div className="relative mb-8">
        <div className="h-48 sm:h-56 md:h-64 w-full overflow-hidden rounded-b-3xl">
          <img
            src="https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1920&q=80"
            alt="Room hero"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40 rounded-b-3xl" />
        <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-2">
              <BackButton to="/dashboard" />
              <h1 className="text-2xl sm:text-3xl font-semibold drop-shadow">Room Information</h1>
            </div>
            <p className="opacity-95">Room {user?.roomNumber || '1205'} • Nobu Hotel</p>
          </div>
          <div className="hidden sm:flex gap-2">
            
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm backdrop-blur">
              Non-Smoking
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* ===== QUICK ACTIONS (modifié : 2 boutons, centrés, sans asChild) ===== */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          {/* Request Service */}
          <Link to="/dashboard/services" className="w-full sm:w-auto">
            <Button className="w-full sm:min-w-[220px] justify-center" size="lg" variant="primary">
              <Utensils size={18} className="mr-2" /> Request Service
            </Button>
          </Link>

          {/* Call Concierge */}
          <a href="tel:0" className="w-full sm:w-auto">
            <Button className="w-full sm:min-w-[220px] justify-center" size="lg" variant="outline">
              <Phone size={18} className="mr-2" /> Call Concierge
            </Button>
          </a>
        </div>

        {/* ROOM DETAILS */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="text-sky-600" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">Your Room Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {roomDetails.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  {d.icon}
                  <span>{d.label}</span>
                </div>
                <span className="font-medium text-gray-900">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* HOTEL INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {hotelInfo.map((info, index) => (
            <Card key={index}>
              <div className="flex items-start gap-4">
                {info.icon}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">{info.title}</h3>
                    {info.action && (
                      <a
                        href={info.action.href}
                        className="text-sm text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                      >
                        {info.action.label} <ArrowRight size={14} />
                      </a>
                    )}
                  </div>
                  <p className="text-xl font-bold text-gray-900 mt-1">{info.value}</p>
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>

                  {/* Wi-Fi copy */}
                  {'copy' in info && (info as any).copy && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard((info as any).copy)}
                      className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100"
                      title="Copy SSID"
                    >
                      <Copy size={14} /> Copy Network
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* AMENITIES */}
        <Card className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-emerald-600" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">Hotel Amenities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotelAmenities.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <div className={`${a.color}`}>{a.icon}</div>
                <div>
                  <div className="font-medium text-gray-900">{a.name}</div>
                  <div className="text-sm text-gray-600">{a.hours}</div>
                  <div className="text-xs text-gray-500">{a.location}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CONTACTS */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Phone className="text-red-600" size={22} />
            <h2 className="text-lg font-semibold text-gray-900">Important Contacts</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {emergencyContacts.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <span className="text-gray-700">{c.service}</span>
                {/* On garde ton style existant ici (asChild toléré si ton <Button> le supporte).
                    Si jamais ça te refait une erreur, remplace par:
                    <a href={`tel:${c.number}`} className="px-3 py-1.5 rounded-lg border text-sm font-mono">...</a>
                */}
                <Button size="sm" variant="outline" className="font-mono font-bold">
                  <a href={`tel:${c.number}`}>{c.number}</a>
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-sky-50 rounded-xl text-sky-900 text-sm">
            <strong>Note:</strong> All internal numbers can be dialed directly from your room phone. For external
            calls, dial 9 first.
          </div>
        </Card>

        {/* Simple anchor for “View Map” quick action */}
        <div id="map" className="h-10" />
      </div>

      <Navigation />
    </div>
  );
};

export default RoomInformation;