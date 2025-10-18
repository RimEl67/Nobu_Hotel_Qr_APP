// src/pages/Admin/ServiceRequests.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Calendar, Clock, User,
  CheckCircle, XCircle, AlertCircle,
  Settings, Search, Eye, Check, X,
  ClipboardCheck, RefreshCcw
} from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import Modal from '../../components/UI/Modal';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';
type ServerStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const serverToUi = (s: string): RequestStatus => {
  const v = (s || '').toUpperCase();
  if (v === 'IN_PROGRESS') return 'approved';
  if (v === 'CANCELLED')   return 'rejected';
  if (v === 'COMPLETED')   return 'completed';
  return 'pending';
};
const uiToServer = (s: RequestStatus): ServerStatus => {
  if (s === 'approved')  return 'IN_PROGRESS';
  if (s === 'rejected')  return 'CANCELLED';
  if (s === 'completed') return 'COMPLETED';
  return 'PENDING';
};

interface ServiceRequest {
  id: string;
  guestId?: string | number;
  guestName?: string;
  roomNumber?: string;
  phone?: string;
  type?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status: RequestStatus;
  preferredDate?: string;
  preferredTime?: string;
  createdAt: string;
  updatedAt?: string;
}

/* ---------- helpers date/heure ---------- */
const splitDateTime = (val?: string) => {
  if (!val) return { d: undefined, t: undefined };
  const s = String(val).replace(' ', 'T');
  const [d, tt] = s.split('T');
  return { d, t: tt?.slice(0,5) };
};

/** essaie toutes les clés possibles; sinon fallback -> createdAt */
const derivePreferred = (r: any) => {
  // 1) couples date/heure séparés
  let d =
    r.preferredDate ?? r.requestedDate ?? r.scheduledDate ?? r.datePreferred ?? r.dateRequest ?? undefined;
  let t =
    r.preferredTime ?? r.requestedTime ?? r.scheduledTime ?? r.timePreferred ?? r.timeRequest ?? undefined;

  // 2) champs datetime
  if (!d || !t) {
    const dt =
      r.preferredDateTime ?? r.requestDateTime ?? r.scheduledAt ?? r.requestedAt ?? r.desiredAt ?? r.when ?? undefined;
    const s = splitDateTime(dt);
    d = d || s.d;
    t = t || s.t;
  }

  // 3) fallback createdAt
  if (!d || !t) {
    const s = splitDateTime(r.createdAt || r.created_at);
    d = d || s.d;
    t = t || s.t;
  }
  return { preferredDate: d, preferredTime: t };
};

const statusLabel = (s: string) => {
  switch ((s || '').toLowerCase()) {
    case 'pending':   return 'En attente';
    case 'approved':  return 'Approuvée';
    case 'rejected':  return 'Rejetée';
    case 'completed': return 'Terminée';
    default:          return s;
  }
};
const statusBadge = (s: string) => {
  const k = (s || '').toLowerCase();
  if (k === 'pending')   return 'bg-yellow-100 text-yellow-800';
  if (k === 'approved')  return 'bg-blue-100 text-blue-800';
  if (k === 'rejected')  return 'bg-red-100 text-red-800';
  if (k === 'completed') return 'bg-green-100 text-green-800';
  return 'bg-gray-100 text-gray-800';
};
const statusIcon = (s: string) => {
  const k = (s || '').toLowerCase();
  if (k === 'pending')   return <AlertCircle size={16} className="text-yellow-600" />;
  if (k === 'approved')  return <CheckCircle size={16} className="text-blue-600" />;
  if (k === 'rejected')  return <XCircle size={16} className="text-red-600" />;
  if (k === 'completed') return <ClipboardCheck size={16} className="text-green-600" />;
  return null;
};

