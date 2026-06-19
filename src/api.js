const API_BASE = '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 400 && path.includes('/auth/login')) {
      throw new Error(data.message || 'E-posta veya şifre hatalı');
    }
    if (response.status === 0 || response.status >= 500) {
      throw new Error('Sunucuya bağlanılamadı. npm start ile backend çalıştığından emin olun.');
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
  login: (payload) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  saveSetting: (key, value) =>
    request(`/api/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/api/admin/upload`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Yükleme başarısız');
    return data;
  },
  reserve: (payload) => request('/api/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  message: (payload) => request('/api/messages', { method: 'POST', body: JSON.stringify(payload) })
};