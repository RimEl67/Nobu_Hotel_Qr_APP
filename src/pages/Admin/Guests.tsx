import { useState, useEffect } from 'react';
import { Search, Eye, Phone, MapPin, Calendar } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import { apiService } from '../../services/api';

type GuestStatus = 'active' | 'checkout' | 'pending';

interface Guest {
  id: string;
  name: string;
  roomNumber: string;
  phone: string;
  checkIn: string;               // ISO string
  status: GuestStatus;
  totalOrders: number;
  totalSpent: number;
}

/** Convertit "2025-08-01 12:50:00.000000" (MySQL) en ISO utilisable par new Date() */
const toIso = (s?: string) => {
  if (!s) return new Date().toISOString();
  // si format "YYYY-MM-DD HH:mm:ss[.SSS]" -> remplace l'espace par 'T'
  if (s.includes(' ') && !s.includes('T')) return s.replace(' ', 'T');
  return s;
};

const AdminGuests: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GuestStatus>('all');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalGuests: 0,
    activeGuests: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadGuests();
  }, []);

  useEffect(() => {
    filterGuests();
  }, [guests, searchTerm, statusFilter]);

  const loadGuests = async () => {
    try {
      const raw = await apiService.getGuests(); // /api/admin/guests
      // Supporte deux formats possibles:
      // 1) Entité JPA Guest (avec 'orders' lazy)
      // 2) DTO déjà agrégé { id, name, roomNumber, phone, createdAt, status?, totalOrders?, totalSpent? }
      const transformed: Guest[] = (raw || []).map((g: any) => {
        const ordersArray = Array.isArray(g.orders) ? g.orders : [];
        // totalOrders vient de g.totalOrders (DTO) ou orders.length (entité)
        const totalOrders: number =
          typeof g.totalOrders === 'number'
            ? g.totalOrders
            : ordersArray.length;

        // totalSpent vient de g.totalSpent (DTO) ou somme des montants, avec plusieurs clés possibles
        const totalSpent: number =
          typeof g.totalSpent === 'number'
            ? g.totalSpent
            : ordersArray.reduce((sum: number, o: any) => {
                const amount =
                  o?.totalAmount ??
                  o?.amount ??
                  o?.total ??
                  0;
                return sum + Number(amount || 0);
              }, 0);

        const status: GuestStatus =
          (g.status as GuestStatus) ??
          // défaut raisonnable si pas de statut côté back
          'active';

        const checkIn =
          toIso(g.createdAt ?? g.checkIn ?? g.created_at);

        return {
          id: String(g.id),
          name: g.name ?? '—',
          roomNumber: String(g.roomNumber ?? g.room_number ?? '—'),
          phone: g.phone ?? '—',
          checkIn,
          status,
          totalOrders,
          totalSpent
        };
      });

      setGuests(transformed);

      // Stats robustes
      setStats({
        totalGuests: transformed.length,
        activeGuests: transformed.filter(g => g.status === 'active').length,
        totalOrders: transformed.reduce((s, g) => s + (g.totalOrders || 0), 0),
        totalRevenue: transformed.reduce((s, g) => s + (g.totalSpent || 0), 0)
      });
    } catch (error) {
      console.error('Failed to load guests:', error);
      setGuests([]);
      setStats({ totalGuests: 0, activeGuests: 0, totalOrders: 0, totalRevenue: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filterGuests = () => {
    let filtered = guests;

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      filtered = filtered.filter(guest =>
        (guest.name || '').toLowerCase().includes(s) ||
        (guest.roomNumber || '').includes(s) ||
        (guest.phone || '').includes(s)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(guest => guest.status === statusFilter);
    }

    setFilteredGuests(filtered);
  };

  const handleViewGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setShowGuestModal(true);
  };

  const getStatusColor = (status: GuestStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'checkout': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: GuestStatus) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'checkout': return 'Check-out';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
          <p className="text-gray-600">Liste complète des clients de l'hôtel</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher par nom, chambre ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="checkout">Check-out</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalGuests}</div>
          <div className="text-sm text-gray-600">Total Clients</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeGuests}</div>
          <div className="text-sm text-gray-600">Clients Actifs</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.totalOrders}</div>
          <div className="text-sm text-gray-600">Commandes Totales</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalRevenue}€</div>
          <div className="text-sm text-gray-600">Revenus Totaux</div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Client</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Chambre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Téléphone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Check-in</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Commandes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{guest.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" />
                      {guest.roomNumber}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" />
                      {guest.phone}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(guest.checkIn).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}>
                      {getStatusText(guest.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{guest.totalOrders}</td>
                  <td className="py-3 px-4 font-medium">{guest.totalSpent}€</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="outline" onClick={() => handleViewGuest(guest)}>
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGuests.length === 0 && (
            <div className="py-8 text-center text-gray-500">Aucun client trouvé</div>
          )}
        </div>
      </Card>

      {/* Modal */}
      <Modal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        title="Détails du Client"
        maxWidth="max-w-2xl"
      >
        {selectedGuest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <p className="text-gray-900">{selectedGuest.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
                <p className="text-gray-900">{selectedGuest.roomNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <p className="text-gray-900">{selectedGuest.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                <p className="text-gray-900">{new Date(selectedGuest.checkIn).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="text-center">
                <div className="text-xl font-bold text-blue-600">{selectedGuest.totalOrders}</div>
                <div className="text-sm text-gray-600">Commandes</div>
              </Card>
              <Card className="text-center">
                <div className="text-xl font-bold text-green-600">{selectedGuest.totalSpent}€</div>
                <div className="text-sm text-gray-600">Total Dépensé</div>
              </Card>
              <Card className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {selectedGuest.totalOrders > 0 ? Math.round(selectedGuest.totalSpent / selectedGuest.totalOrders) : 0}€
                </div>
                <div className="text-sm text-gray-600">Panier Moyen</div>
              </Card>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminGuests;
