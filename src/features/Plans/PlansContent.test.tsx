jest.mock('@/components', () => ({
  Button: ({
    children,
    className,
    disabled,
    onClick,
    type,
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { $secondary?: boolean }) => (
    <button className={className} disabled={disabled} onClick={onClick} type={type}>
      {children}
    </button>
  ),
  CheckoutDialog: ({
    plan,
    onClose,
  }: {
    plan: { name: string };
    onClose: () => void;
  }) => (
    <div role="dialog">
      Checkout {plan.name}
      <button onClick={onClose} type="button">Close dialog</button>
    </div>
  ),
}));

jest.mock('@/store/hooks', () => ({
  useAppSelector: jest.fn(),
}));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppSelector } from '@/store/hooks';
import type { Plan, Subscription } from '@/types/models';

import PlansContent from './PlansContent';

const mockedUseAppSelector = jest.mocked(useAppSelector);

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 10,
    currency: 'USD',
    billingPeriod: 'MONTHLY',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 25,
    currency: 'USD',
    billingPeriod: 'YEARLY',
  },
];

const activeSubscription: Subscription = {
  subscriptionId: 'subscription-1',
  userId: 'user-1',
  userName: 'Test User',
  userEmail: 'user@example.com',
  status: 'ACTIVE',
  plan: plans[0],
  startedAt: '2026-01-01T00:00:00.000Z',
  expiresAt: null,
  cancelAtPeriodEnd: false,
};

const setSubscriptionState = (subscriptions: Subscription[] = []) => {
  mockedUseAppSelector.mockImplementation((selector) =>
    selector({
      subscriptions: {
        plans,
        subscriptions,
        status: 'ready',
        checkoutStatus: 'idle',
        error: null,
      },
    } as Parameters<typeof selector>[0]),
  );
};

describe('PlansContent', () => {
  it('renders plan pricing, benefits, and the featured plan', () => {
    setSubscriptionState();

    render(<PlansContent />);

    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('$10')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
    expect(screen.getByText('MOST POPULAR')).toBeInTheDocument();
    expect(screen.getAllByText('Instant premium access')).toHaveLength(2);
  });

  it('disables the plan that is already active', () => {
    setSubscriptionState([activeSubscription]);

    render(<PlansContent />);

    expect(screen.getByRole('button', { name: 'Choose Basic' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Choose Premium' })).toBeEnabled();
  });

  it('opens and closes checkout for the selected plan', async () => {
    const user = userEvent.setup();
    const numberFormatSpy = jest.spyOn(Intl, 'NumberFormat');
    setSubscriptionState();
    render(<PlansContent />);
    const initialFormatCount = numberFormatSpy.mock.calls.length;

    await user.click(screen.getByRole('button', { name: 'Choose Premium' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Checkout Premium');
    expect(numberFormatSpy).toHaveBeenCalledTimes(initialFormatCount);

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(numberFormatSpy).toHaveBeenCalledTimes(initialFormatCount);

    numberFormatSpy.mockRestore();
  });
});
