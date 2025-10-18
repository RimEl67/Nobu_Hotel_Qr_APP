// src/pages/Guest/Dashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Utensils, Bell, Calendar, MessageCircle, MapPin, Wifi, Clock,
  Package, Gift, Star, Sparkles, LogOut, CheckCircle2, XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { apiService } from '../../services/api';
import { MenuItem, ServiceItem, ActivityItem } from '../../types';
import Card from '../../components/UI/Card';
import Slider from '../../components/UI/Slider';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import Navigation from '../../components/Layout/Navigation';
import toast from 'react-hot-toast';

/* ------------------------ utils images ------------------------ */
const FallbackImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }> = ({
  fallback = 'https://images.unsplash.com/photo-1551218808-94e220e084d2?q=80&w=1400&auto=format&fit=crop',
  ...props
}) => {
  const onError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== fallback) img.src = fallback;
  };
  return <img {...props} onError={onError} loading="lazy" />;
};

const RESTAURANT_IMAGE_URLS: Record<string, string> = {
  'Miso Black Cod': 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop',
  'Yellowtail Sashimi': 'https://images.unsplash.com/photo-1514516870926-2059896aa0f8?q=80&w=1600&auto=format&fit=crop',
  'Wagyu Beef Tataki': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600&auto=format&fit=crop',
};
const getRestaurantImage = (item: { name: string; image?: string }) =>
  RESTAURANT_IMAGE_URLS[item.name] ?? item.image ?? '';

/* ----------------------------- Reviews ----------------------------- */
type Review = { id: string; guest: string; avatar: string; rating: number; title: string; comment: string; date: string; };
const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', guest: 'Amira B.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop', rating: 5, title: 'Service aux petits soins', comment: "Incroyable séjour, personnel adorable et très réactif via l'appli. Le spa est un must !", date: '2025-01-28' },
  { id: 'r2', guest: 'Lucas M.', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop', rating: 4, title: 'Restaurant excellent', comment: 'La sélection Nobu était délicieuse. Livraison en chambre rapide et présentation parfaite.', date: '2025-01-22' },
  { id: 'r3', guest: 'Sofia R.', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=400&auto=format&fit=crop', rating: 5, title: 'Expérience 6★', comment: 'Chambre splendide, check-out tardif offert, et activités bien organisées. Je recommande !', date: '2025-01-18' },
];
const STAR_ROWS = [5,4,3,2,1] as const;

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const items = Array.from({ length: 5 }, (_, i) => (i < full ? 'full' : i === full && half ? 'half' : 'empty'));
  return (
    <div className="flex items-center gap-0.5">
      {items.map((t, i) => (
        <Star key={i} size={size} className={t === 'empty' ? 'text-gray-300' : 'text-yellow-500 fill-yellow-500 drop-shadow-sm'} />
      ))}
    </div>
  );
}

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void; size?: number }> = ({ value, onChange, size = 22 }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(n => (
      <button key={n} type="button" onClick={() => onChange(n)} className="focus:outline-none" aria-label={`${n} stars`} title={`${n} stars`}>
        <Star size={size} className={n <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
      </button>
    ))}
  </div>
);

const AVATAR_FEMALE = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop';
const AVATAR_MALE   = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop';

/* ------------------------ Notifications ------------------------ */
type NotifKind = 'order' | 'service' | 'activity';
type NotifStatus = 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED';
type NotificationItem = { id: string; kind: NotifKind; refId: string; title: string; message: string; status: NotifStatus; createdAt: string; read?: boolean; };

const NOTIF_STORE_KEY = 'guest_notif_seen_v1';
const loadSeenMap = (): Record<string,string> => { try { return JSON.parse(localStorage.getItem(NOTIF_STORE_KEY) || '{}'); } catch { return {}; } };
const saveSeenMap = (m: Record<string,string>) => { try { localStorage.setItem(NOTIF_STORE_KEY, JSON.stringify(m)); } catch {} };

/* ---------------------- Couleurs “stables” ---------------------- */
const statColors = {
  text:   { blue:'text-blue-600',   green:'text-green-600',   purple:'text-purple-600' },
  bar:    { blue:'bg-blue-500',     green:'bg-green-500',     purple:'bg-purple-500' },
} as const;

