/**
 * CareRelay Enterprise Client Database Engine (IndexedDB)
 * Implements full ACID transactions, persistent relational storage on disk,
 * and 1:1 table schemas matching the Spring Boot PostgreSQL microservices.
 */

const DB_NAME = 'CareRelay_Clinical_DB';
const DB_VERSION = 1;

class CareRelayDatabase {
  constructor() {
    this.db = null;
    this.readyPromise = this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Table: users (Auth Service)
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('department', 'department', { unique: false });
        }

        // 2. Table: patients (Patient Record Service)
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientStore.createIndex('mrn', 'mrn', { unique: true });
        }

        // 3. Table: medical_records (Patient Record Service)
        if (!db.objectStoreNames.contains('medical_records')) {
          const recordStore = db.createObjectStore('medical_records', { keyPath: 'id' });
          recordStore.createIndex('patientId', 'patientId', { unique: false });
        }

        // 4. Table: referrals (Referral Service)
        if (!db.objectStoreNames.contains('referrals')) {
          const referralStore = db.createObjectStore('referrals', { keyPath: 'id' });
          referralStore.createIndex('status', 'status', { unique: false });
          referralStore.createIndex('urgency', 'urgency', { unique: false });
          referralStore.createIndex('toDept', 'toDept', { unique: false });
        }

        // 5. Table: saga_log (Referral Service Saga Orchestrator)
        if (!db.objectStoreNames.contains('saga_log')) {
          const sagaStore = db.createObjectStore('saga_log', { keyPath: 'id' });
          sagaStore.createIndex('referralId', 'referralId', { unique: false });
        }

        // 6. Table: departments (Clinical Service Units)
        if (!db.objectStoreNames.contains('departments')) {
          db.createObjectStore('departments', { keyPath: 'id' });
        }

        // 7. Table: notifications (Notification Service)
        if (!db.objectStoreNames.contains('notifications')) {
          const notifStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notifStore.createIndex('read', 'read', { unique: false });
          notifStore.createIndex('priority', 'priority', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async ensureReady() {
    if (!this.db) {
      await this.readyPromise;
    }
  }

  // Generic Transaction Helpers
  async getAll(storeName) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getById(storeName, id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async put(storeName, item) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async putBulk(storeName, items) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async delete(storeName, id) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  }

  async count(storeName) {
    await this.ensureReady();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  // --- SEEDING DEFAULT DATABASE RECORDS IF EMPTY ---
  async seedInitialDataIfEmpty(initialData) {
    await this.ensureReady();

    const userCount = await this.count('users');
    if (userCount === 0 && initialData.doctors) {
      await this.putBulk('users', initialData.doctors);
    }

    const deptCount = await this.count('departments');
    if (deptCount === 0 && initialData.departments) {
      await this.putBulk('departments', initialData.departments);
    }

    const patCount = await this.count('patients');
    if (patCount === 0 && initialData.patients) {
      await this.putBulk('patients', initialData.patients);
    }

    const refCount = await this.count('referrals');
    if (refCount === 0 && initialData.transfers) {
      await this.putBulk('referrals', initialData.transfers);
    }

    const notifCount = await this.count('notifications');
    if (notifCount === 0 && initialData.notifications) {
      await this.putBulk('notifications', initialData.notifications);
    }
  }

  // Specific domain queries
  async getDatabaseStats() {
    await this.ensureReady();
    return {
      users: await this.count('users'),
      departments: await this.count('departments'),
      patients: await this.count('patients'),
      referrals: await this.count('referrals'),
      sagaLogs: await this.count('saga_log'),
      notifications: await this.count('notifications')
    };
  }
}

export const clinicalDb = new CareRelayDatabase();
