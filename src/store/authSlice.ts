import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { clearSession, loadSession, saveSession } from '@/lib/sessionStorage';
import { subscriptionRepository } from '@/services/subscriptionRepository';
import type { AuthSession } from '@/types/models';

interface AuthState {
  session: AuthSession | null
  status: 'idle' | 'loading' | 'authenticated' | 'error'
  error: string | null
}

const storedSession = loadSession();
const initialState: AuthState = {
  session: storedSession,
  status: storedSession ? 'authenticated' : 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) =>
    subscriptionRepository.login(email, password),
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.session = null
      state.status = 'idle'
      state.error = null
      clearSession()
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = 'authenticated';
        saveSession(action.payload);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message ?? 'Unable to sign in.';
      })
  },
});

export const { logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
