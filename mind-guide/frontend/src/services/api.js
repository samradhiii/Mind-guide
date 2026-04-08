const API_BASE = 'https://mind-guide-r3yx-ml1y3hvim-samradhi-guptas-projects.vercel.app';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    signup: (data) => request('/signup', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/login', { method: 'POST', body: JSON.stringify(data) }),
  },
  profile: {
    get: () => request('/profile'),
    update: (data) => request('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  },
  checkin: {
    create: (data) => request('/checkin', { method: 'POST', body: JSON.stringify(data) }),
  },
  chat: {
    send: (message) => request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
    history: () => request('/chat'),
  },
  simulate: {
    run: (habits, months) => request('/simulate', { method: 'POST', body: JSON.stringify({ habits, months }) }),
  },
  insights: {
    get: () => request('/insights'),
  },
};
