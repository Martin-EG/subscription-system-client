jest.mock('@/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

import ProtectedRoute from './ProtectedRoute';

const mockedUseAppSelector = jest.mocked(useAppSelector);

const LoginDestination = () => {
  const location = useLocation();
  const state = location.state as { from?: string } | null;

  return <div>Login from {state?.from ?? 'unknown'}</div>;
};

const renderRoutes = () =>
  render(
    <MemoryRouter initialEntries={['/billing']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/billing" element={<div>Protected billing page</div>} />
        </Route>
        <Route path="/login" element={<LoginDestination />} />
      </Routes>
    </MemoryRouter>,
  );

describe('ProtectedRoute', () => {
  it('renders the nested route when a session exists', () => {
    mockedUseAppSelector.mockReturnValue({
      accessToken: 'access-token',
      expiresAt: Date.now() + 60_000,
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'USER',
      },
    });

    renderRoutes();

    expect(screen.getByText('Protected billing page')).toBeInTheDocument();
  });

  it('redirects anonymous users to login and preserves their origin', () => {
    mockedUseAppSelector.mockReturnValue(null);

    renderRoutes();

    expect(screen.getByText('Login from /billing')).toBeInTheDocument();
    expect(screen.queryByText('Protected billing page')).not.toBeInTheDocument();
  });
});
