// Admin Panel Interfaces - Clean TypeScript only

export interface Guest {
  id: string;
  name: string;
  roomNumber: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  guest: Guest;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  durationMinutes: number;
  maxCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  guest: Guest;
  type: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  durationMinutes: number;
  maxCapacity: number;
  location: string;
  rating: number;
  availableTimeSlots: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityReservation {
  id: string;
  guest: Guest;
  activityType: string;
  date: string;
  time: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeautyProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  stockQuantity: number;
  size: string;
  rating: number;
  benefits: string[];
  ingredients: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BeautyOrder {
  id: string;
  guest: Guest;
  items: BeautyOrderItem[];
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  deliveryAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface BeautyOrderItem {
  id: string;
  beautyProduct: BeautyProduct;
  quantity: number;
  price: number;
}

export interface AdminStats {
  totalGuests: number;
  totalOrders: number;
  totalServiceRequests: number;
  totalReservations: number;
  revenue: number;
}

export interface HotelSettings {
  id: string;
  hotelName: string;
  address: string;
  phone: string;
  email: string;
  checkInTime: string;
  checkOutTime: string;
  currency: string;
  timezone: string;
  wifiPassword: string;
  emergencyNumber: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Status update request types
export interface OrderStatusUpdate {
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
}

export interface ServiceRequestStatusUpdate {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface ReservationStatusUpdate {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}