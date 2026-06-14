import { RefreshCw } from 'lucide-react';
import { Button } from '@/components';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPlans } from '@/store/subscriptionSlice';

const PlansError = () => {
  const dispatch = useAppDispatch()
  const { error } = useAppSelector((state) => state.subscriptions)

  return (
    <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
      <p className="font-bold text-rose-800">Plans are taking longer than expected.</p>
      <p className="mt-2 text-sm text-rose-700">{error}</p>
      <Button $secondary className="mt-5" onClick={() => void dispatch(fetchPlans())} type="button">
        <RefreshCw size={16} /> Try again
      </Button>
    </div>
  );
}

export default PlansError
