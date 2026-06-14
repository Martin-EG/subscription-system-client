import { useAppSelector } from '@/store/hooks'

const DashboardError = () => {
  const { error } = useAppSelector((state) => state.subscriptions)

  return (
    <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">
      <p className="font-bold">We could not refresh your subscription.</p>
      <p className="mt-1 text-sm">{error} Your last known session remains available.</p>
    </div>
  ); 
};

export default DashboardError;