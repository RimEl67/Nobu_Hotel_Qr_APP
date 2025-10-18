// src/services/api.ts
import {
  MenuItem,
  ServiceItem,
  ActivityItem,
  Order,
  ServiceRequest,
  ActivityReservation,
} from '../types';

/**
 * Base URL (ex. http://localhost:8080/api)
 * Pense à définir VITE_API_URL dans ton .env si nécessaire
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

/* ---------------- Enums attendus côté Spring (robustes) ---------------- */
type ServiceRequestStatusApi = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
type ReservationStatusApi    = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
type OrderStatusApi          = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

const toApiServiceReqStatus = (s: string): ServiceRequestStatusApi =>
  (s || 'PENDING').toUpperCase() as ServiceRequestStatusApi;
const toApiReservationStatus = (s: string): ReservationStatusApi =>
  (s || 'PENDING').toUpperCase() as ReservationStatusApi;
const toApiOrderStatus = (s: string): OrderStatusApi =>
  (s || 'PENDING').toUpperCase() as OrderStatusApi;

/* -------------------------------- Helpers ------------------------------- */
const jsonOrText = async (res: Response) => {
  if (res.status === 204) return undefined; // No Content
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
};

class ApiService {
  private token: string | null = null;

  /* ------------------------------ Token -------------------------------- */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('hotel_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      const keys = ['hotel_token', 'kc_token', 'access_token', 'auth_token', 'id_token'];
      for (const k of keys) {
        const v = localStorage.getItem(k) || sessionStorage.getItem(k);
        if (v) { this.token = v; break; }
      }
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('hotel_token');
  }

