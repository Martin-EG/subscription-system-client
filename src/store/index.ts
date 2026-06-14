import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '@/store/authSlice';
import { notificationReducer } from '@/store/notificationSlice';
import { subscriptionReducer } from '@/store/subscriptionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationReducer,
    subscriptions: subscriptionReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
