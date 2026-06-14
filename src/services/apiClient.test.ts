import { ApiError, apiRequest } from '@/services/apiClient';

describe('apiRequest', () => {
  it('adds auth headers and returns JSON', async () => {
    jest.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    } as Response);

    await expect(apiRequest('/plans', { token: 'jwt', retries: 0 })).resolves.toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/v1/plans',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt' }),
      }),
    );
  })

  it('signals an expired session on unauthorized responses', async () => {
    const listener = jest.fn();
    window.addEventListener('auth:expired', listener);
    jest.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);

    await expect(apiRequest('/plans', { retries: 0 })).rejects.toMatchObject({
      code: 'unauthorized',
      status: 401,
    });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('auth:expired', listener);
  })

  it('maps network failures to a readable API error', async () => {
    jest.mocked(fetch).mockRejectedValue(new TypeError('offline'));

    await expect(apiRequest('/plans', { retries: 0 })).rejects.toEqual(
      new ApiError('Cannot reach the service. Check your connection.', 0, 'network'),
    );
  })

  it('maps validation failures without retrying', async () => {
    jest.mocked(fetch).mockResolvedValue({ ok: false, status: 400 } as Response);

    await expect(apiRequest('/checkout', { retries: 0 })).rejects.toMatchObject({
      code: 'validation',
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  })

  it('preserves conflict detail and does not expire the session on forbidden responses', async () => {
    const listener = jest.fn();
    window.addEventListener('auth:expired', listener);
    jest.mocked(fetch)
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ detail: 'Idempotency key payload changed.' }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => {
          throw new Error('no body')
        },
      } as unknown as Response);

    await expect(apiRequest('/checkout', { retries: 0 })).rejects.toMatchObject({
      code: 'conflict',
      message: 'Idempotency key payload changed.',
    });
    await expect(apiRequest('/admin', { retries: 0 })).rejects.toMatchObject({
      code: 'forbidden',
    });
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('auth:expired', listener);
  })

  it('maps a simulated payment decline', async () => {
    jest.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 402,
      json: async () => {
        throw new Error('no body')
      },
    } as unknown as Response);

    await expect(apiRequest('/checkout', { retries: 0 })).rejects.toMatchObject({
      code: 'payment_declined',
    });
  });
});
