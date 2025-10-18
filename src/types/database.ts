// Database entity interfaces for admin panel

export interface Guest {
  id: number;
  name: string;
  roomNumber: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: number;
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
  id: number;
  guest: Guest;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
  price: number;
}

export interface Service {
  id: number;
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
  id: number;
  guest: Guest;
  type: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
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
  id: number;
  beautyProduct: BeautyProduct;
  quantity: number;
  price: number;
}

export interface Admin {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'RECEPTIONIST';
  createdAt: string;
  updatedAt: string;
}

// Admin dashboard statistics
export interface AdminStats {
  totalGuests: number;
  totalOrders: number;
  totalServiceRequests: number;
  totalReservations: number;
  revenue: number;
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

// Order status update request
export interface OrderStatusUpdate {
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';
}

// Service request status update
export interface ServiceRequestStatusUpdate {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

// Activity reservation status update
export interface ReservationStatusUpdate {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}