const serviceColors = {
  bg100:  { orange:'bg-orange-100', green:'bg-green-100', purple:'bg-purple-100', blue:'bg-blue-100', red:'bg-red-100', indigo:'bg-indigo-100' },
  text:   { orange:'text-orange-600', green:'text-green-600', purple:'text-purple-600', blue:'text-blue-600', red:'text-red-600', indigo:'text-indigo-600' },
} as const;

/* ------------------------------- Page ------------------------------- */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ guest: '', title: '', comment: '', rating: 5, avatar: '', avatarChoice: '' as ''|'female'|'male' });

  // Notifications
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const pollingRef = useRef<number | null>(null);

  const stats = [
    { label: 'Active Orders', value: '0', color: 'blue' as const },
    { label: 'Service Requests', value: '0', color: 'green' as const },
    { label: 'Cart Items', value: getTotalItems().toString(), color: 'purple' as const },
  ];

  const navigationServices = [
    { title: 'Restaurant', description: 'Culinary Excellence', icon: Utensils, color: 'orange' as const, to: '/dashboard/restaurant' },
    { title: 'Services', description: 'Concierge & More', icon: Bell, color: 'green' as const, to: '/dashboard/services' },
    { title: 'Activities', description: 'Spa & Experiences', icon: Calendar, color: 'purple' as const, to: '/dashboard/activities' },
    { title: 'Chat', description: '24/7 Assistance', icon: MessageCircle, color: 'blue' as const, to: '/dashboard/chat' },
    { title: 'Hotel Map', description: 'Navigate in Style', icon: MapPin, color: 'red' as const, to: '/dashboard/hotel-map' },
    { title: 'Room Control', description: 'Smart Amenities', icon: Wifi, color: 'indigo' as const, to: '/dashboard/room-control' },
  ];

  const sliderData = [
    {
      id: '1',
      title: 'Offre Spéciale Spa',
      subtitle: 'Détente & Bien-être',
      description: "Profitez de 30% de réduction sur tous nos soins spa jusqu'au 31 mars. Réservez dès maintenant votre moment de détente.",
      image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
      buttonText: 'Réserver maintenant',
      buttonAction: () => toast.success('Redirection vers les réservations spa...'),
      gradient: 'bg-gradient-to-r from-green-900/70 via-green-700/50 to-transparent',
    },
    {
      id: '2',
      title: 'Happy Hour Restaurant',
      subtitle: 'Cuisine Fusion Japonaise',
      description: 'Découvrez notre menu signature avec 25% de réduction de 17h à 19h tous les jours. Une expérience culinaire unique.',
      image: 'https://images.pexels.com/photos/3026808/pexels-photo-3026808.jpeg',
      buttonText: 'Voir le menu',
      buttonAction: () => toast.success('Redirection vers le restaurant...'),
      gradient: 'bg-gradient-to-r from-orange-900/70 via-orange-700/50 to-transparent',
    },
    {
      id: '3',
      title: 'Package Romance',
      subtitle: 'Séjour Romantique',
      description: "Champagne, pétales de rose, dîner aux chandelles et massage en couple. L'expérience parfaite pour les amoureux.",
      image: 'https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg',
      buttonText: "Découvrir l'offre",
      buttonAction: () => toast.success("Contactez la réception pour plus d'informations"),
      gradient: 'bg-gradient-to-r from-pink-900/70 via-pink-700/50 to-transparent',
    },
  ];

  /* ------------------ load data ------------------ */
  useEffect(() => { loadDashboardData(); }, []);
  const loadDashboardData = async () => {
    try {
      const [menuData, servicesData, activitiesData] = await Promise.all([
        apiService.getMenu(), apiService.getServices(), apiService.getActivities(),
      ]);
      setMenuItems(menuData.slice(0, 3));
      setServices(servicesData.slice(0, 3));
      setActivities(activitiesData.slice(0, 3));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  /* ------------------ polling notifications ------------------ */
  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications();
    pollingRef.current = window.setInterval(fetchNotifications, 15000) as unknown as number;
    return () => { if (pollingRef.current) window.clearInterval(pollingRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    const guestId = String(user.id);
    try {
      const [orders, sreq, resa] = await Promise.all([
        apiService.getGuestOrders(guestId).catch(() => []),
        apiService.getServiceRequestsByGuest(guestId).catch(() => []),
        apiService.getReservationsByGuest(guestId).catch(() => []),
      ]);

      const candidates: NotificationItem[] = [];

      (orders || []).forEach((o: any) => {
        const st = String(o?.status || '').toUpperCase() as NotifStatus;
        if (['DELIVERED', 'CANCELLED', 'CONFIRMED', 'PREPARING', 'COMPLETED'].includes(st)) {
          candidates.push({
            id: `order-${o.id}-${st}`,
            kind: 'order',
            refId: String(o.id),
            title:
              st === 'DELIVERED' || st === 'COMPLETED'
                ? 'Commande livrée'
                : st === 'CANCELLED'
                ? 'Commande annulée'
                : 'Commande mise à jour',
            message: `Votre commande #${o.id} est ${st.toLowerCase()}.`,
            status: st,
            createdAt: o.updatedAt || o.updated_at || new Date().toISOString(),
          });
        }
      });

      (sreq || []).forEach((r: any) => {
        const st = String(r?.status || '').toUpperCase() as NotifStatus;
        if (['APPROVED','REJECTED','COMPLETED','CANCELLED'].includes(st)) {
          candidates.push({
            id: `service-${r.id}-${st}`,
            kind: 'service',
            refId: String(r.id),
            title:
              st === 'APPROVED' ? 'Service approuvé'
                : st === 'REJECTED' ? 'Service rejeté'
                : st === 'COMPLETED' ? 'Service terminé'
                : 'Service annulé',
            message: `Votre demande de service (#${r.id}) est ${st.toLowerCase()}.`,
            status: st,
            createdAt: r.updatedAt || r.updated_at || new Date().toISOString(),
          });
        }
      });

      (resa || []).forEach((a: any) => {
        const st = String(a?.status || '').toUpperCase() as NotifStatus;
        if (['APPROVED','REJECTED','COMPLETED','CANCELLED'].includes(st)) {
          candidates.push({
            id: `activity-${a.id}-${st}`,
            kind: 'activity',
            refId: String(a.id),
            title:
              st === 'APPROVED' ? 'Activité confirmée'
                : st === 'REJECTED' ? 'Activité refusée'
                : st === 'COMPLETED' ? 'Activité terminée'
                : 'Activité annulée',
            message: `Votre réservation d’activité (#${a.id}) est ${st.toLowerCase()}.`,
            status: st,
            createdAt: a.updatedAt || a.updated_at || new Date().toISOString(),
          });
        }
      });

      // Anti-doublon + tri
      const seen = loadSeenMap();
      const newOnes: NotificationItem[] = [];
      candidates
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .forEach(n => { if (!seen[n.id]) { newOnes.push(n); seen[n.id] = n.createdAt; } });

      if (newOnes.length) {
        newOnes.slice(0,3).forEach(n => {
          if (n.status === 'REJECTED') {
            toast(t => (
              <div className="flex items-center gap-2">
                <XCircle className="text-red-600" />
                <div>
                  <div className="font-semibold">Refusé</div>
                  <div className="text-sm">{n.message}</div>
                </div>
              </div>
            ), { icon: '⛔' });
          } else {
            toast(t => (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-green-600" />
                <div>
                  <div className="font-semibold">Mise à jour</div>
                  <div className="text-sm">{n.message}</div>
                </div>
              </div>
            ));
          }
        });
        saveSeenMap(seen);
      }

      setNotifs(
        [...candidates].sort(
          (a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0,30)
      );
    } catch (e) {
      console.error('Notifications fetch failed', e);
    }
  };

  const unreadCount = useMemo(() => notifs.filter(n => !loadSeenMap()[n.id]).length, [notifs]);
  const markAllRead = () => {
    const seen = loadSeenMap();
    notifs.forEach(n => { seen[n.id] = n.createdAt; });
    saveSeenMap(seen);
    setNotifs(n => n.map(x => ({ ...x, read: true })));
  };

  /* ------------------------ UI ------------------------ */
  const handleLogout = () => {
    try { apiService.clearToken(); logout?.(); toast.success('Déconnexion réussie'); navigate('/login'); }
    catch { toast.error('Impossible de se déconnecter'); }
  };

  const formDisabled = !reviewForm.avatar;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <div className="flex-1 mx-4">
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
              <p className="text-gray-600">Room {user?.roomNumber} • Nobu Hotel Marrakech</p>
            </div>

            {/* Notifications (même style) */}
            <div className="relative mr-3">
              <button onClick={() => setNotifOpen(v => !v)} className="relative p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50" aria-label="Notifications">
                <Bell size={20} className="text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                    {Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl z-20">
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="font-semibold text-gray-900">Notifications</div>
                    <button onClick={markAllRead} className="text-xs text-orange-600 hover:underline">Tout marquer comme lu</button>
                  </div>
                  <div className="max-h-[360px] overflow-auto divide-y">
                    {notifs.length === 0 && <div className="px-4 py-6 text-sm text-gray-500 text-center">Aucune notification</div>}
                    {notifs.map(n => (
                      <div key={n.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                        {n.status === 'REJECTED' ? <XCircle className="text-red-600 mt-0.5" size={18} /> : <CheckCircle2 className="text-green-600 mt-0.5" size={18} />}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900">{n.title}</div>
                          <div className="text-sm text-gray-700">{n.message}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{new Date(n.createdAt).toLocaleString('fr-FR')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link to="/dashboard/beauty-store">
                <Button variant="primary" className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                  <Sparkles size={20} /> Discover our Beauty Store
                </Button>
              </Link>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50">
                <LogOut size={18} /> Déconnexion
              </Button>
            </div>
          </div>
        </div>

        {/* Slider */}
        <div className="mb-8">
          <Slider slides={sliderData} autoPlay interval={6000} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map((stat, i) => (
            <Card key={i} className="text-center">
              <div className={`${statColors.text[stat.color]} text-2xl font-bold mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className={`h-1 ${statColors.bar[stat.color]} rounded-full mt-2`} />
            </Card>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigationServices.map((service) => {
            const Icon = service.icon;
            const bg = serviceColors.bg100[service.color];
            const tx = serviceColors.text[service.color];
            return (
              <Link key={service.title} to={service.to} className="group">
                <Card className="text-center hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`w-16 h-16 ${bg} rounded-xl flex items-center justify-center mx-auto mb-4 hover:opacity-90`}>
                    <Icon className={tx} size={32} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Restaurant Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Utensils className="text-orange-600" size={20} /> Restaurant Nobu - Sélection
                  </h3>
                  <Link to="/dashboard/restaurant" className="text-orange-600 text-sm hover:underline">Voir le menu complet →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {menuItems.map((item) => (
                    <Link key={item.id} to="/dashboard/restaurant" className="block">
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 border border-orange-200 hover:border-orange-300">
                        <FallbackImg src={getRestaurantImage(item)} alt={item.name} className="w-full h-24 object-cover rounded-lg mb-3 shadow-sm" />
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-orange-600 font-bold">{item.price} $</p>
                          <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                            {(item as any).category
                          }</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Services Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="text-green-600" size={20} /> Available Services
                  </h3>
                  <Link to="/dashboard/services" className="text-green-600 text-sm hover:underline">View All →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="bg-green-50 rounded-lg p-4 hover:bg-green-100 transition-colors">
                      <FallbackImg src={service.imageUrl} alt={service.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                      <h4 className="font-medium text-gray-900 text-sm">{service.name}</h4>
                      <p className="text-green-600 font-semibold">{service.price > 0 ? `${service.price} $` : 'Complimentary'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="text-purple-600" size={20} /> Featured Activities
                  </h3>
                  <Link to="/dashboard/activities" className="text-purple-600 text-sm hover:underline">View All →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="bg-purple-50 rounded-lg p-4 hover:bg-purple-100 transition-colors">
                      <FallbackImg src={activity.imageUrl} alt={activity.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                      <h4 className="font-medium text-gray-900 text-sm">{activity.name}</h4>
                      <div className="flex items-center justify-between">
                        <p className="text-purple-600 font-semibold">{activity.price} $</p>
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500 fill-current" size={12} />
                          <span className="text-xs text-gray-600">{(activity as any).rating ?? 4.8}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Special Offers */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Special Offers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-100">
              <Gift className="text-orange-600" size={24} />
              <div>
                <div className="font-medium text-gray-900">Welcome Drink</div>
                <div className="text-sm text-gray-600">Complimentary cocktail at the bar</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <Star className="text-purple-600" size={24} />
              <div>
                <div className="font-medium text-gray-900">Late Check-out</div>
                <div className="text-sm text-gray-600">Until 2:00 PM complimentary</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Guest Reviews */}
        <Card className="mb-6">
          <div className="flex items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Guest Reviews</h2>
              <p className="text-sm text-gray-600">What our guests say about Nobu Hotel Marrakech</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{useMemo(
                  () => Math.round(
                    (reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length || 1, 1)) * 10
                  ) / 10,
                  [reviews]
                )}</div>
                <div className="flex items-center justify-end gap-2">
                  <Stars value={Math.round(
                    (reviews.reduce((s, r) => s + r.rating, 0) / Math.max(reviews.length || 1, 1)) * 10
                  ) / 10} />
                  <span className="text-sm text-gray-500">({reviews.length})</span>
                </div>
              </div>
              <Button variant="primary" onClick={() => {
                setReviewForm({ guest: user?.name || '', title: '', comment: '', rating: 5, avatar: '', avatarChoice: '' });
                setShowReviewModal(true);
              }}>
                Write a review
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Distribution */}
            <div className="lg:col-span-1">
              <ul className="space-y-2">
                {STAR_ROWS.map((row) => {
                  const count = reviews.filter(r => r.rating === row).length;
                  const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0;
                  return (
                    <li key={row} className="flex items-center gap-3">
                      <div className="w-12 text-sm text-gray-700 flex items-center gap-1">
                        {row}<Star size={14} className="text-yellow-500 fill-yellow-500" />
                      </div>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm text-gray-600">{pct}%</div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 flex items-start gap-4">
                  <FallbackImg src={r.avatar} alt={r.guest} className="w-12 h-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-gray-900">{r.guest}</div>
                      <div className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Stars value={r.rating} />
                      <span className="text-xs font-medium text-gray-700">{r.title}</span>
                    </div>
                    <p className="text-gray-700 mt-2">{r.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Hotel Info */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hotel Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div><h3 className="font-medium text-gray-900 mb-2">Check-out Time</h3><p className="text-gray-600 flex items-center gap-2"><Clock size={16} /> 12:00 PM</p></div>
            <div><h3 className="font-medium text-gray-900 mb-2">Concierge</h3><p className="text-gray-600 flex items-center gap-2"><MessageCircle size={16} /> Available 24/7</p></div>
            <div><h3 className="font-medium text-gray-900 mb-2">Room Service</h3><p className="text-gray-600 flex items-center gap-2"><Package size={16} /> Until 11:00 PM</p></div>
            <div><h3 className="font-medium text-gray-900 mb-2">WiFi</h3><p className="text-gray-600 flex items-center gap-2"><Wifi size={16} /> NobuGuest_Free</p></div>
          </div>
        </Card>
      </div>

      {/* REVIEW MODAL */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Write a review" maxWidth="max-w-lg">
        <div className="space-y-5">
          {/* Avatar choice */}
          <div>
            <p className="text-sm text-gray-700 mb-2">Choose your avatar (required)</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReviewForm(f => ({ ...f, avatarChoice: 'female', avatar: AVATAR_FEMALE }))}
                className={`p-3 rounded-xl border transition-all text-left ${reviewForm.avatarChoice==='female' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <FallbackImg src={AVATAR_FEMALE} alt="Female avatar" className="w-12 h-12 rounded-full object-cover" />
                  <div><div className="font-medium text-gray-900">Female</div><div className="text-xs text-gray-600">Use this avatar</div></div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setReviewForm(f => ({ ...f, avatarChoice: 'male', avatar: AVATAR_MALE }))}
                className={`p-3 rounded-xl border transition-all text-left ${reviewForm.avatarChoice==='male' ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-3">
                  <FallbackImg src={AVATAR_MALE} alt="Male avatar" className="w-12 h-12 rounded-full object-cover" />
                  <div><div className="font-medium text-gray-900">Male</div><div className="text-xs text-gray-600">Use this avatar</div></div>
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className={formDisabled ? 'opacity-60 pointer-events-none select-none' : ''}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Your name *</label>
                <input className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={reviewForm.guest} onChange={e => setReviewForm(f => ({ ...f, guest: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Title *</label>
                <input className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={reviewForm.title} onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))} placeholder="Amazing stay!" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Your review *</label>
                <textarea rows={4} className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                  value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Tell us about your experience…" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-gray-600">Your rating</span>
              <StarPicker value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              const { guest, title, comment, rating, avatar } = reviewForm;
              if (!avatar) return toast.error('Choisissez un avatar.');
              if (!guest.trim() || !title.trim() || !comment.trim() || rating < 1) return toast.error('Champs incomplets.');
              setReviews(prev => [{ id: `${Date.now()}`, guest, avatar, rating, title, comment, date: new Date().toISOString() }, ...prev ]);
              setShowReviewModal(false);
              toast.success('Merci pour votre avis !');
            }}>Submit review</Button>
          </div>
        </div>
      </Modal>

      <Navigation />
    </div>
  );
};

export default Dashboard;