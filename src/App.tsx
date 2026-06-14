import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell, ProtectedRoute, ToastRegion } from '@/components/'
import { useAppDispatch } from '@/store/hooks'
import { logout } from '@/store/authSlice'
import { notify } from '@/store/notificationSlice'

const DashboardPage = lazy(() => import('@/pages/DashboardPage/DashboardPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage/LoginPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage/NotFoundPage'))

const LoadingScreen = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-sm font-bold text-cyan-300">
      Loading your portal...
    </div>
  )
}

const App = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const expireSession = () => {
      dispatch(logout())
      dispatch(notify({
        title: 'Session expired',
        message: 'Sign in again to continue securely.',
        tone: 'info',
      }))
    }
    window.addEventListener('auth:expired', expireSession)
    return () => window.removeEventListener('auth:expired', expireSession)
  }, [dispatch])

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route element={<DashboardPage />} index />
            </Route>
          </Route>
          <Route element={<NotFoundPage />} path="*" />
        </Routes>
      </Suspense>
      <ToastRegion />
    </>
  )
}

export default App;
