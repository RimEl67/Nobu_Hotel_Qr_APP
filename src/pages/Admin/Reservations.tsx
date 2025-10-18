import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Modal from '../../components/UI/Modal';
import { ActivityReservation } from '../../types';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

type ApiStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

const toApiStatus = (s?: string): ApiStatus =>
  (s || 'PENDING').toUpperCase() as ApiStatus;

const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<ActivityReservation[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<ActivityReservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({}); // pour désactiver boutons pendant maj

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await apiService.getReservations();
      // Normalise les statuts en MAJUSCULE
      setReservations(
        data.map((r: any) => ({ ...r, status: toApiStatus(r.status) }))
      );
    } catch (error) {
      console.error('Failed to load reservations:', error);
      // Données mock (converties en MAJ)
      setReservations([
        {
          id: '1',
          guestId: '1',
          guestName: 'Jean Dupont',
          roomNumber: '205',
          activityType: 'Spa & Wellness',
          date: '2024-02-01',
          time: '14:00',
          status: 'PENDING',
          createdAt: '2024-01-31T10:00:00Z',
          notes: 'Massage relaxant demandé',
        },
        {
          id: '2',
          guestId: '2',
          guestName: 'Marie Martin',
          roomNumber: '301',
          activityType: 'Cooking Class',
          date: '2024-02-02',
          time: '10:00',
          status: 'APPROVED',
          createdAt: '2024-01-30T15:30:00Z',
        },
        {
          id: '3',
          guestId: '3',
          guestName: 'Ahmed Benali',
          roomNumber: '102',
          activityType: 'Yoga Session',
          date: '2024-02-01',
          time: '07:00',
          status: 'REJECTED',
          createdAt: '2024-01-29T09:15:00Z',
          notes: 'Créneau complet',
        },
      ] as any);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    reservationId: string,
    newStatus: ApiStatus
  ) => {
    try {
      setSavingIds((m) => ({ ...m, [reservationId]: true }));
      await apiService.updateReservationStatus(reservationId, newStatus);
      setReservations((prev) =>
  prev.map((res) =>
    res.id === reservationId
      ? { ...res, status: (newStatus as unknown as ActivityReservation['status']) }
      : res
  )
);

// mets à jour le modal si ouvert
setSelectedReservation((prevSel) =>
  prevSel && prevSel.id === reservationId
    ? { ...prevSel, status: (newStatus as unknown as ActivityReservation['status']) }
    : prevSel
);

      toast.success(`Réservation ${newStatus === 'APPROVED' ? 'approuvée' : newStatus === 'REJECTED' ? 'rejetée' : 'mise à jour'}`);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSavingIds((m) => ({ ...m, [reservationId]: false }));
    }
  };

  const handleViewDetails = (reservation: ActivityReservation) => {
    setSelectedReservation(reservation);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: ApiStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: ApiStatus) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'APPROVED': return 'Approuvée';
      case 'REJECTED': return 'Rejetée';
      case 'COMPLETED': return 'Terminée';
      default: return status;
    }
  };

  const getStatusIcon = (status: ApiStatus) => {
    switch (status) {
      case 'PENDING': return <AlertCircle size={16} className="text-yellow-600" />;
      case 'APPROVED': return <CheckCircle size={16} className="text-green-600" />;
      case 'REJECTED': return <XCircle size={16} className="text-red-600" />;
      default: return null;
    }
  };

  const counters = useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter((r) => toApiStatus(r.status) === 'PENDING').length;
    const approved = reservations.filter((r) => toApiStatus(r.status) === 'APPROVED').length;
    const rejected = reservations.filter((r) => toApiStatus(r.status) === 'REJECTED').length;
    return { total, pending, approved, rejected };
  }, [reservations]);

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
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Réservations</h1>
          <p className="text-gray-600">Validation et suivi des réservations d'activités</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-2xl font-bold text-gray-900">{counters.total}</div>
          <div className="text-sm text-gray-600">Total Réservations</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{counters.pending}</div>
          <div className="text-sm text-gray-600">En Attente</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600">{counters.approved}</div>
          <div className="text-sm text-gray-600">Approuvées</div>
        </Card>
        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600">{counters.rejected}</div>
          <div className="text-sm text-gray-600">Rejetées</div>
        </Card>
      </div>

      {/* Reservations List */}
      <Card>
        <div className="space-y-4">
          {reservations.map((reservation) => {
            const status = toApiStatus(reservation.status);
            const isSaving = !!savingIds[reservation.id];

            return (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {getStatusText(status)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{reservation.activityType}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        {reservation.guestName} - Chambre {reservation.roomNumber}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(reservation.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {reservation.time}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(reservation)}
                  >
                    Détails
                  </Button>

                  {/* Boutons rapides toujours visibles (désactivés si déjà dans ce statut) */}
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={status === 'APPROVED' || isSaving}
                    onClick={() => handleStatusUpdate(reservation.id, 'APPROVED')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle size={16} className="mr-1" />
                    Approuver
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    disabled={status === 'REJECTED' || isSaving}
                    onClick={() => handleStatusUpdate(reservation.id, 'REJECTED')}
                  >
                    <XCircle size={16} className="mr-1" />
                    Rejeter
                  </Button>
                </div>
              </div>
            );
          })}

          {reservations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-2 opacity-50" />
              <p>Aucune réservation trouvée</p>
            </div>
          )}
        </div>
      </Card>

      {/* Reservation Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails de la Réservation"
        maxWidth="max-w-lg"
      >
        {selectedReservation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <p className="text-gray-900">{selectedReservation.guestName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
                <p className="text-gray-900">{selectedReservation.roomNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Activité</label>
                <p className="text-gray-900">{selectedReservation.activityType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(toApiStatus(selectedReservation.status))}`}>
                  {getStatusText(toApiStatus(selectedReservation.status))}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-gray-900">{new Date(selectedReservation.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                <p className="text-gray-900">{selectedReservation.time}</p>
              </div>
            </div>

            {selectedReservation.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReservation.notes}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Créée le</label>
              <p className="text-gray-900">{new Date(selectedReservation.createdAt).toLocaleString('fr-FR')}</p>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="primary"
                className="flex-1 bg-green-500 hover:bg-green-600"
                disabled={toApiStatus(selectedReservation.status) === 'APPROVED'}
                onClick={() => {
                  handleStatusUpdate(selectedReservation.id, 'APPROVED');
                  setShowDetailsModal(false);
                }}
              >
                <CheckCircle size={16} className="mr-2" />
                Approuver
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                disabled={toApiStatus(selectedReservation.status) === 'REJECTED'}
                onClick={() => {
                  handleStatusUpdate(selectedReservation.id, 'REJECTED');
                  setShowDetailsModal(false);
                }}
              >
                <XCircle size={16} className="mr-2" />
                Rejeter
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminReservations;
