const API = '/api';

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function initializePayment({ email, amount, metadata, channels, paymentMethod }, token) {
  const res = await fetch(`${API}/payments/initialize`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ email, amount, metadata, channels, paymentMethod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Payment initialization failed' }));
    throw new Error(err.error || 'Payment initialization failed');
  }
  return res.json();
}

export async function createVirtualAccount({ email, amount, reference }, token) {
  const res = await fetch(`${API}/payments/virtual-account`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ email, amount, reference }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Virtual account creation failed' }));
    throw new Error(err.error || 'Virtual account creation failed');
  }
  return res.json();
}

export async function checkPaymentStatus(reference, token) {
  const res = await fetch(`${API}/payments/status`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ reference }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Status check failed' }));
    throw new Error(err.error || 'Status check failed');
  }
  return res.json();
}

export async function verifyPayment(reference, token) {
  const res = await fetch(`${API}/payments/verify/${encodeURIComponent(reference)}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Verification failed' }));
    throw new Error(err.error || 'Verification failed');
  }
  return res.json();
}

export async function getOrderPaymentStatus(orderId, token) {
  const res = await fetch(`${API}/orders/${orderId}/payment-status`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to check order payment status');
  return res.json();
}

export async function getDeliveryFee(state, city) {
  const params = new URLSearchParams();
  if (state) params.set('state', state);
  if (city) params.set('city', city);
  const res = await fetch(`${API}/orders/delivery-fee?${params}`);
  if (!res.ok) return { deliveryFee: 2, zone: 'standard' };
  return res.json();
}

export async function getPaystackKey(token) {
  const res = await fetch(`${API}/payments/config`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getPaymentAnalytics(token) {
  const res = await fetch(`${API}/payments/analytics`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getAllPayments(token, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/payments?${query}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return { payments: [], total: 0 };
  return res.json();
}

export async function getPaymentByReference(reference, token) {
  const res = await fetch(`${API}/payments/${encodeURIComponent(reference)}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Payment not found');
  return res.json();
}
