import { configureStore } from '@reduxjs/toolkit'
import { act, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import App from '@/App'
import { authReducer } from '@/store/authSlice'
import { notificationReducer } from '@/store/notificationSlice'
import { subscriptionReducer } from '@/store/subscriptionSlice'

jest.mock('@/pages/LoginPage/LoginPage', () => ({
  __esModule: true,
  default: () => <h1>Sign in to your account</h1>,
}))

jest.mock('@/pages/DashboardPage/DashboardPage', () => ({
  __esModule: true,
  default: () => <h1>Dashboard</h1>,
}))

jest.mock('@/pages/PlansPage/PlansPage', () => ({
  __esModule: true,
  default: () => <h1>Plans</h1>,
}))

jest.mock('@/pages/NotFoundPage/NotFoundPage', () => ({
  __esModule: true,
  default: () => <h1>Not found</h1>,
}))

function renderApp() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationReducer,
      subscriptions: subscriptionReducer,
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    </Provider>,
  )

  return store
}

describe('App', () => {
  it('renders the lazy login route', async () => {
    renderApp()

    expect(await screen.findByRole('heading', { name: 'Sign in to your account' })).toBeInTheDocument()
  })

  it('clears auth and announces when the session expires', async () => {
    const store = renderApp()

    await act(async () => {
      window.dispatchEvent(new Event('auth:expired'))
    })

    expect(store.getState().auth.session).toBeNull()
    expect(await screen.findByText('Session expired')).toBeInTheDocument()
    expect(screen.getByText('Sign in again to continue securely.')).toBeInTheDocument()
  })
})