  /* ------------------------------ Request ------------------------------ */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        Accept: 'application/json, text/plain;q=0.9,*/*;q=0.8',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
      body: options.body,
    };

    try {
      const res = await fetch(url, config);

      if (!res.ok) {
        let message = `HTTP ${res.status} ${res.statusText}`;
        try {
          const data = await jsonOrText(res);
          if (data && typeof data === 'object' && 'message' in (data as any)) {
            message = (data as any).message as string;
          } else if (data && typeof data === 'object' && 'error' in (data as any)) {
            message = (data as any).error as string;
          } else if (typeof data === 'string' && data.trim()) {
            message = data;
          }
        } catch { /* ignore parse error */ }
        throw new Error(message);
      }

      return (await jsonOrText(res)) as T;
    } catch (err) {
      console.error('API request failed:', { url, options: config, err });
      throw err;
    }
  }

  /* -------------------------------- Auth -------------------------------- */
  authenticateGuest(name: string, roomNumber: string, phone: string) {
    return this.request<any>('/guests/authenticate', {
      method: 'POST',
      body: JSON.stringify({ name, roomNumber, phone }),
    });
  }

  authenticateAdmin(username: string, password: string) {
    return this.request<any>('/admins/authenticate', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  /* ------------------------------ Menu --------------------------------- */
  getMenu(): Promise<MenuItem[]> {
    return this.request<MenuItem[]>('/menu');
  }

  /* ------------------------------ Orders ------------------------------- */
  createOrder(orderData: any): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  getOrders(): Promise<Order[]> {
    return this.request<Order[]>('/orders');
  }

  /** Utilisé par le dashboard pour notifier les changements des commandes */
  getGuestOrders(guestId: string): Promise<Order[]> {
    return this.request<Order[]>(`/orders/guest/${guestId}`);
  }

  updateOrderStatus(id: string, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: toApiOrderStatus(status) }),
    });
  }

  /* ----------------------------- Services ------------------------------ */
  getServices(): Promise<ServiceItem[]> {
    return this.request<ServiceItem[]>('/services');
  }

  getServicesByCategory(category: string): Promise<ServiceItem[]> {
    return this.request<ServiceItem[]>(`/services/category/${encodeURIComponent(category)}`);
  }

  /* ---------------------------- Activities ----------------------------- */
  getActivities(): Promise<ActivityItem[]> {
    return this.request<ActivityItem[]>('/activities');
  }

  getActivitiesByCategory(category: string): Promise<ActivityItem[]> {
    return this.request<ActivityItem[]>(`/activities/category/${encodeURIComponent(category)}`);
  }

  /* ------------------------ Service Requests (Guest + Admin) ----------- */
  createServiceRequest(requestData: any): Promise<ServiceRequest> {
    return this.request<ServiceRequest>('/service-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  getServiceRequests(): Promise<ServiceRequest[]> {
    return this.request<ServiceRequest[]>('/service-requests');
  }

  updateServiceRequestStatus(id: string, status: string): Promise<ServiceRequest> {
    return this.request<ServiceRequest>(`/service-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: toApiServiceReqStatus(status) }),
    });
  }

  /** ★ Utilisé par le dashboard pour les notifications */
  getServiceRequestsByGuest(guestId: string): Promise<ServiceRequest[]> {
    // Si ton backend expose /service-requests/guest/{id}
    return this.request<ServiceRequest[]>(`/service-requests/guest/${guestId}`);
  }

  /* --------------------------- Reservations ---------------------------- */
  createReservation(reservationData: any): Promise<ActivityReservation> {
    return this.request<ActivityReservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  }

  getReservations(): Promise<ActivityReservation[]> {
    return this.request<ActivityReservation[]>('/reservations');
  }

  /** ★ Utilisé par le dashboard pour les notifications */
  getReservationsByGuest(guestId: string): Promise<ActivityReservation[]> {
    return this.request<ActivityReservation[]>(`/reservations/guest/${guestId}`);
  }

  updateReservationStatus(id: string, status: string): Promise<ActivityReservation> {
    return this.request<ActivityReservation>(`/reservations/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: toApiReservationStatus(status) }),
    });
  }

  checkAvailability(activityType: string, date: string, time: string) {
    const qs = new URLSearchParams({ activityType, date, time }).toString();
    return this.request<any>(`/reservations/availability?${qs}`);
  }

  /* ---------------------- (Optionnel) Beauty Store --------------------- */
  getBeautyProducts(): Promise<any[]> {
    return this.request<any[]>('/beauty-products');
  }

  getBeautyProductsByCategory(category: string): Promise<any[]> {
    return this.request<any[]>(`/beauty-products/category/${encodeURIComponent(category)}`);
  }

  getBeautyProductById(id: string): Promise<any> {
    return this.request<any>(`/beauty-products/${id}`);
  }

  createBeautyOrder(orderData: any): Promise<any> {
    return this.request<any>('/beauty-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  getBeautyOrders(): Promise<any[]> {
    return this.request<any[]>('/beauty-orders');
  }

  getGuestBeautyOrders(guestId: string): Promise<any[]> {
    return this.request<any[]>(`/beauty-orders/guest/${guestId}`);
  }

  /* ------------------------------- Admin ------------------------------- */
  getAdminStats() {
    return this.request('/admin/stats');
  }

  getStatsByPeriod(period: string) {
    return this.request(`/admin/stats?period=${encodeURIComponent(period)}`);
  }

  /** Liste admin des clients */
  getGuests(): Promise<any[]> {
    return this.request<any[]>('/admin/guests');
  }

  getGuestById(id: string): Promise<any> {
    return this.request<any>(`/admin/guests/${id}`);
  }

  /** ★ Pour la page Admin/Guests : mise à jour d’un client */
  updateGuest(id: string, data: any): Promise<any> {
    return this.request<any>(`/admin/guests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /** ★ Pour la page Admin/Guests : suppression d’un client */
  deleteGuest(id: string): Promise<void> {
    return this.request<void>(`/admin/guests/${id}`, { method: 'DELETE' });
  }

  getAdminSettings(): Promise<any> {
    return this.request<any>('/admin/settings');
  }

  updateAdminSettings(data: any): Promise<any> {
    return this.request<any>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  getAdminOrders(): Promise<Order[]> {
    return this.request<Order[]>('/admin/orders');
  }

  /** Vue admin : tente /admin/... avec fallback automatique vers la route publique si nécessaire */
  async getAdminServiceRequests(): Promise<ServiceRequest[]> {
    try {
      return await this.request<ServiceRequest[]>('/admin/service-requests');
    } catch (e: any) {
      console.warn('getAdminServiceRequests: fallback -> /service-requests', e?.message);
      return this.request<ServiceRequest[]>('/service-requests');
    }
  }

  async getAdminReservations(): Promise<ActivityReservation[]> {
    try {
      return await this.request<ActivityReservation[]>('/admin/reservations');
    } catch (e: any) {
      console.warn('getAdminReservations: fallback -> /reservations', e?.message);
      return this.request<ActivityReservation[]>('/reservations');
    }
  }

  /* CRUD Services (catalogue) côté admin */
  createService(serviceData: any): Promise<ServiceItem> {
    return this.request<ServiceItem>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  updateService(id: string, serviceData: any): Promise<ServiceItem> {
    return this.request<ServiceItem>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  deleteService(id: string): Promise<void> {
    return this.request<void>(`/admin/services/${id}`, { method: 'DELETE' });
  }

  /* ------------------- (Optionnel) Notifications API ------------------- */
  /**
   * Si tu exposes une route dédiée type /notifications/guest/{id}
   * tu peux l’utiliser au lieu de reconstituer via commandes/demandes/réservations.
   * Elle n’est pas utilisée par ton Dashboard actuel, mais tu peux l’activer si besoin.
   */
  getNotificationsByGuest(guestId: string): Promise<any[]> {
    return this.request<any[]>(`/notifications/guest/${guestId}`);
  }
}

export const apiService = new ApiService();