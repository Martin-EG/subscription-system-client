import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

const ProtectedRoute = () => {
  const session = useAppSelector((state) => state.auth.session)
  const location = useLocation()

  return session 
    ? <Outlet /> 
    : <Navigate replace state={{ from: location.pathname }} to="/login" />
}

export default ProtectedRoute;
