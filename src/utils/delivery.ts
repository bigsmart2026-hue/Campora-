/**
 * Generate a 6-digit delivery PIN
 */
export async function generateDeliveryPin(): Promise<string> {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte % 10).join('');
}

/**
 * Hash a delivery PIN with SHA-256
 */
export async function hashDeliveryPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + 'campora-delivery-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}