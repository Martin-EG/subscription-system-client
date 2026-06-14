import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import LoginCard from '@/features/Login';

export default function LoginPage() {
  const { session } = useAppSelector((state) => state.auth);

  if (session) return <Navigate replace to="/" />;

  return (
    <main className="min-h-dvh bg-gradient-to-br from-blue-50 via-sky-50 to-blue-50 flex items-center justify-center p-4">
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <LoginCard />
        </div>
      </section>
    </main>
  )
}
