jest.mock('@/components', () => ({
  StatusBadge: ({ status }: { status: string }) => <span>Status: {status}</span>,
}));

import { render, screen } from '@testing-library/react';
import type { Subscription } from '@/types/models';

import DashboardContent from './DashboardContent';

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

describe('DashboardContent', () => {
  it('renders the current subscription details', () => {
    render(<DashboardContent currentSubscription={subscription} />);

    expect(screen.getByRole('heading', { name: 'Premium' })).toBeInTheDocument();
    expect(screen.getAllByText('Status: ACTIVE')).toHaveLength(2);
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('Jul 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText('per monthly')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('MONTHLY')).toBeInTheDocument();
    expect(screen.getByText('On')).toBeInTheDocument();
  });

  it('renders fallback values for flexible subscriptions without an expiry', () => {
    render(
      <DashboardContent
        currentSubscription={{
          ...subscription,
          expiresAt: null,
          cancelAtPeriodEnd: true,
          plan: {
            ...subscription.plan,
            billingPeriod: null,
          },
        }}
      />,
    );

    expect(screen.getByText('No expiry date')).toBeInTheDocument();
    expect(screen.getByText('per period')).toBeInTheDocument();
    expect(screen.getByText('Flexible')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
  });
});
