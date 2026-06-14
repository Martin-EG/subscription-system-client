import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginCard from '@/features/Login/LoginCard';
import { login } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

const mockedUseAppDispatch = jest.mocked(useAppDispatch);
const mockedUseAppSelector = jest.mocked(useAppSelector);
const mockedUseLocation = jest.mocked(useLocation);
const mockedUseNavigate = jest.mocked(useNavigate);

describe('LoginCard', () => {
  const dispatch = jest.fn();
  const navigate = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
    navigate.mockReset();
    mockedUseAppDispatch.mockReturnValue(dispatch);
    mockedUseNavigate.mockReturnValue(navigate);
    mockedUseLocation.mockReturnValue({
      hash: '',
      key: 'default',
      pathname: '/login',
      search: '',
      state: null,
    });
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          session: null,
          status: 'idle',
          error: null,
        },
      } as Parameters<typeof selector>[0]),
    );
  });

  it('renders the sign-in form', () => {
    render(<LoginCard />);

    expect(screen.getByRole('heading', { name: 'Sign in to your account' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('shows validation errors and does not dispatch invalid credentials', async () => {
    const user = userEvent.setup();
    render(<LoginCard />);

    await user.type(screen.getByLabelText('Email address'), 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('dispatches valid credentials and returns to the requested page', async () => {
    const user = userEvent.setup();
    const credentials = {
      email: 'user@example.com',
      password: 'password',
    };
    mockedUseLocation.mockReturnValue({
      hash: '',
      key: 'login',
      pathname: '/login',
      search: '',
      state: { from: '/billing' },
    });
    dispatch.mockResolvedValue(login.fulfilled({} as never, 'request-1', credentials));
    render(<LoginCard />);

    await user.type(screen.getByLabelText('Email address'), credentials.email);
    await user.type(screen.getByLabelText('Password'), credentials.password);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(navigate).toHaveBeenCalledWith('/billing', { replace: true });
  });

  it('shows the server error and disables the button while loading', () => {
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({
        auth: {
          session: null,
          status: 'loading',
          error: 'Invalid email or password.',
        },
      } as Parameters<typeof selector>[0]),
    );

    render(<LoginCard />);

    expect(screen.getByText('Invalid email or password.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });
});
