export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED'
export type BillingPeriod = 'MONTHLY' | 'YEARLY' | null

export interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN' | null
}

export interface AuthSession {
  accessToken: string
  expiresAt: number
  user: User
}

export interface Plan {
  id: string
  name: string
  price: number
  currency: string
  billingPeriod: BillingPeriod
}

export interface Subscription {
  subscriptionId: string
  userId: string
  userName: string
  userEmail: string
  status: SubscriptionStatus
  plan: Plan
  startedAt: string
  expiresAt: string | null
  cancelAtPeriodEnd: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total: number
}

export interface SubscriptionMutation {
  subscriptionId: string
  status: SubscriptionStatus
  expiresAt: string | null
  cancelAtPeriodEnd: boolean
}

export interface PaymentLog {
  id: string
  userId: string
  subscriptionId: string
  amount: number
  currency: string
  status: string
  paymentDate: string
  transactionId: string
}
