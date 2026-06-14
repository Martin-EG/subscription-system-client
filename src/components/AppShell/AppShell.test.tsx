import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { authReducer, login } from '@/store/authSlice'
import { notificationReducer } from '@/store/notificationSlice'
import { subscriptionReducer } from '@/store/subscriptionSlice'
import AppShell from './AppShell'

function renderShell() {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      notifications: notificationReducer,
      subscriptions: subscriptionReducer,
    },
  })

  store.dispatch(login.fulfilled(
    {
      accessToken: 'jwt',
      expiresAt: Date.now() + 60_000,
      user: {
        id: 'user-1',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        role: 'USER',
      },
    },
    'login-request',
    { email: 'ada@example.com', password: 'password' },
  ))

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<p>Login screen</p>} path="/login" />
          <Route element={<AppShell />}>
            <Route element={<p>Dashboard content</p>} index />
            <Route element={<p>Plans content</p>} path="plans" />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  )

  return store
}

describe('AppShell', () => {
  it('renders account details and navigation links', () => {
    renderShell()

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Plans' })).toHaveAttribute('href', '/plans')
    expect(screen.getByText('Dashboard content')).toBeInTheDocument()
  })

  it('opens and closes the mobile navigation overlay', async () => {
    const user = userEvent.setup()
    renderShell()

    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(screen.getByRole('button', { name: 'Close navigation overlay' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close navigation overlay' }))
    expect(screen.queryByRole('button', { name: 'Close navigation overlay' })).not.toBeInTheDocument()
  })

  it('clears the session and navigates to login', async () => {
    const user = userEvent.setup()
    const store = renderShell()

    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(store.getState().auth.session).toBeNull()
    expect(screen.getByText('Login screen')).toBeInTheDocument()
  })
})
