import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Users } from 'lucide-react';
import { ActivityItem } from '../../types';
import { apiService } from '../../services/api';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import BackButton from '../../components/UI/BackButton';
import Modal from '../../components/UI/Modal';
import Navigation from '../../components/Layout/Navigation';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [myReservations, setMyReservations] = useState<any[]>([]);

  const { user } = useAuth();

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadMyReservations();
    }
  }, [user?.id]);

  const loadActivities = async () => {
    try {
      const data = await apiService.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  const loadMyReservations = async () => {
    try {
      if (user?.id) {
        const reservations = await apiService.getReservationsByGuest(user.id);
        setMyReservations(reservations);
      }
    } catch (error) {
      console.error('Failed to load reservations:', error);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleBookActivity = (activity: ActivityItem) => {
    setSelectedActivity(activity);
    setSelectedDate(getTomorrowDate());
    setSelectedTime('');
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedActivity || !selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const reservationData = {
        guestId: user.id,
        activityType: selectedActivity.name,
        date: selectedDate,
        time: selectedTime,
        notes: `Booking for ${selectedActivity.name} - ${selectedActivity.description}`,
      };

      const result = await apiService.createReservation(reservationData);
      console.log('Reservation created successfully:', result);

      toast.success('Reservation submitted! Waiting for admin approval...');
      setShowBookingModal(false);
      setSelectedActivity(null);
      setSelectedDate('');
      setSelectedTime('');

      // Reload reservations
      await loadMyReservations();
    } catch (error: any) {
      console.error('Failed to make reservation:', error);

      // Re-fetch direct pour vérifier si la resa a quand même été crée
      try {
        await new Promise((res) => setTimeout(res, 800)); // petite attente
        const fresh = await apiService.getReservationsByGuest(String(user!.id));
        const found = fresh.find(
          (r: any) =>
            r.activityType === selectedActivity?.name &&
            // r.date peut être string ISO ou yyyy-mm-dd → on compare en slice
            String(r.date).slice(0, 10) === selectedDate &&
            String(r.time) === selectedTime
        );

        if (found) {
          toast.success('Reservation submitted! Waiting for admin approval...');
          setShowBookingModal(false);
          setSelectedActivity(null);
          setSelectedDate('');
          setSelectedTime('');
          setMyReservations(fresh);
          return;
        }
      } catch (reloadError) {
        console.error('Error checking reservation status:', reloadError);
      }

      if (error?.message?.includes('409')) {
        toast.error('This time slot is no longer available. Please select another time.');
      } else {
        toast.error('Failed to make reservation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (s: string | undefined) =>
    (s || '').toString().toLowerCase();

  const getStatusColor = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'pending':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  if (activitiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-8">
            <BackButton to="/dashboard" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activities</h1>
              <p className="text-gray-600">Discover unique experiences in Marrakech</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <BackButton to="/dashboard" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Activities & Experiences</h1>
            <p className="text-gray-600">Discover unique experiences in Marrakech</p>
          </div>
        </div>

        {/* Activities Grid */}
        {activities.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Available</h3>
            <p className="text-gray-600">Check back later for exciting activities and experiences.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                padding={false}
                className="overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={activity.imageUrl}
                    alt={activity.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                    <Star className="text-yellow-500 fill-current" size={14} />
                    <span className="text-sm font-medium">{activity.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ${activity.price}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-xl text-gray-900 mb-2">{activity.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{activity.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={16} />
                      <span>
                        {Math.floor(activity.durationMinutes / 60)}h{' '}
                        {activity.durationMinutes % 60}min
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={16} />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} />
                      <span>Max {activity.maxCapacity} guests</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBookActivity(activity)}
                    variant="primary"
                    className="w-full"
                    disabled={!activity.available}
                  >
                    {activity.available ? 'Book Now' : 'Not Available'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Current Reservations */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Reservations</h2>
          <div className="space-y-4">
            {myReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-2 opacity-50" />
                <p>No reservations yet</p>
                <p className="text-sm">Book an activity to see your reservations here</p>
              </div>
            ) : (
              myReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-purple-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {reservation.activityType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(reservation.date).toLocaleDateString()} at {reservation.time}
                    </p>
                    {reservation.notes && (
                      <p className="text-xs text-gray-500 mt-1">{reservation.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium px-3 py-1 rounded-full border ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {getStatusText(reservation.status)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {normalizeStatus(reservation.status) === 'pending' && 'Awaiting approval...'}
                      {normalizeStatus(reservation.status) === 'approved' && 'Ready to enjoy!'}
                      {normalizeStatus(reservation.status) === 'rejected' && 'Please contact reception'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Booking Modal */}
        <Modal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          title={`Book ${selectedActivity?.name}`}
          maxWidth="max-w-md"
        >
          {selectedActivity && (
            <div className="space-y-6">
              <div className="text-center">
                <img
                  src={selectedActivity.imageUrl}
                  alt={selectedActivity.name}
                  className="w-full h-32 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-lg">{selectedActivity.name}</h3>
                <p className="text-gray-600 text-sm">{selectedActivity.description}</p>
              </div>

              <div>
                <Input
                  label="Select Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTomorrowDate()}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Time Slots
                </label>

                {/* Déduplication + clés uniques */}
                {(() => {
                  const raw = (selectedActivity.availableTimeSlots ?? []).map((s) =>
                    String(s || '').trim()
                  );
                  const uniqueSlots = Array.from(new Set(raw));
                  return uniqueSlots.length ? (
                    <div className="grid grid-cols-3 gap-2">
                      {uniqueSlots.map((slot, idx) => (
                        <button
                          key={`slot-${idx}-${slot}`}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                            selectedTime === slot
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          type="button"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="col-span-3 text-sm text-gray-500 text-center py-4">
                      No time slots available
                    </p>
                  );
                })()}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-xl font-bold text-orange-600">
                    ${selectedActivity.price}
                  </span>
                </div>
              </div>

              <Button
                onClick={handleConfirmBooking}
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                disabled={!selectedDate || !selectedTime}
              >
                Confirm Booking
              </Button>
            </div>
          )}
        </Modal>
      </div>

      <Navigation />
    </div>
  );
};

export default Activities;
