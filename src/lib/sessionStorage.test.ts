import { clearSession, loadSession, saveSession } from '@/lib/sessionStorage';
import type { AuthSession } from '@/types/models';

const session: AuthSession = {
  accessToken: 'token',
  expiresAt: Date.now() + 60_000,
  user: { id: 'user-1', email: 'user@example.com', name: 'Ada', role: 'USER' },
};

describe('sessionStorage', () => {
  it('persists and loads a valid session', () => {
    saveSession(session);
    expect(loadSession()).toEqual(session);
  });

  it('removes expired and malformed sessions', () => {
    saveSession({ ...session, expiresAt: Date.now() - 1 });
    expect(loadSession()).toBeNull();

    sessionStorage.setItem('subscription-portal.session', '{bad json');
    expect(loadSession()).toBeNull();
  });

  it('clears the stored session', () => {
    saveSession(session);
    clearSession();
    expect(loadSession()).toBeNull();
  });
});