const AdminServiceRequests: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [open, setOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [data, guests] = await Promise.all([
        apiService.getAdminServiceRequests(),
        apiService.getGuests().catch(() => [] as any[]),
      ]);
      const guestMap = new Map<string, any>();
      (guests || []).forEach((g: any) => guestMap.set(String(g.id), g));

      const normalized: ServiceRequest[] = (data || []).map((r: any) => {
        const status = serverToUi((r.status ?? 'PENDING').toString());
        const priority = ((r.priority ?? 'medium') as string).toLowerCase() as 'low'|'medium'|'high';

        const gid = r.guestId ?? r.guest?.id ?? r.guest_id;
        const gobj = r.guest ?? guestMap.get(String(gid)) ?? {};
        const guestName = r.guestName ?? gobj.name ?? gobj.fullName ?? r.customerName ?? r.clientName;
        const roomNumber = r.roomNumber ?? gobj.roomNumber ?? gobj.room ?? r.room;
        const phone = r.phone ?? gobj.phone ?? gobj.phoneNumber ?? r.contactPhone ?? r.phoneNumber;

        const type = r.type ?? r.serviceType ?? r.category ?? r.serviceName;
        const description = r.description ?? r.details ?? r.note ?? r.notes ?? '';

        const { preferredDate, preferredTime } = derivePreferred(r);

        return {
          id: String(r.id),
          guestId: gid,
          guestName,
          roomNumber,
          phone,
          type,
          description,
          priority,
          status,
          preferredDate,
          preferredTime,
          createdAt: r.createdAt ?? r.created_at ?? new Date().toISOString(),
          updatedAt: r.updatedAt ?? r.updated_at ?? undefined,
        };
      });

      setRequests(normalized);
    } catch (e) {
      console.error(e);
      toast.error('Impossible de charger les demandes');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const q = query.toLowerCase();
      const byQ =
        !q ||
        (r.guestName ?? '').toLowerCase().includes(q) ||
        (r.roomNumber ?? '').toLowerCase().includes(q) ||
        (r.type ?? '').toLowerCase().includes(q);
      const byStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      const byPriority = priorityFilter === 'all' ? true : r.priority === priorityFilter;
      return byQ && byStatus && byPriority;
    });
  }, [requests, query, statusFilter, priorityFilter]);

  const total = requests.length;
  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const completed = requests.filter(r => r.status === 'completed').length;

  const updateStatus = async (id: string, status: RequestStatus) => {
    const prev = requests;
    setRequests(prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdatingId(id);
    try {
      await apiService.updateServiceRequestStatus(id, uiToServer(status));
      toast.success(
        status === 'approved' ? 'Demande approuvée' :
        status === 'rejected' ? 'Demande rejetée' :
        status === 'completed' ? 'Demande marquée terminée' :
        'Statut mis à jour'
      );
    } catch (e) {
      console.error(e);
      setRequests(prev);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDetails = (req: ServiceRequest) => { setSelected(req); setOpen(true); };

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
          <h1 className="text-3xl font-bold text-gray-900">Demandes de Services</h1>
          <p className="text-gray-600">Validation, suivi et finalisation des prestations</p>
        </div>
        <Button variant="outline" onClick={load}>
          <RefreshCcw size={18} className="mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Filtres */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Rechercher (client, chambre, service)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:w-[540px]">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvées</option>
              <option value="rejected">Rejetées</option>
              <option value="completed">Terminées</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="text-center"><div className="text-2xl font-bold text-gray-900">{total}</div><div className="text-sm text-gray-600">Total</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-yellow-600">{pending}</div><div className="text-sm text-gray-600">En attente</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-blue-600">{approved}</div><div className="text-sm text-gray-600">Approuvées</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-red-600">{rejected}</div><div className="text-sm text-gray-600">Rejetées</div></Card>
        <Card className="text-center"><div className="text-2xl font-bold text-green-600">{completed}</div><div className="text-sm text-gray-600">Terminées</div></Card>
      </div>

      {/* Liste */}
      <Card>
        <div className="space-y-3">
          {filtered.map((r) => {
            const isUpdating = updatingId === String(r.id);
            const canApprove  = (r.status === 'pending' || r.status === 'rejected') && !isUpdating;
            const canReject   = (r.status === 'pending' || r.status === 'approved') && !isUpdating;
            const canComplete =  r.status === 'approved' && !isUpdating;

            return (
              <div key={r.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    {statusIcon(r.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(r.status)}`}>{statusLabel(r.status)}</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{r.type || 'Service'}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {r.guestName || 'Client'} — Chambre {r.roomNumber || 'N/A'}
                      </div>

                      {r.preferredDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(r.preferredDate).toLocaleDateString('fr-FR')}
                        </div>
                      )}

                      {r.preferredTime && (
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {r.preferredTime}
                        </div>
                      )}

                      {r.priority && (
                        <span className={
                          'text-xs px-2 py-0.5 rounded-full ' +
                          (r.priority === 'high' ? 'bg-red-100 text-red-700' :
                           r.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                           'bg-gray-100 text-gray-700')
                        }>
                          Priorité: {r.priority}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setSelected(r); setOpen(true); }}>
                    <Eye size={16} /><span className="ml-1">Détails</span>
                  </Button>

                  <Button size="sm" variant="primary"
                    onClick={() => updateStatus(String(r.id), 'approved')}
                    disabled={!canApprove}
                    className={!canApprove ? 'opacity-60 cursor-not-allowed' : ''}>
                    {isUpdating ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" /> : <Check size={16} className="mr-1" />}
                    Approuver
                  </Button>

                  <Button size="sm" variant="danger"
                    onClick={() => updateStatus(String(r.id), 'rejected')}
                    disabled={!canReject}
                    className={!canReject ? 'opacity-60 cursor-not-allowed' : ''}>
                    {isUpdating ? <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1" /> : <X size={16} className="mr-1" />}
                    Rejeter
                  </Button>

                  {canComplete && (
                    <Button size="sm" variant="primary" className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(String(r.id), 'completed')}>
                      <ClipboardCheck size={16} className="mr-1" /> Terminer
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <Settings size={48} className="mx-auto mb-2 opacity-50" />
              Aucune demande
            </div>
          )}
        </div>
      </Card>

      {/* Modal détails */}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Détails de la demande" maxWidth="max-w-2xl">
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <p className="text-gray-900">{selected.guestName || '—'} — Chambre {selected.roomNumber || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <p className="text-gray-900">{selected.phone || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-gray-900">{selected.type || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge(selected.status)}`}>
                  {statusLabel(selected.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                <p className="text-gray-900 capitalize">{selected.priority || '—'}</p>
              </div>
            </div>

            {selected.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selected.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date demandée</label>
                <p className="text-gray-900">
                  {selected.preferredDate ? new Date(selected.preferredDate).toLocaleDateString('fr-FR') : '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure demandée</label>
                <p className="text-gray-900">{selected.preferredTime || '—'}</p>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Créée le {new Date(selected.createdAt).toLocaleString('fr-FR')}
              {selected.updatedAt && <> • MAJ {new Date(selected.updatedAt).toLocaleString('fr-FR')}</>}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {(() => {
                const isUpdating = updatingId === String(selected.id);
                const canApprove = (selected.status === 'pending' || selected.status === 'rejected') && !isUpdating;
                const canReject  = (selected.status === 'pending' || selected.status === 'approved') && !isUpdating;
                const canComplete = selected.status === 'approved' && !isUpdating;

                return (
                  <>
                    <Button variant="primary" onClick={() => { updateStatus(String(selected.id), 'approved'); setOpen(false); }}
                      disabled={!canApprove} className={!canApprove ? 'opacity-60 cursor-not-allowed' : ''}>
                      <Check size={16} className="mr-2" /> Approuver
                    </Button>
                    <Button variant="danger" onClick={() => { updateStatus(String(selected.id), 'rejected'); setOpen(false); }}
                      disabled={!canReject} className={!canReject ? 'opacity-60 cursor-not-allowed' : ''}>
                      <X size={16} className="mr-2" /> Rejeter
                    </Button>
                    {canComplete && (
                      <Button variant="primary" className="bg-green-600 hover:bg-green-700"
                        onClick={() => { updateStatus(String(selected.id), 'completed'); setOpen(false); }}>
                        <ClipboardCheck size={16} className="mr-2" /> Terminer
                      </Button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminServiceRequests;