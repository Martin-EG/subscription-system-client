jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { checkout, resetCheckout } from '@/store/subscriptionSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Plan } from '@/types/models';

import CheckoutDialog from './CheckoutDialog';

const mockedUseAppDispatch = jest.mocked(useAppDispatch);
const mockedUseAppSelector = jest.mocked(useAppSelector);

const plan: Plan = {
  id: 'premium',
  name: 'Premium',
  price: 25,
  currency: 'USD',
  billingPeriod: 'MONTHLY',
};

const setState = (
  checkoutStatus: 'idle' | 'loading' | 'success' | 'error' = 'idle',
  error: string | null = null,
) => {
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
      notifications: [],
      subscriptions: {
        plans: [plan],
        subscriptions: [],
        status: 'ready',
        checkoutStatus,
        error,
      },
    } as Parameters<typeof selector>[0]),
  );
};

describe('CheckoutDialog', () => {
  const dispatch = jest.fn();
  const onClose = jest.fn();

  beforeEach(() => {
    dispatch.mockReset();
    onClose.mockReset();
    mockedUseAppDispatch.mockReturnValue(dispatch);
  });

  it('renders plan details and lets the user choose a payment method', async () => {
    const user = userEvent.setup();
    setState();
    render(<CheckoutDialog onClose={onClose} plan={plan} />);

    expect(screen.getByRole('dialog', { name: 'Complete your purchase' })).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();
    expect(screen.getByText('Billed monthly to user@example.com')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Test User');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('readonly');
    expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveValue('user@example.com');
    expect(screen.getByRole('textbox', { name: 'Email address' })).toHaveAttribute('readonly');

    const declinedCard = screen.getByRole('radio', { name: /Test declined card/i });
    await user.click(declinedCard);
    expect(declinedCard).toBeChecked();
  });

  it('submits checkout and refreshes subscriptions after success', async () => {
    const user = userEvent.setup();
    setState();
    dispatch.mockResolvedValueOnce(
      checkout.fulfilled(
        {
          subscriptionId: 'subscription-1',
          status: 'ACTIVE',
          expiresAt: null,
          cancelAtPeriodEnd: false,
        },
        'request-1',
        { planId: 'premium', paymentMethod: 'simulated-card' },
      ),
    );
    render(<CheckoutDialog onClose={onClose} plan={plan} />);

    await user.click(screen.getByRole('button', { name: 'Pay securely' }));

    expect(dispatch.mock.calls[0]?.[0]).toEqual(expect.any(Function));
    expect(dispatch.mock.calls[1]?.[0]).toMatchObject({
      type: 'notifications/notify',
      payload: {
        title: 'Payment confirmed',
        message: 'Premium is active. Your dashboard is being refreshed.',
        tone: 'success',
      },
    });
    expect(dispatch.mock.calls[2]?.[0]).toEqual(expect.any(Function));
  });

  it('shows loading and error states', () => {
    setState('loading', 'Payment was declined.');
    render(<CheckoutDialog onClose={onClose} plan={plan} />);

    expect(screen.getByText('Payment was declined.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Processing payment...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Close checkout' })).toBeDisabled();
  });

  it('closes with Escape unless checkout is loading', () => {
    setState();
    const { rerender } = render(<CheckoutDialog onClose={onClose} plan={plan} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    setState('loading');
    rerender(<CheckoutDialog onClose={onClose} plan={plan} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('resets checkout state when closed after success', async () => {
    const user = userEvent.setup();
    setState('success');
    render(<CheckoutDialog onClose={onClose} plan={plan} />);

    expect(screen.getByText('You are all set.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Done' }));

    expect(dispatch).toHaveBeenCalledWith(resetCheckout());
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
