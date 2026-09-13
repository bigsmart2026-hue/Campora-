export type UserRole = 'buyer' | 'seller' | 'runner' | 'admin' | 'inspector';

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export type ProductStatus = 'active' | 'sold' | 'reserved' | 'removed' | 'under_review';

export type ProductCondition = 'new' | 'like_new' | 'good' | 'fair';

export type OrderStatus =
  | 'created'
  | 'payment_pending'
  | 'payment_confirmed'
  | 'processing'
  | 'assigned_to_runner'
  | 'runner_picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'payment_failed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type DeliveryStatus =
  | 'pending'
  | 'accepted'
  | 'en_route_to_pickup'
  | 'arrived_at_pickup'
  | 'pickup_confirmed'
  | 'en_route_to_delivery'
  | 'arrived_at_delivery'
  | 'delivery_confirmed'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  campus?: string;
  role: UserRole;
  isCampusVerified: boolean;
  isIdVerified: boolean;
  verificationDoc?: string;
  createdAt: Date;
  updatedAt: Date;
  reputation: {
    averageRating: number;
    totalReviews: number;
    successfulTransactions: number;
  };
  isActive: boolean;
}

export interface Campus {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  isActive: boolean;
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
  };
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  condition: ProductCondition;
  campus: string;
  status: ProductStatus;
  isInspected: boolean;
  inspectionId?: string;
  trustScore: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  productCount?: number;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  timestamp: Date;
  actorId?: string;
  note?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  runnerId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  paymentRef?: string;
  status: OrderStatus;
  deliveryAddress: {
    address: string;
    lat: number;
    lng: number;
    landmark?: string;
  };
  pickupLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryPin?: string;
  timeline: OrderTimeline[];
  campus: string;
  createdAt: Date;
  updatedAt: Date;
  disputeId?: string;
}

export interface DeliveryTimeline {
  status: DeliveryStatus;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface Delivery {
  id: string;
  orderId: string;
  runnerId: string;
  status: DeliveryStatus;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryPin: string;
  estimatedTime?: number;
  actualTime?: number;
  fee: number;
  tip?: number;
  route?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    polyline?: string;
  };
  geofence?: {
    pickupRadius: number;
    deliveryRadius: number;
  };
  pickupConfirmed: boolean;
  deliveryConfirmed: boolean;
  timeline: DeliveryTimeline[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  productId: string;
  rating: number;
  comment?: string;
  images?: string[];
  isVisible: boolean;
  createdAt: Date;
}

export interface Verification {
  id: string;
  userId: string;
  type: 'campus_id' | 'student_id' | 'seller';
  documentUrls: string[];
  status: VerificationStatus;
  reviewedBy?: string;
  reviewNote?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  expiresAt?: Date;
}

export interface Dispute {
  id: string;
  orderId: string;
  filedBy: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
  status: DisputeStatus;
  resolution?: string;
  adminId?: string;
  timeline: {
    action: string;
    timestamp: Date;
    actorId?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

export type InspectionStatus = 'requested' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Inspection {
  id: string;
  productId: string;
  requestId: string;
  inspectorId?: string;
  status: InspectionStatus;
  result?: 'passed' | 'failed' | 'partial';
  images?: string[];
  notes?: string;
  scheduledDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
