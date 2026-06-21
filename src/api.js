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
      throw new Error(data.message || 'Sunucu hatası. Lütfen birkaç saniye sonra tekrar deneyin.');
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
  message: (payload) => request('/api/messages', { method: 'POST', body: JSON.stringify(payload) }),
  trackVisit: payload => request('/api/analytics/visit', { method: 'POST', body: JSON.stringify(payload) }),
  trackClick: payload => request('/api/analytics/click', { method: 'POST', body: JSON.stringify(payload) }),
  analytics: () => request('/api/admin/analytics'),
  staffUsers: () => request('/api/admin/staff-users'),
  createStaffUser: payload =>
    request('/api/admin/staff-users', { method: 'POST', body: JSON.stringify(payload) }),
  updateStaffUser: (id, payload) =>
    request(`/api/admin/staff-users/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteStaffUser: id => request(`/api/admin/staff-users/${id}`, { method: 'DELETE' }),
  updateProfile: async payload => {
    const result = await request('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) });
    if (result.token) setAuthToken(result.token);
    return result;
  },
  listSiteBackups: () => request('/api/admin/site-backups'),
  exportSiteBackup: () => request('/api/admin/site-backups/export'),
  saveSiteBackup: label =>
    request('/api/admin/site-backups', { method: 'POST', body: JSON.stringify({ label: label || '' }) }),
  restoreSiteBackup: payload =>
    request('/api/admin/site-backups/restore', { method: 'POST', body: JSON.stringify(payload) }),
  deleteSiteBackup: filename =>
    request(`/api/admin/site-backups/${encodeURIComponent(filename)}`, { method: 'DELETE' }),
  downloadSiteBackup: async filename => {
    const token = readToken();
    const response = await fetch(`${API_BASE}/api/admin/site-backups/${encodeURIComponent(filename)}/download`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || 'Yedek indirilemedi');
    }
    return response.blob();
  }
};
