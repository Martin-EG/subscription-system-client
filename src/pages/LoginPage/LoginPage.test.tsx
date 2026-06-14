jest.mock('@/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

jest.mock('@/features/Login', () => ({
  __esModule: true,
  default: () => <div>Login card</div>,
}));

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

import LoginPage from './LoginPage';

const mockedUseAppSelector = jest.mocked(useAppSelector);

describe('LoginPage', () => {
  it('renders the login card when there is no active session', () => {
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          session: null,
          status: 'idle',
          error: null,
        },
      } as Parameters<typeof selector>[0]),
    );

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Login card')).toBeInTheDocument();
  });

  it('redirects authenticated users to the home page', () => {
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          session: {
            accessToken: 'token',
            expiresAt: Date.now() + 60_000,
            user: {
              id: 'user-1',
              email: 'user@example.com',
              name: 'Test User',
              role: 'USER',
            },
          },
          status: 'authenticated',
          error: null,
        },
      } as Parameters<typeof selector>[0]),
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.queryByText('Login card')).not.toBeInTheDocument();
  });
});
