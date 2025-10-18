// src/pages/Admin/Orders.tsx
import React, { useEffect, useState } from 'react';
import { Search, Eye, Clock, CheckCircle, XCircle, Package, MapPin, Euro } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import { apiService } from '../../services/api';

/* ---------------- Types ---------------- */
interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

interface OrderItemView {
  // Après enrichissement on garantit un nom
  menuItem?: { id?: string | number; name: string; category?: string; price?: number };
  quantity: number;
  price: number;
  // pour compatibilité si l'API renvoie un id brut
  menuItemId?: string | number;
}

interface GuestView {
  id: number | string;
  name: string;
  roomNumber?: string;
  phone?: string;
}

interface OrderView {
  id: string;
  guest?: GuestView;
  items: OrderItemView[];
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
}

/** Format brut tolérant de /admin/orders */
type RawOrder = {
  id: number | string;
  guest?: GuestView;
  guestId?: number | string;
  guestName?: string;
  roomNumber?: string;
  guestPhone?: string;
  items?: {
    menuItem?: { id?: number | string; name?: string; price?: number; category?: string };
    menuItemId?: number | string;
    quantity: number;
    price?: number;
  }[];
  total?: number;
  status?: string;
  notes?: string;
  createdAt?: string;
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderView[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderView | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  /* ---------------- Load + enrichissement (guest + menu) ---------------- */
  const loadOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('hotel_token');
      const user = localStorage.getItem('hotel_user');
      if (!token || !user) {
        window.location.href = '/login';
        return;
      }

      // Charge commandes + clients + menu (pour récupérer les noms d'articles)
      const [ordersData, guests, menu] = await Promise.all([
        apiService.getAdminOrders(),
        apiService.getGuests(),
        apiService.getMenu(),
      ]);

      // Maps utilitaires
      const guestMap = new Map<string, GuestView>();
      (guests || []).forEach((g: any) =>
        guestMap.set(String(g.id), {
          id: g.id,
          name: g.name,
          roomNumber: g.roomNumber,
          phone: g.phone,
        })
      );

      const menuMap = new Map<string, { id: string | number; name: string; price?: number; category?: string }>();
      (menu || []).forEach((m: any) =>
        menuMap.set(String(m.id), { id: m.id, name: m.name, price: m.price, category: m.category })
      );

      const transformed: OrderView[] = (ordersData as RawOrder[]).map((o) => {
        // Client
        let guest: GuestView | undefined =
          o.guest ??
          (o.guestId != null ? guestMap.get(String(o.guestId)) : undefined) ??
          (o.guestName || o.roomNumber || o.guestPhone
            ? {
                id: o.guestId ?? 0,
                name: o.guestName ?? 'Client',
                roomNumber: o.roomNumber,
                phone: o.guestPhone,
              }
            : undefined);

        // Items + enrichissement par menuMap si le nom manque
        const items: OrderItemView[] =
          (o.items || []).map((it) => {
            const idFromPayload = it.menuItem?.id ?? it.menuItemId;
            const key = idFromPayload != null ? String(idFromPayload) : undefined;
            const fromMenu = key ? menuMap.get(key) : undefined;

            const name =
              it.menuItem?.name ||
              fromMenu?.name ||
              (key ? `Article #${key}` : 'Article');

            const price = it.price ?? it.menuItem?.price ?? fromMenu?.price ?? 0;

            return {
              menuItem: { id: idFromPayload, name, price, category: it.menuItem?.category ?? fromMenu?.category },
              menuItemId: idFromPayload,
              quantity: it.quantity,
              price,
            };
          }) ?? [];

        // Total fallback si manquant
        const total = o.total ?? items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

        return {
          id: String(o.id),
          guest,
          items,
          total,
          status: (o.status || 'PENDING').toString(),
          notes: o.notes,
          createdAt: o.createdAt ?? new Date().toISOString(),
        };
      });

      setOrders(transformed);
      setFilteredOrders(transformed);

      // Stats
      const pending = transformed.filter((x) =>
        ['PENDING', 'CONFIRMED', 'PREPARING'].includes(x.status.toUpperCase())
      ).length;
      const delivered = transformed.filter((x) => x.status.toUpperCase() === 'DELIVERED').length;
      const revenue = transformed.reduce((sum, x) => sum + (x.total || 0), 0);

      setStats({
        totalOrders: transformed.length,
        pendingOrders: pending,
        completedOrders: delivered,
        totalRevenue: revenue,
      });
    } catch (error: any) {
      console.error('❌ Failed to load orders:', error);
      if (error?.message?.includes('401')) {
        window.location.href = '/login';
      } else {
        setOrders([]);
        setFilteredOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Filtrage ---------------- */
  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        const name = order.guest?.name || '';
        const room = order.guest?.roomNumber || '';
        return name.toLowerCase().includes(q) || room.includes(searchTerm) || order.id.includes(searchTerm);
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status.toLowerCase() === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  /* ---------------- Actions ---------------- */
  const handleViewOrder = (order: OrderView) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (e) {
      console.error('Failed to update order status:', e);
    }
  };

  /* ---------------- UI helpers ---------------- */
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'preparing':
        return <Package size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  /* ---------------- Render ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
          <p className="text-gray-600">Suivi et gestion des commandes clients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Commandes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Livrées</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenus Total</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalRevenue}€</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Euro className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher par client, chambre ou numéro de commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="preparing">En préparation</option>
              <option value="delivered">Livré</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tableau */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Commande</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Chambre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">#{order.id}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{order.guest?.name || '—'}</div>
                      <div className="text-sm text-gray-500">{order.guest?.phone || 'N/A'}</div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="font-medium">{order.guest?.roomNumber || 'N/A'}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-lg">{order.total}€</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString('fr-FR')}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                        <Eye size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commande</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Aucune commande ne correspond à vos critères de recherche.'
                : 'Aucune commande trouvée.'}
            </p>
          </div>
        )}
      </Card>

      {/* Modal détails */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Détails de la commande #${selectedOrder?.id ?? ''}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Infos */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Client</label>
                <p className="text-gray-900">{selectedOrder.guest?.name || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Chambre</label>
                <p className="text-gray-900">{selectedOrder.guest?.roomNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Téléphone</label>
                <p className="text-gray-900">{selectedOrder.guest?.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Statut</label>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            {/* Articles */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Articles commandés</label>
              <div className="space-y-2">
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{item.menuItem?.name || 'Article'}</div>
                        <div className="text-sm text-gray-500">Quantité: {item.quantity}</div>
                      </div>
                      <div className="font-medium">{item.price}€</div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Détails des articles non disponibles</p>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-xl font-bold text-orange-600">{selectedOrder.total}€</span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {selectedOrder.status?.toLowerCase() === 'pending' && (
                <Button variant="primary" onClick={() => handleStatusUpdate(selectedOrder.id, 'CONFIRMED')}>
                  Confirmer
                </Button>
              )}
              {selectedOrder.status?.toLowerCase() === 'confirmed' && (
                <Button variant="primary" onClick={() => handleStatusUpdate(selectedOrder.id, 'PREPARING')}>
                  Préparer
                </Button>
              )}
              {selectedOrder.status?.toLowerCase() === 'preparing' && (
                <Button variant="primary" onClick={() => handleStatusUpdate(selectedOrder.id, 'DELIVERED')}>
                  Marquer livré
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
                Fermer
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrders;