import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSubscriptions } from '@/store/subscriptionSlice';

import DashboardError from './DashboardError';
import DashboardEmptyState from './DashboardEmptyState';
import DashboardContent from './DashboardContent';

const DashboardLifecycle = () => {
  const dispatch = useAppDispatch()
  const subscriptions = useAppSelector((state) => state.subscriptions.subscriptions)
  const status = useAppSelector((state) => state.subscriptions.status)
  const error = useAppSelector((state) => state.subscriptions.error)
  const currentSubscription = subscriptions[0]

  useEffect(() => {
    void dispatch(fetchSubscriptions())
  }, [dispatch]);

  if (status === 'loading' && !currentSubscription) {
    return (
      <div className="mt-10 grid animate-pulse gap-5 lg:grid-cols-3">
        {[1, 2, 3].map((item) => <div className="h-44 rounded-3xl bg-slate-200" key={item} />)}
      </div>
    );
  } 

  if(error) {
    return (
      <DashboardError />
    );
  }

  if(!currentSubscription && status !== 'loading') {
    return (
      <DashboardEmptyState />
    )
  }

  if(currentSubscription) {
    return (
       <DashboardContent currentSubscription={currentSubscription}/>
    )
  }

  return null;
}

export default DashboardLifecycle;
