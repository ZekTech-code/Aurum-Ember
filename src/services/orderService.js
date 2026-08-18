const API = '/api';

function getHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function createOrder(orderData, token) {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create order' }));
    throw new Error(err.error || 'Failed to create order');
  }
  return res.json();
}

export async function getOrders(token, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API}/orders?${query}`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function updateOrder(orderId, updates, token) {
  const res = await fetch(`${API}/orders/${orderId}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update order');
  return res.json();
}

export async function cancelOrder(orderId, token) {
  const res = await fetch(`${API}/orders/${orderId}/cancel`, {
    method: 'PUT',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to cancel order');
  return res.json();
}

export async function markOrderPaid(orderId, { paymentMethod, notes }, token) {
  const res = await fetch(`${API}/orders/${orderId}/mark-paid`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify({ paymentMethod, notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to mark as paid' }));
    throw new Error(err.error || 'Failed to mark as paid');
  }
  return res.json();
}

export async function deleteOrder(orderId, token) {
  const res = await fetch(`${API}/orders/${orderId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete order');
  return res.json();
}

export async function getOrderNotifications(token) {
  const res = await fetch(`${API}/orders/notifications`, {
    headers: getHeaders(token),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function markNotificationRead(notificationId, token) {
  const res = await fetch(`${API}/users/notifications/${notificationId}`, {
    method: 'PUT',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to mark notification');
  return res.json();
}

export async function markAllNotificationsRead(token) {
  const res = await fetch(`${API}/users/notifications-read-all`, {
    method: 'PUT',
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to mark all notifications');
  return res.json();
}
