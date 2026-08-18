const PAYSTACK_URL = 'https://js.paystack.co/v1/inline.js';

let loaded = false;
let loading = false;

export function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (loaded && window.PaystackPop) return resolve();
    if (loading) {
      const check = setInterval(() => {
        if (loaded && window.PaystackPop) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    loading = true;

    const existing = document.querySelector(`script[src="${PAYSTACK_URL}"]`);
    if (existing) {
      if (window.PaystackPop) {
        loaded = true;
        loading = false;
        return resolve();
      }
      existing.addEventListener('load', () => {
        loaded = true;
        loading = false;
        resolve();
      });
      existing.addEventListener('error', () => {
        loading = false;
        reject(new Error('Failed to load Paystack'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = PAYSTACK_URL;
    script.onload = () => {
      loaded = true;
      loading = false;
      resolve();
    };
    script.onerror = () => {
      loading = false;
      reject(new Error('Failed to load Paystack'));
    };
    document.head.appendChild(script);
  });
}

export function generateRef(prefix = 'AE') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
