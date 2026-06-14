import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminRoute from './AdminRoute'
import { authReducer } from '@/store/authSlice'

const renderRoute = (role: 'USER' | 'ADMIN') => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        session: {
          accessToken: 'jwt',
          expiresAt: Date.now() + 60_000,
          user: { id: 'u1', email: 'admin@example.com', name: 'Admin', role },
        },
        status: 'authenticated' as const,
        error: null,
      },
    },
  })

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/admin/payment-logs']}>
        <Routes>
          <Route element={<div>Dashboard</div>} path="/" />
          <Route element={<AdminRoute />}>
            <Route element={<div>Payment logs</div>} path="/admin/payment-logs" />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('AdminRoute', () => {
  it('renders the admin page for administrators', () => {
    renderRoute('ADMIN')
    expect(screen.getByText('Payment logs')).toBeInTheDocument()
  })

  it('redirects regular users to the dashboard', () => {
    renderRoute('USER')
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
