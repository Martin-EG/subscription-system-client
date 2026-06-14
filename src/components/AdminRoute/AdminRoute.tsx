import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

const AdminRoute = () => {
  const role = useAppSelector((state) => state.auth.session?.user.role)

  return role === 'ADMIN' ? <Outlet /> : <Navigate replace to="/" />
}

export default AdminRoute
