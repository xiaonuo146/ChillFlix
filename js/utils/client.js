import { CONFIG } from '../config.js';

export async function fetchClient(endpoint, options = {}) {
  const token = localStorage.getItem('chillflix_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const res = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      // Xử lý nhanh mã 401: Hết phiên đăng nhập
      if (res.status === 401) {
        localStorage.removeItem('chillflix_token');
        window.dispatchEvent(new CustomEvent('auth:required'));
      }
      throw new Error(data.message || `Lỗi yêu cầu: ${res.status}`);
    }

    return data;
  } catch (err) {
    console.error(`[API Error] tại ${endpoint}:`, err.message);
    throw err;
  }
}