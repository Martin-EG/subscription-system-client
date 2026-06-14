import type { AuthSession } from '@/types/models';

const SESSION_KEY = 'subscription-portal.session';

export function loadSession(): AuthSession | null {
  try {
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;

    const session = JSON.parse(value) as AuthSession;
    if (!session.accessToken || session.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(session: AuthSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
