import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchPlans } from '@/store/subscriptionSlice'
import PlansError from './PlansError'
import PlansEmptyState from './PlansEmptyState'
import PlansContent from './PlansContent'

const PlansLifecycle = () => {
  const dispatch = useAppDispatch()
  const plans = useAppSelector((state) => state.subscriptions.plans)
  const status = useAppSelector((state) => state.subscriptions.status)
  const error = useAppSelector((state) => state.subscriptions.error)

  useEffect(() => {
    if (!plans.length) void dispatch(fetchPlans())
  }, [dispatch, plans.length]);

  if (status === 'loading' && !plans.length) {
    return (
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => <div className="h-[30rem] animate-pulse rounded-[2rem] bg-slate-200" key={item} />)}
      </div>
    );
  }

  if (error && !plans.length) {
    return <PlansError />
  }

  if (status !== 'loading' && !plans.length) {
    return <PlansEmptyState />
  }

  return (
    <PlansContent />
  )
}

export default PlansLifecycle
