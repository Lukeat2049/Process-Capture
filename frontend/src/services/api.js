const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  // ── AI ──────────────────────────────────────────────────
  chat(messages) {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },

  generateWorkflow(messages) {
    return request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },

  // ── Workflows ────────────────────────────────────────────
  getWorkflows() {
    return request('/workflows');
  },

  getWorkflow(id) {
    return request(`/workflows/${id}`);
  },

  saveWorkflow(data) {
    return request('/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWorkflow(id, data) {
    return request(`/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteWorkflow(id) {
    return request(`/workflows/${id}`, { method: 'DELETE' });
  },
};
