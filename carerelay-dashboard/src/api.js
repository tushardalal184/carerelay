/**
 * CareRelay Enterprise Gateway Client
 * Communicates with Spring Cloud Gateway (http://localhost:8080/api/v1)
 */

const GATEWAY_BASE = 'http://localhost:8080/api/v1';

class CareRelayApi {
  constructor() {
    this.token = localStorage.getItem('carerelay_token') || '';
    this.isBackendOnline = false;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('carerelay_token', token);
    } else {
      localStorage.removeItem('carerelay_token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1800);
      const res = await fetch('http://localhost:8080/actuator/health', {
        signal: controller.signal
      });
      clearTimeout(id);
      this.isBackendOnline = res.ok;
      return res.ok;
    } catch {
      this.isBackendOnline = false;
      return false;
    }
  }

  async login(email, password) {
    const res = await fetch(`${GATEWAY_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      throw new Error(`Authentication failed (${res.status})`);
    }
    const data = await res.json();
    this.setToken(data.token);
    return data;
  }

  async ensureAuthenticated() {
    if (this.token) return true;
    try {
      await this.login('alice.smith@hospital.org', 'password123');
      return true;
    } catch {
      return false;
    }
  }

  async register(userData) {
    const res = await fetch(`${GATEWAY_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      throw new Error(`Registration failed (${res.status})`);
    }
    return res.json();
  }

  async createPatient(patientData) {
    const res = await fetch(`${GATEWAY_BASE}/patients`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(patientData)
    });
    if (!res.ok) {
      throw new Error(`Patient onboarding failed (${res.status})`);
    }
    return res.json();
  }

  async searchPatients(query = '') {
    const res = await fetch(`${GATEWAY_BASE}/patients/search?query=${encodeURIComponent(query)}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`Search patients failed (${res.status})`);
    return res.json();
  }

  async getReferrals(page = 0, size = 50) {
    const res = await fetch(`${GATEWAY_BASE}/referrals?page=${page}&size=${size}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch referrals failed: ${res.status}`);
    return res.json();
  }

  async getReferralDetail(id) {
    const res = await fetch(`${GATEWAY_BASE}/referrals/${id}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch detail failed: ${res.status}`);
    return res.json();
  }

  async createReferral(payload) {
    const res = await fetch(`${GATEWAY_BASE}/referrals`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Initiate referral failed: ${res.status}`);
    return res.json();
  }

  async acceptReferral(id) {
    const res = await fetch(`${GATEWAY_BASE}/referrals/${id}/accept`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`Accept referral failed: ${res.status}`);
    return res.json();
  }

  async confirmHandoff(id) {
    const res = await fetch(`${GATEWAY_BASE}/referrals/${id}/confirm`, {
      method: 'PUT',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`Confirm handoff failed: ${res.status}`);
    return res.json();
  }

  async cancelReferral(id, reason) {
    const res = await fetch(`${GATEWAY_BASE}/referrals/${id}/cancel`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error(`Cancel referral failed: ${res.status}`);
    return res.json();
  }

  async getPatientRecords(patientId) {
    const res = await fetch(`${GATEWAY_BASE}/patients/${patientId}/records`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch records failed: ${res.status}`);
    return res.json();
  }

  async getNotifications() {
    const res = await fetch(`${GATEWAY_BASE}/notifications/my`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`Fetch alerts failed: ${res.status}`);
    return res.json();
  }

  async generateAiBriefing(referralId) {
    const res = await fetch(`${GATEWAY_BASE}/ai/handoff-summary/${referralId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error(`AI generation failed: ${res.status}`);
    return res.json();
  }
}

export const api = new CareRelayApi();
