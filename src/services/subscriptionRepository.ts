import { ApiError, apiRequest } from '@/services/apiClient';
import type {
  AuthSession,
  PaginatedResponse,
  PaymentLog,
  Plan,
  Subscription,
  SubscriptionMutation,
  User,
} from '@/types/models';

interface LoginResponse {
  access_token: string
  expires_in: number
  user: User
}

export const subscriptionRepository = {
  async login(email: string, password: string): Promise<AuthSession> {
    const result = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      retries: 0,
    });

    return {
      accessToken: result.access_token,
      expiresAt: Date.now() + result.expires_in * 1000,
      user: result.user,
    };
  },

  getPlans(token: string): Promise<PaginatedResponse<Plan>> {
    return apiRequest('/plans?page=1&limit=20', { token })
  },

  getPaymentLogs(
    token: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<PaymentLog>> {
    return apiRequest(`/payments?page=${page}&limit=${limit}`, { token })
  },

  getAdminSubscriptions(
    token: string,
    limit = 100,
  ): Promise<PaginatedResponse<Subscription>> {
    return apiRequest(`/subscriptions?page=1&limit=${limit}`, { token })
  },

  async getSubscriptions(token: string, role: User['role']): Promise<Subscription[]> {
    try {
      const response = await apiRequest<PaginatedResponse<Subscription> | Subscription>(
        '/subscriptions?page=1&limit=20',
        { token },
      );
      return role === 'ADMIN' ? (response as PaginatedResponse<Subscription>).data : [response as Subscription];
    } catch (error) {
      if (error instanceof ApiError && error.status === 404 && role !== 'ADMIN') return [];
      throw error;
    }
  },

  checkout(
    token: string,
    planId: string,
    paymentMethod: string,
    idempotencyKey: string,
  ): Promise<SubscriptionMutation> {
    return apiRequest('/subscriptions/checkout', {
      method: 'POST',
      token,
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ planId, paymentMethod }),
    });
  },
};
