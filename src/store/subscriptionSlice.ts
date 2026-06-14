import { createAsyncThunk, createSlice, isRejected } from '@reduxjs/toolkit'
import { subscriptionRepository } from '@/services/subscriptionRepository'
import type { RootState } from '@/store'
import type { Plan, Subscription } from '@/types/models'

interface SubscriptionState {
  plans: Plan[]
  subscriptions: Subscription[]
  status: 'idle' | 'loading' | 'ready' | 'error'
  checkoutStatus: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
}

const initialState: SubscriptionState = {
  plans: [],
  subscriptions: [],
  status: 'idle',
  checkoutStatus: 'idle',
  error: null,
}

const tokenFrom = (state: RootState) => {
  const token = state.auth.session?.accessToken
  if (!token) throw new Error('Authentication is required.')
  return token
}

export const fetchPlans = createAsyncThunk('subscriptions/fetchPlans', async (_, { getState }) => {
  const response = await subscriptionRepository.getPlans(tokenFrom(getState() as RootState))
  return response.data
})

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (_, { getState }) => {
    const state = getState() as RootState
    return subscriptionRepository.getSubscriptions(tokenFrom(state), state.auth.session?.user.role ?? null)
  },
)

export const checkout = createAsyncThunk(
  'subscriptions/checkout',
  async (
    { planId, paymentMethod }: { planId: string; paymentMethod: string },
    { getState },
  ) => {
    const result = await subscriptionRepository.checkout(
      tokenFrom(getState() as RootState),
      planId,
      paymentMethod,
      crypto.randomUUID(),
    )
    return result
  },
)

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    resetCheckout(state) {
      state.checkoutStatus = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plans = action.payload
        state.status = 'ready'
      })
      .addCase(fetchSubscriptions.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.subscriptions = action.payload
        state.status = 'ready'
      })
      .addCase(checkout.pending, (state) => {
        state.checkoutStatus = 'loading'
        state.error = null
      })
      .addCase(checkout.fulfilled, (state) => {
        state.checkoutStatus = 'success'
      })
      .addMatcher(
        isRejected(fetchPlans, fetchSubscriptions, checkout),
        (state, action) => {
          state.status = 'error'
          state.error = action.error?.message ?? 'Something went wrong.'
          if (action.type.includes('checkout')) state.checkoutStatus = 'error'
        },
      )
  },
})

export const { resetCheckout } = subscriptionSlice.actions
export const subscriptionReducer = subscriptionSlice.reducer
