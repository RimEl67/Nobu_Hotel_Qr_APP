export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roomNumber?: string;
  role: 'guest' | 'admin';
  token: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
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
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface ServiceRequest {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ActivityReservation {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber: string;
  activityType: string;
  date: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
}

export interface AdminStats {
  totalGuests: number;
  totalOrders: number;
  totalServiceRequests: number;
  totalReservations: number;
  revenue: number;
}