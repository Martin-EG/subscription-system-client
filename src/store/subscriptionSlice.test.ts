jest.mock('@/services/subscriptionRepository', () => ({
  subscriptionRepository: {
    checkout: jest.fn(),
    getPlans: jest.fn(),
    getSubscriptions: jest.fn(),
  },
}));

import { subscriptionRepository } from '@/services/subscriptionRepository';
import {
  checkout,
  fetchPlans,
  fetchSubscriptions,
  resetCheckout,
  subscriptionReducer,
} from '@/store/subscriptionSlice';
import type {
  AuthSession,
  Plan,
  Subscription,
  SubscriptionMutation,
} from '@/types/models';

const plan: Plan = {
  id: 'plan-1',
  name: 'Premium',
  price: 1999,
  currency: 'USD',
  billingPeriod: 'MONTHLY',
};

const subscription: Subscription = {
  subscriptionId: 'subscription-1',
  userId: 'user-1',
  userName: 'Test User',
  userEmail: 'user@example.com',
  status: 'ACTIVE',
  plan,
  startedAt: '2026-06-14T12:00:00.000Z',
  expiresAt: null,
  cancelAtPeriodEnd: false,
};

const session: AuthSession = {
  accessToken: 'access-token',
  expiresAt: Date.now() + 60_000,
  user: {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: 'ADMIN',
  },
};

const getState = () => ({
  auth: {
    session,
    status: 'authenticated' as const,
    error: null,
  },
  notifications: [],
  subscriptions: subscriptionReducer(undefined, { type: 'init' }),
});

describe('subscriptionSlice', () => {
  const mockedCheckout = jest.mocked(subscriptionRepository.checkout);
  const mockedGetPlans = jest.mocked(subscriptionRepository.getPlans);
  const mockedGetSubscriptions = jest.mocked(subscriptionRepository.getSubscriptions);

  beforeEach(() => {
    mockedCheckout.mockReset();
    mockedGetPlans.mockReset();
    mockedGetSubscriptions.mockReset();
  });

  it('loads plans into state', () => {
    const loadingState = subscriptionReducer(
      undefined,
      fetchPlans.pending('request-1', undefined),
    );
    const readyState = subscriptionReducer(
      loadingState,
      fetchPlans.fulfilled([plan], 'request-1', undefined),
    );

    expect(loadingState.status).toBe('loading');
    expect(readyState).toMatchObject({
      plans: [plan],
      status: 'ready',
    });
  });

  it('loads subscriptions into state', () => {
    const state = subscriptionReducer(
      undefined,
      fetchSubscriptions.fulfilled([subscription], 'request-1', undefined),
    );

    expect(state).toMatchObject({
      subscriptions: [subscription],
      status: 'ready',
    });
  });

  it('tracks checkout progress and resets its result', () => {
    const loadingState = subscriptionReducer(
      {
        plans: [],
        subscriptions: [],
        status: 'idle',
        checkoutStatus: 'error',
        error: 'Previous error',
      },
      checkout.pending('request-1', {
        planId: 'plan-1',
        paymentMethod: 'pm_test',
      }),
    );
    const successState = subscriptionReducer(
      loadingState,
      checkout.fulfilled(
        {} as SubscriptionMutation,
        'request-1',
        { planId: 'plan-1', paymentMethod: 'pm_test' },
      ),
    );

    expect(loadingState).toMatchObject({
      checkoutStatus: 'loading',
      error: null,
    });
    expect(successState.checkoutStatus).toBe('success');
    expect(subscriptionReducer(successState, resetCheckout())).toMatchObject({
      checkoutStatus: 'idle',
      error: null,
    });
  });

  it('records rejected requests and marks checkout failures', () => {
    const plansState = subscriptionReducer(
      undefined,
      fetchPlans.rejected(new Error('Plans unavailable.'), 'request-1', undefined),
    );
    const checkoutState = subscriptionReducer(
      undefined,
      checkout.rejected(
        new Error('Payment declined.'),
        'request-2',
        { planId: 'plan-1', paymentMethod: 'pm_test' },
      ),
    );

    expect(plansState).toMatchObject({
      status: 'error',
      error: 'Plans unavailable.',
      checkoutStatus: 'idle',
    });
    expect(checkoutState).toMatchObject({
      status: 'error',
      error: 'Payment declined.',
      checkoutStatus: 'error',
    });
  });

  it('passes the session token to the plans repository', async () => {
    mockedGetPlans.mockResolvedValue({
      data: [plan],
      page: 1,
      limit: 20,
      total: 1,
    });

    const action = await fetchPlans()(jest.fn(), getState, undefined);

    expect(mockedGetPlans).toHaveBeenCalledWith('access-token');
    expect(fetchPlans.fulfilled.match(action)).toBe(true);
    expect(action.payload).toEqual([plan]);
  });

  it('passes the user role when fetching subscriptions', async () => {
    mockedGetSubscriptions.mockResolvedValue([subscription]);

    const action = await fetchSubscriptions()(jest.fn(), getState, undefined);

    expect(mockedGetSubscriptions).toHaveBeenCalledWith('access-token', 'ADMIN');
    expect(fetchSubscriptions.fulfilled.match(action)).toBe(true);
  });

  it('creates an idempotency key when checking out', async () => {
    const result: SubscriptionMutation = {
      subscriptionId: 'subscription-1',
      status: 'ACTIVE',
      expiresAt: null,
      cancelAtPeriodEnd: false,
    };
    mockedCheckout.mockResolvedValue(result);
    jest.spyOn(crypto, 'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000001');

    const action = await checkout({
      planId: 'plan-1',
      paymentMethod: 'pm_test',
    })(jest.fn(), getState, undefined);

    expect(mockedCheckout).toHaveBeenCalledWith(
      'access-token',
      'plan-1',
      'pm_test',
      '00000000-0000-4000-8000-000000000001',
    );
    expect(checkout.fulfilled.match(action)).toBe(true);
    expect(action.payload).toEqual(result);
  });

  it('rejects protected requests when there is no session token', async () => {
    const action = await fetchPlans()(
      jest.fn(),
      () => ({
        ...getState(),
        auth: {
          session: null,
          status: 'idle' as const,
          error: null,
        },
      }),
      undefined,
    );

    if (!fetchPlans.rejected.match(action)) {
      throw new Error('Expected fetchPlans to be rejected.');
    }

    expect(action.error.message).toBe('Authentication is required.');
    expect(mockedGetPlans).not.toHaveBeenCalled();
  });
});
