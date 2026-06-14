import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { authReducer } from '@/store/authSlice'
import { subscriptionRepository } from '@/services/subscriptionRepository'
import PaymentLogsPage from './PaymentLogsPage'

jest.mock('@/services/subscriptionRepository', () => ({
  subscriptionRepository: {
    getAdminSubscriptions: jest.fn(),
    getPaymentLogs: jest.fn(),
  },
}))

describe('PaymentLogsPage', () => {
  it('shows user and plan details for each payment', async () => {
    jest.mocked(subscriptionRepository.getPaymentLogs).mockResolvedValue({
      data: [{
        id: 'payment-1',
        userId: 'user-1',
        subscriptionId: 'subscription-1',
        amount: 999,
        currency: 'MXN',
        status: 'SUCCEEDED',
        paymentDate: '2026-06-14T07:04:00.000Z',
        transactionId: 'transaction-1',
      }],
      page: 1,
      limit: 20,
      total: 1,
    })
    jest.mocked(subscriptionRepository.getAdminSubscriptions).mockResolvedValue({
      data: [{
        subscriptionId: 'subscription-1',
        userId: 'user-1',
        userName: 'Ada Lovelace',
        userEmail: 'ada@example.com',
        status: 'ACTIVE',
        plan: {
          id: 'plan-1',
          name: 'Premium',
          price: 999,
          currency: 'MXN',
          billingPeriod: 'MONTHLY',
        },
        startedAt: '2026-06-01T00:00:00.000Z',
        expiresAt: null,
        cancelAtPeriodEnd: false,
      }],
      page: 1,
      limit: 100,
      total: 1,
    })

    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          session: {
            accessToken: 'jwt',
            expiresAt: Date.now() + 60_000,
            user: {
              id: 'admin-1',
              email: 'admin@example.com',
              name: 'Admin',
              role: 'ADMIN' as const,
            },
          },
          status: 'authenticated' as const,
          error: null,
        },
      },
    })

    render(
      <Provider store={store}>
        <PaymentLogsPage />
      </Provider>,
    )

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
    expect(screen.getByText('monthly')).toBeInTheDocument()
  })
})
