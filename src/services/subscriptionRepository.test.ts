import { subscriptionRepository } from '@/services/subscriptionRepository'

describe('subscriptionRepository', () => {
  it('maps the backend login response into a persisted-session shape', async () => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(now)
    jest.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
          access_token: 'jwt',
          expires_in: 3600,
          user: { id: 'u1', email: 'ada@example.com', name: 'Ada', role: 'USER' },
        }),
    } as Response)

    await expect(subscriptionRepository.login('ada@example.com', 'secret')).resolves.toEqual({
      accessToken: 'jwt',
      expiresAt: now + 3_600_000,
      user: { id: 'u1', email: 'ada@example.com', name: 'Ada', role: 'USER' },
    })
  })

  it('sends checkout data and the idempotency key', async () => {
    jest.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ subscriptionId: 's1', status: 'ACTIVE' }),
    } as Response)

    await subscriptionRepository.checkout('jwt', 'plan-1', 'visa-4242', 'request-1')

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/subscriptions/checkout',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ planId: 'plan-1', paymentMethod: 'visa-4242' }),
        headers: expect.objectContaining({ 'Idempotency-Key': 'request-1' }),
      }),
    )
  })

  it('loads plans and subscriptions with the access token', async () => {
    jest.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], page: 1, limit: 20, total: 0 }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [], page: 1, limit: 20, total: 0 }),
      } as unknown as Response)

    await subscriptionRepository.getPlans('jwt')
    await subscriptionRepository.getSubscriptions('jwt', 'ADMIN')

    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/plans?page=1&limit=20'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer jwt' }) }),
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/subscriptions?page=1&limit=20'),
      expect.any(Object),
    )
  })

  it('normalizes a user subscription response and treats 404 as empty state', async () => {
    const subscription = {
      subscriptionId: 's1',
      userId: 'u1',
      userName: 'Ada',
      userEmail: 'ada@example.com',
      status: 'ACTIVE',
      plan: { id: 'p1', name: 'Pro', price: 29, currency: 'MXN', billingPeriod: 'MONTHLY' },
      startedAt: '2026-06-01T00:00:00.000Z',
      expiresAt: null,
      cancelAtPeriodEnd: false,
    }
    jest.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => subscription,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => {
          throw new Error('no body')
        },
      } as unknown as Response)

    await expect(subscriptionRepository.getSubscriptions('jwt', 'USER')).resolves.toEqual([subscription])
    await expect(subscriptionRepository.getSubscriptions('jwt', 'USER')).resolves.toEqual([])
  })
})
