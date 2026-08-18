import process from 'node:process';

const BASE_URL = 'https://api.paystack.co';

function getSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY;
}

function isDemoMode() {
  const key = getSecretKey();
  return !key || key.includes('placeholder');
}

async function request(path, options = {}) {
  const secretKey = getSecretKey();
  if (isDemoMode()) {
    return { status: true, message: 'Demo mode - simulation active', data: {} };
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return await res.json();
}

export async function initializeTransaction({ email, amount, reference, metadata = {}, channels, callback_url }) {
  const body = {
    email,
    amount: Math.round(amount * 100),
    reference,
    metadata,
    callback_url: callback_url || process.env.FRONTEND_URL || 'http://localhost:5173/order-success',
  };

  if (channels && Array.isArray(channels) && channels.length > 0) {
    body.channels = channels;
  }

  return await request('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function verifyTransaction(reference) {
  return await request(`/transaction/verify/${reference}`);
}

export async function createDedicatedAccount({ email, amount, reference }) {
  if (isDemoMode()) {
    return {
      status: true,
      message: 'Demo mode - virtual account simulated',
      data: {
        account_number: '8012345678',
        bank_name: 'Wema Bank',
        account_name: 'Aurum & Ember / AE',
        amount,
        reference,
        expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
    };
  }

  const customerRes = await request('/customer', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!customerRes.status) {
    throw new Error('Failed to create Paystack customer');
  }

  const dedicatedRes = await request('/dedicated_account', {
    method: 'POST',
    body: JSON.stringify({
      customer: customerRes.data.id,
      preferred_bank: 'wema-bank',
    }),
  });

  if (!dedicatedRes.status) {
    throw new Error('Failed to create dedicated account');
  }

  return {
    status: true,
    data: {
      account_number: dedicatedRes.data.account_number,
      bank_name: dedicatedRes.data.bank?.name || 'Wema Bank',
      account_name: dedicatedRes.data.account_name,
      amount,
      reference,
      expiration: dedicatedRes.data.expiration || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    },
  };
}

export function generateReference(prefix = 'AE') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${Date.now()}-${code}`;
}

export { isDemoMode };
