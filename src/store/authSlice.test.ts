import { configureStore } from '@reduxjs/toolkit';
import { loadSession } from '@/lib/sessionStorage';
import { subscriptionRepository } from '@/services/subscriptionRepository';
import { authReducer, login, logout } from '@/store/authSlice';
import type { AuthSession } from '@/types/models';

jest.mock('@/services/subscriptionRepository', () => ({
  subscriptionRepository: {
    login: jest.fn(),
  },
}));

const session: AuthSession = {
  accessToken: 'access-token',
  expiresAt: Date.now() + 60_000,
  user: {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'USER',
  },
};

describe('authSlice', () => {
  const mockedLogin = jest.mocked(subscriptionRepository.login);

  beforeEach(() => {
    mockedLogin.mockReset();
  });

  it('sets loading state when login starts', () => {
    const state = authReducer(
      {
        session: null,
        status: 'error',
        error: 'Previous error',
      },
      login.pending('request-1', {
        email: 'user@example.com',
        password: 'password',
      }),
    );

    expect(state).toEqual({
      session: null,
      status: 'loading',
      error: null,
    });
  });

  it('authenticates and persists the session after a successful login', async () => {
    mockedLogin.mockResolvedValue(session);
    const store = configureStore({ reducer: authReducer });

    const action = await store.dispatch(
      login({ email: 'user@example.com', password: 'password' }),
    );

    expect(mockedLogin).toHaveBeenCalledWith('user@example.com', 'password');
    expect(login.fulfilled.match(action)).toBe(true);
    expect(store.getState()).toEqual({
      session,
      status: 'authenticated',
      error: null,
    });
    expect(loadSession()).toEqual(session);
  });

  it('stores the error when login fails', async () => {
    mockedLogin.mockRejectedValue(new Error('Invalid credentials.'));
    const store = configureStore({ reducer: authReducer });

    const action = await store.dispatch(
      login({ email: 'user@example.com', password: 'wrong-password' }),
    );

    expect(login.rejected.match(action)).toBe(true);
    expect(store.getState()).toEqual({
      session: null,
      status: 'error',
      error: 'Invalid credentials.',
    });
  });

  it('clears the authenticated session on logout', () => {
    const authenticatedState = authReducer(
      undefined,
      login.fulfilled(session, 'request-1', {
        email: 'user@example.com',
        password: 'password',
      }),
    );

    expect(loadSession()).toEqual(session);

    const state = authReducer(authenticatedState, logout());

    expect(state).toEqual({
      session: null,
      status: 'idle',
      error: null,
    });
    expect(loadSession()).toBeNull();
  });
});
