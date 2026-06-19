const API_BASE = '';
const TOKEN_KEY = 'peakspor_admin_token';

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

async function request(path, options = {}) {
  const token = readToken();
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 400 && path.includes('/auth/login')) {
      throw new Error(data.message || 'E-posta veya şifre hatalı');
    }
    if (response.status >= 500) {
      throw new Error(data.message || 'Sunucu hatası. npm start ile backend çalıştığından emin olun.');
    }
    throw new Error(data.message || 'İşlem başarısız oldu');
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  me: () => request('/api/me'),
  content: () => request('/api/content'),
  publicData: () => request('/api/public'),
  dashboard: () => request('/api/admin/dashboard'),
  resource: (name) => request(`/api/admin/${name}`),
  login: async payload => {
    const result = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    if (result.token) setAuthToken(result.token);
    return result;
  },
  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken('');
    }
  },
  saveSetting: (key, value) =>
    request(`/api/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  upload: async (file) => {
    const token = readToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/api/admin/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Yükleme başarısız');
    return data;
  },
  reserve: (payload) => request('/api/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  message: (payload) => request('/api/messages', { method: 'POST', body: JSON.stringify(payload) })
};
