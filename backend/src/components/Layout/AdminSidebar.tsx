// src/components/Layout/AdminSidebar.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Bell,
  Calendar,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import { apiService } from '../../services/api';

/* ----------------------------- Types ----------------------------- */
type AdminNotifKind = 'order' | 'service' | 'reservation';
type AdminNotif = {
  id: string;
  kind: AdminNotifKind;
  refId: string;
  title: string;
  message: string;
  createdAt: string; // ISO
};

/* ---------------------- LocalStorage helpers --------------------- */
const SEEN_KEY = 'admin_notifs_seen_v1';
const loadSeen = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}');
  } catch {
    return {};
  }
};
const saveSeen = (m: Record<string, string>) => {
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify(m));
  } catch {}
};

/* ========================= Component ========================= */
const AdminSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /* -------------- Notifications + positionnement -------------- */
  const [openNotif, setOpenNotif] = useState(false);
  const notifBtnRef = useRef<HTMLButtonElement | null>(null);
  const notifPanelRef = useRef<HTMLDivElement | null>(null);

  // Position calculée (position: fixed)
  const [panelPos, setPanelPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });

  const [notifs, setNotifs] = useState<AdminNotif[]>([]);
  const intervalRef = useRef<number | null>(null);

  // Récupération périodique
  useEffect(() => {
    fetchAdminNotifs();
    intervalRef.current = window.setInterval(fetchAdminNotifs, 15000) as unknown as number;
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdminNotifs = async () => {
    try {
      const [orders, sreqs, resas] = await Promise.all([
        apiService.getAdminOrders().catch(() => []),
        apiService.getAdminServiceRequests().catch(() => []),
        apiService.getAdminReservations().catch(() => []),
      ]);

      const items: AdminNotif[] = [];

      // Commandes PENDING
      (orders || []).forEach((o: any) => {
        const st = String(o?.status || '').toUpperCase();
        if (st === 'PENDING') {
          items.push({
            id: `order-${o.id}-${st}`,
            kind: 'order',
            refId: String(o.id),
            title: 'Nouvelle commande',
            message: `Commande #${o.id} à traiter`,
            createdAt: o.createdAt || o.created_at || new Date().toISOString(),
          });
        }
      });

      // Services PENDING
      (sreqs || []).forEach((r: any) => {
        const st = String(r?.status || '').toUpperCase();
        if (st === 'PENDING') {
          items.push({
            id: `service-${r.id}-${st}`,
            kind: 'service',
            refId: String(r.id),
            title: 'Demande de service',
            message: `Demande #${r.id} en attente d’approbation`,
            createdAt: r.createdAt || r.created_at || new Date().toISOString(),
          });
        }
      });

      // Réservations PENDING
      (resas || []).forEach((a: any) => {
        const st = String(a?.status || '').toUpperCase();
        if (st === 'PENDING') {
          items.push({
            id: `reservation-${a.id}-${st}`,
            kind: 'reservation',
            refId: String(a.id),
            title: 'Nouvelle réservation',
            message: `Réservation #${a.id} à confirmer`,
            createdAt: a.createdAt || a.created_at || new Date().toISOString(),
          });
        }
      });

      items.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifs(items.slice(0, 50));
    } catch (e) {
      console.error('Admin notifications fetch failed:', e);
    }
  };

  const unseenCount = useMemo(() => {
    const seen = loadSeen();
    return notifs.filter((n) => !seen[n.id]).length;
  }, [notifs]);

  const markAllAsSeen = () => {
    const seen = loadSeen();
    notifs.forEach((n) => {
      seen[n.id] = n.createdAt;
    });
    saveSeen(seen);
    // Redessine pour recalculer le badge
    setNotifs((n) => [...n]);
  };

  /* ----------------- Calcul position du panneau ---------------- */
  const computePanelPos = () => {
    const btn = notifBtnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();

    const PANEL_WIDTH = 352; // ~22rem
    const PANEL_HEIGHT = 380;
    const SIDEBAR_W = 256; // w-64
    const GAP = 12;

    // Place à droite du bouton mais clampé et au minimum à droite du sidebar
    const rawLeft = Math.max(rect.right + GAP, SIDEBAR_W + GAP);
    const left = Math.min(
      window.innerWidth - GAP - PANEL_WIDTH,
      Math.max(GAP, rawLeft)
    );

    // Sous le bouton, clampé dans le viewport
    const rawTop = rect.top + 8;
    const top = Math.min(
      window.innerHeight - GAP - PANEL_HEIGHT,
      Math.max(GAP, rawTop)
    );

    setPanelPos({ left, top });
  };

  // Recalcule quand on ouvre
  useEffect(() => {
    if (openNotif) {
      computePanelPos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNotif]);

  // Recalcule au scroll/resize pendant l’ouverture + clic extérieur pour fermer
  useEffect(() => {
    if (!openNotif) return;

    const onResizeScroll = () => computePanelPos();
    const onClickOutside = (e: MouseEvent) => {
      const panel = notifPanelRef.current;
      const btn = notifBtnRef.current;
      if (!panel || !btn) return;
      if (!panel.contains(e.target as Node) && !btn.contains(e.target as Node)) {
        setOpenNotif(false);
      }
    };

    window.addEventListener('resize', onResizeScroll);
    window.addEventListener('scroll', onResizeScroll, true);
    window.addEventListener('click', onClickOutside);

    return () => {
      window.removeEventListener('resize', onResizeScroll);
      window.removeEventListener('scroll', onResizeScroll, true);
      window.removeEventListener('click', onClickOutside);
    };
  }, [openNotif]);

  /* ----------------------------- Logout ----------------------------- */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  /* ------------------------------ Menu ------------------------------ */
  const menuItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/guests', icon: Users, label: 'Clients' },
    { to: '/admin/orders', icon: ShoppingBag, label: 'Commandes' },
    { to: '/admin/services', icon: Bell, label: 'Services' },
    { to: '/admin/reservations', icon: Calendar, label: 'Réservations' },
    { to: '/admin/statistics', icon: BarChart3, label: 'Statistiques' },
    { to: '/admin/reports', icon: FileText, label: 'Rapports' },
    { to: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ];

  /* ------------------------------- UI ------------------------------- */
  return (
    <div className="bg-white shadow-lg h-screen w-64 fixed left-0 top-0 z-40 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">NOBU HOTEL</h2>
              <p className="text-xs text-orange-600">ADMIN PANEL</p>
            </div>
          </div>

          {/* Bouton Notifications */}
          <div className="relative">
            <button
              ref={notifBtnRef}
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell size={18} className="text-gray-700" />
              {unseenCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {Math.min(unseenCount, 9)}
                  {unseenCount > 9 ? '+' : ''}
                </span>
              )}
            </button>

            {/* Panneau des notifications (position: fixed) */}
            {openNotif && (
              <div
                ref={notifPanelRef}
                className="w-[22rem] bg-white border border-gray-200 rounded-xl shadow-xl z-50"
                style={{ position: 'fixed', left: panelPos.left, top: panelPos.top }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="font-semibold text-gray-900">Notifications</div>
                  <button
                    onClick={markAllAsSeen}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    Tout marquer comme lu
                  </button>
                </div>

                <div className="max-h-[380px] overflow-auto divide-y">
                  {notifs.length === 0 && (
                    <div className="px-4 py-6 text-sm text-gray-500 text-center">
                      Aucune notification pour l’instant
                    </div>
                  )}

                  {notifs.map((n) => {
                    const seen = !!loadSeen()[n.id];
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex items-start gap-3 ${
                          seen ? 'bg-white' : 'bg-orange-50/40'
                        }`}
                      >
                        {n.kind === 'order' ? (
                          <ShoppingBag className="text-orange-600 mt-0.5" size={18} />
                        ) : n.kind === 'service' ? (
                          <CheckCircle2 className="text-green-600 mt-0.5" size={18} />
                        ) : (
                          <Calendar className="text-purple-600 mt-0.5" size={18} />
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {n.title}
                          </div>
                          <div className="text-sm text-gray-700">{n.message}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {new Date(n.createdAt).toLocaleString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-2 border-t text-xs text-gray-600 flex items-center gap-3">
                  <AlertTriangle size={14} className="text-amber-600" />
                  Astuce : traitez d’abord les éléments « En attente ».
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="mr-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;