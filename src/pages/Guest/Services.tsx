// src/pages/Guest/Services.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Send, Loader2, RefreshCw, Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  ChevronUp, ChevronDown, Check, Mic, MicOff, X
} from 'lucide-react';
import { ServiceItem, ServiceRequest } from '../../types';
import { apiService } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import BackButton from '../../components/UI/BackButton';
import Navigation from '../../components/Layout/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

type Priority = 'low' | 'medium' | 'high';

type ServiceCard = {
  id: string;
  name: string;
  img: string;
  blurb: string;
};

const SERVICE_CATALOG: ServiceCard[] = [
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80&auto=format&fit=crop',
    blurb: 'Room cleaning, turndown & fresh linens.',
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrDLGpnOdnxsncJnE4exIh9umCaVD8yQWvyw&s',
    blurb: 'Fixes for AC, TV, plumbing or electricity.',
  },
  {
    id: 'concierge',
    name: 'Concierge',
    img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80&auto=format&fit=crop',
    blurb: 'Bookings, tips & local recommendations.',
  },
  {
    id: 'laundry',
    name: 'Laundry',
    img: 'https://soji.us/wp-content/uploads/2022/12/Professional-Laundry-Services.jpg',
    blurb: 'Pickup, wash & press with care.',
  },
  {
    id: 'room-service',
    name: 'Room Service',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80&auto=format&fit=crop',
    blurb: 'Meals & drinks delivered to your room.',
  },
  {
    id: 'spa',
    name: 'Spa Booking',
    img: 'https://centerparcs.scene7.com/is/image/centerparcs/sole%20therapy%2022?qlt=90&ts=1757085734070&dpr=off',
    blurb: 'Massages, facials & wellness rituals.',
  },
  {
    id: 'transport',
    name: 'Transportation',
    img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200&q=80&auto=format&fit=crop',
    blurb: 'Airport pickup & city transfers.',
  },
  {
    id: 'other',
    name: 'Other',
    img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop',
    blurb: 'Anything else you might need.',
  },
];

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqRefreshing, setReqRefreshing] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  // ==== Voice input state ====
  const [isRecording, setIsRecording] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    loadRequests();
    const id = setInterval(loadRequests, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceAvailable(!!SR);
    if (!SR) return;

    const rec = new SR();
    rec.lang = navigator.language || 'fr-FR';
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0]?.transcript || '')
        .join(' ')
        .trim();
      setDescription((prev) => (prev ? prev.replace(/\s+$/, '') + ' ' : '') + transcript);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);

    recognitionRef.current = rec;
  }, []);

  const toggleVoice = () => {
    if (!voiceAvailable || !recognitionRef.current) return;
    if (isRecording) {
      try { recognitionRef.current.stop(); } catch {}
      setIsRecording(false);
    } else {
      try { recognitionRef.current.start(); setIsRecording(true); } catch {}
    }
  };

  const clearDescription = () => setDescription('');

  const loadRequests = async () => {
    try {
      setReqRefreshing(true);
      const data = await apiService.getServiceRequests();
      const sorted = [...data].sort((a: any, b: any) => {
        const ta = new Date(a.createdAt || 0).getTime();
        const tb = new Date(b.createdAt || 0).getTime();
        return tb - ta;
      });
      setRequests(sorted as ServiceRequest[]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load your requests');
    } finally {
      setReqLoading(false);
      setReqRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !description.trim()) {
      toast.error('Please select a service and provide a description');
      return;
    }
    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.createServiceRequest({
        guestId: user.id,
        type: selectedService,
        description,
        priority: priority.toUpperCase(),
      });
      toast.success('Service request submitted successfully!');
      setSelectedService('');
      setDescription('');
      setPriority('medium');
      loadRequests();
      if (listRef.current) listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast.error('Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  const statusChip = (status = '') => {
    const s = String(status).toLowerCase();
    if (s === 'approved' || s === 'in_progress') return 'bg-green-100 text-green-800';
    if (s === 'rejected' || s === 'cancelled') return 'bg-red-100 text-red-800';
    if (s === 'completed') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };
  const statusIcon = (status = '') => {
    const s = String(status).toLowerCase();
    if (s === 'approved' || s === 'in_progress') return <CheckCircle size={16} className="text-green-600" />;
    if (s === 'rejected' || s === 'cancelled') return <XCircle size={16} className="text-red-600" />;
    if (s === 'completed') return <CheckCircle size={16} className="text-blue-600" />;
    return <AlertCircle size={16} className="text-yellow-600" />;
  };
  const priorityChip = (p = '') => {
    const v = String(p).toLowerCase();
    if (v === 'high') return 'bg-red-50 text-red-600 border border-red-100';
    if (v === 'medium') return 'bg-orange-50 text-orange-600 border border-orange-100';
    return 'bg-gray-50 text-gray-600 border border-gray-100';
  };

  const selectedCard = useMemo(
    () => SERVICE_CATALOG.find((s) => s.id === selectedService),
    [selectedService]
  );

  const scrollToTop = () => listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () =>
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-24 lg:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <BackButton to="/dashboard" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Services</h1>
            <p className="text-gray-600">How can we assist you today?</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ===== Formulaire (avec cartes illustrées) ===== */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Request Service</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* catalogue visuel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose a Service</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SERVICE_CATALOG.map((s) => {
                    const active = selectedService === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedService(s.id)}
                        className={[
                          'group overflow-hidden rounded-xl border transition-all text-left relative',
                          active
                            ? 'border-orange-500 ring-2 ring-orange-200'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm',
                        ].join(' ')}
                      >
                        <div className="aspect-[16/9] w-full overflow-hidden">
                          <img
                            src={s.img}
                            alt={s.name}
                            className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{s.name}</h3>
                            {active && (
                              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                                <Check size={14} /> Selected
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{s.blurb}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedCard && (
                  <div className="mt-4 flex items-center gap-3 text-sm text-gray-700">
                    <img
                      src={selectedCard.img}
                      className="w-12 h-12 object-cover rounded-lg"
                      alt={selectedCard.name}
                    />
                    <div>
                      <div className="font-medium">{selectedCard.name}</div>
                      <div className="text-gray-500">{selectedCard.blurb}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Description : texte + vocal ===== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe your request in detail… You can type or use the mic 🎤"
                    rows={4}
                    className={[
                      'w-full px-4 py-3 pr-24 border border-gray-200 rounded-lg',
                      'focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all',
                      'resize-none',
                      isRecording ? 'ring-2 ring-orange-300' : '',
                    ].join(' ')}
                    required
                  />
                  {/* Effacer */}
                  {description && (
                    <button
                      type="button"
                      onClick={clearDescription}
                      className="absolute right-12 top-3 text-gray-400 hover:text-gray-600"
                      title="Clear"
                    >
                      <X size={18} />
                    </button>
                  )}
                  {/* Micro */}
                  <button
                    type="button"
                    onClick={toggleVoice}
                    disabled={!voiceAvailable}
                    title={
                      voiceAvailable
                        ? isRecording
                          ? 'Stop voice input'
                          : 'Start voice input'
                        : 'Voice not supported on this device'
                    }
                    className={[
                      'absolute right-3 top-2.5 rounded-full p-2',
                      voiceAvailable
                        ? isRecording
                          ? 'bg-red-100 text-red-600 animate-pulse'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed',
                    ].join(' ')}
                  >
                    {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                </div>
                {voiceAvailable ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Tip: click the mic and speak — your words will be appended here.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">
                    Voice input not supported by this browser/device.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
                <div className="flex gap-3">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                    const active = priority === p;
                    const color = p === 'low' ? 'green' : p === 'medium' ? 'yellow' : 'red';
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={[
                          'flex-1 py-2 px-4 rounded-lg border-2 transition-all',
                          active ? `border-${color}-500 bg-${color}-50` : 'border-gray-200 text-gray-600 hover:border-gray-300',
                        ].join(' ')}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                className="w-full"
              >
                <Send size={20} className="mr-2" />
                Submit Request
              </Button>
            </form>
          </Card>

          {/* ===== Historique ===== */}
          <Card className="relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900">Your Service Requests</h2>
              <Button variant="outline" size="sm" onClick={loadRequests} disabled={reqRefreshing}>
                {reqRefreshing ? <Loader2 size={16} className="animate-spin mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                Refresh
              </Button>
            </div>

            {reqLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 rounded-lg bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                No requests yet. Submit one using the form.
              </div>
            ) : (
              <>
                <div ref={listRef} className="max-h-[560px] overflow-auto pr-2 scroll-smooth">
                  <ul className="divide-y divide-gray-100">
                    {requests.map((r) => (
                      <li key={r.id} className="p-4 hover:bg-gray-50/60 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900 break-all">{r.type}</span>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusChip(r.status)}`}>
                                {statusIcon(r.status)}
                                {String(r.status || 'pending').toUpperCase()}
                              </span>
                              {r.priority && (
                                <span className={`px-2 py-0.5 rounded-full text-xs ${priorityChip(r.priority)}`}>
                                  Priority: {String(r.priority).toLowerCase()}
                                </span>
                              )}
                            </div>
                            {r.description && <p className="text-gray-600 mt-1 break-words">{r.description}</p>}
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                              <Calendar size={14} />
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                              {r.createdAt && (
                                <>
                                  <Clock size={14} />
                                  {new Date(r.createdAt).toLocaleTimeString()}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden sm:flex flex-col gap-2 absolute right-3 bottom-3">
                  <button
                    onClick={scrollToTop}
                    className="h-10 w-10 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Scroll to top"
                    title="Scroll to top"
                  >
                    <ChevronUp />
                  </button>
                  <button
                    onClick={scrollToBottom}
                    className="h-10 w-10 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                    aria-label="Scroll to bottom"
                    title="Scroll to bottom"
                  >
                    <ChevronDown />
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default Services;