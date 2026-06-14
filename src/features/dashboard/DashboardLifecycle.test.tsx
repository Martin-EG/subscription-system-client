jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

jest.mock('./DashboardError', () => ({
  __esModule: true,
  default: () => <div>Dashboard error</div>,
}));

jest.mock('./DashboardEmptyState', () => ({
  __esModule: true,
  default: () => <div>Dashboard empty state</div>,
}));

jest.mock('./DashboardContent', () => ({
  __esModule: true,
  default: ({ currentSubscription }: { currentSubscription: { subscriptionId: string } }) => (
    <div>Dashboard content {currentSubscription.subscriptionId}</div>
  ),
}));

import { render, screen } from '@testing-library/react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Subscription } from '@/types/models';

import DashboardLifecycle from './DashboardLifecycle';

const mockedUseAppDispatch = jest.mocked(useAppDispatch);
const mockedUseAppSelector = jest.mocked(useAppSelector);

const subscription: Subscription = {
  subscriptionId: 'subscription-1',
  userId: 'user-1',
  userName: 'Test User',
  userEmail: 'user@example.com',
  status: 'ACTIVE',
  plan: {
    id: 'plan-1',
    name: 'Premium',
    price: 19.99,
    currency: 'USD',
    billingPeriod: 'MONTHLY',
  },
  startedAt: '2026-01-15T12:00:00.000Z',
  expiresAt: '2026-07-15T12:00:00.000Z',
  cancelAtPeriodEnd: false,
};

describe('DashboardLifecycle', () => {
  const dispatch = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
    dispatch.mockReturnValue({ type: 'subscriptions/fetchSubscriptions/pending' });
    mockedUseAppDispatch.mockReturnValue(dispatch);
  });

  it('fetches subscriptions and renders a loading skeleton', () => {
    mockedUseAppSelector.mockReturnValue({
      subscriptions: [],
      plans: [],
      status: 'loading',
      checkoutStatus: 'idle',
      error: null,
    });

    const { container } = render(<DashboardLifecycle />);

    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(container.querySelectorAll('.animate-pulse > div')).toHaveLength(3);
  });

  it('renders the error state when loading fails', () => {
    mockedUseAppSelector.mockReturnValue({
      subscriptions: [],
      plans: [],
      status: 'error',
      checkoutStatus: 'idle',
      error: 'Unable to load subscriptions.',
    });

    render(<DashboardLifecycle />);

    expect(screen.getByText('Dashboard error')).toBeInTheDocument();
  });

  it('renders the empty state when no subscription exists', () => {
    mockedUseAppSelector.mockReturnValue({
      subscriptions: [],
      plans: [],
      status: 'ready',
      checkoutStatus: 'idle',
      error: null,
    });

    render(<DashboardLifecycle />);

    expect(screen.getByText('Dashboard empty state')).toBeInTheDocument();
  });

  it('renders the first current subscription', () => {
    mockedUseAppSelector.mockReturnValue({
      subscriptions: [subscription],
      plans: [],
      status: 'ready',
      checkoutStatus: 'idle',
      error: null,
    });

    render(<DashboardLifecycle />);

    expect(screen.getByText('Dashboard content subscription-1')).toBeInTheDocument();
  });
});
