import { Link } from 'react-router-dom'
import Button from '@/components/Button/Button'

const NotFoundPage = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white">
      <div>
        <p className="text-sm font-bold tracking-[0.2em] text-cyan-300">404</p>
        <h1 className="font-display mt-4 text-5xl font-semibold">This page does not exist.</h1>
        <Button as={Link} className="mt-8 no-underline" to="/">Return to dashboard</Button>
      </div>
    </main>
  )
}

export default NotFoundPage;