const crypto = require('crypto');

class SessionStore {
  constructor() {
    this.sessions = new Map();
    this.cleanupInterval = 60 * 1000; // 1 minute
    setInterval(() => this.cleanup(), this.cleanupInterval);
  }

  createSession(data) {
    console.log(crypto.randomBytes(16));
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = Date.now() + 2 * 60 * 1000;
    this.sessions.set(token, { ...data, expiresAt });
    return token;
  }

  getSession(token) {
    const session = this.sessions.get(token);
    if (session && session.expiresAt > Date.now()) {
      return session;
    }
    this.sessions.delete(token);
    return null;
  }

  deleteSession(token) {
    return this.sessions.delete(token);
  }

  cleanup() {
    const now = Date.now();
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(token);
      }
    }
  }
}

module.exports = new SessionStore();
