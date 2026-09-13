import { OrderStatus, DeliveryStatus } from '@/types';

// Valid state transitions for orders
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  created: ['payment_pending', 'cancelled'],
  payment_pending: ['payment_confirmed', 'payment_failed', 'cancelled'],
  payment_confirmed: ['processing', 'cancelled', 'refunded'],
  processing: ['assigned_to_runner', 'cancelled', 'refunded'],
  assigned_to_runner: ['runner_picked_up', 'cancelled', 'refunded'],
  runner_picked_up: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled', 'disputed'],
  delivered: ['completed', 'disputed'],
  completed: [],
  payment_failed: ['created', 'cancelled'],
  cancelled: [],
  refunded: [],
  disputed: ['completed', 'refunded', 'cancelled'],
};

// Valid state transitions for deliveries
export const DELIVERY_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  pending: ['accepted', 'cancelled'],
  accepted: ['en_route_to_pickup', 'cancelled'],
  en_route_to_pickup: ['arrived_at_pickup', 'cancelled'],
  arrived_at_pickup: ['pickup_confirmed', 'cancelled'],
  pickup_confirmed: ['en_route_to_delivery', 'cancelled'],
  en_route_to_delivery: ['arrived_at_delivery', 'failed'],
  arrived_at_delivery: ['delivery_confirmed', 'failed'],
  delivery_confirmed: ['completed', 'failed'],
  completed: [],
  cancelled: [],
  failed: ['pending'],
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  const validTransitions = ORDER_TRANSITIONS[currentStatus];
  return validTransitions.includes(newStatus);
}

export function canTransitionDelivery(
  currentStatus: DeliveryStatus,
  newStatus: DeliveryStatus
): boolean {
  const validTransitions = DELIVERY_TRANSITIONS[currentStatus];
  return validTransitions.includes(newStatus);
}

export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    created: 'Created',
    payment_pending: 'Payment Pending',
    payment_confirmed: 'Payment Confirmed',
    processing: 'Processing',
    assigned_to_runner: 'Runner Assigned',
    runner_picked_up: 'Picked Up',
    in_transit: 'In Transit',
    delivered: 'Delivered',
    completed: 'Completed',
    payment_failed: 'Payment Failed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    disputed: 'Disputed',
  };
  return labels[status] || status;
}

export function getDeliveryStatusLabel(status: DeliveryStatus): string {
  const labels: Record<DeliveryStatus, string> = {
    pending: 'Pending',
    accepted: 'Accepted',
    en_route_to_pickup: 'En Route to Pickup',
    arrived_at_pickup: 'Arrived at Pickup',
    pickup_confirmed: 'Pickup Confirmed',
    en_route_to_delivery: 'En Route to Delivery',
    arrived_at_delivery: 'Arrived at Delivery',
    delivery_confirmed: 'Delivery Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    failed: 'Failed',
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    created: 'text-gray-500',
    payment_pending: 'text-yellow-500',
    payment_confirmed: 'text-green-500',
    processing: 'text-blue-500',
    assigned_to_runner: 'text-purple-500',
    runner_picked_up: 'text-purple-500',
    in_transit: 'text-blue-500',
    delivered: 'text-green-500',
    completed: 'text-green-500',
    payment_failed: 'text-red-500',
    cancelled: 'text-red-500',
    refunded: 'text-orange-500',
    disputed: 'text-red-500',
  };
  return colors[status] || 'text-gray-500';
}

export function isOrderActive(status: OrderStatus): boolean {
  return !['completed', 'cancelled', 'refunded'].includes(status);
}

export function isOrderCancellable(status: OrderStatus): boolean {
  return ['created', 'payment_pending', 'processing'].includes(status);
}

export function isOrderRefundable(status: OrderStatus): boolean {
  return ['payment_confirmed', 'processing', 'assigned_to_runner'].includes(status);
}
