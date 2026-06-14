import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/authSlice';

const LoginPage = lazy(() => import('@/pages/LoginPage'));

const LoadingScreen = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-sm font-bold text-cyan-300">
      Loading your portal...
    </div>
  )
}

const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const expireSession = () => {
      dispatch(logout());
    }
    window.addEventListener('auth:expired', expireSession)
    return () => window.removeEventListener('auth:expired', expireSession)
  }, [dispatch]);

  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<LoginPage />} path="/login" />
        </Routes>
      </Suspense>
    </>
  )
}

export default App;