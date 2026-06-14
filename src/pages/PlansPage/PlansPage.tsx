import PlansLifecycle from '@/features/Plans/PlansLifecycle'
import { PlansHeader } from '@/features/Plans'


const PlansPage = () => (
    <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <PlansHeader />
      <PlansLifecycle />
    </div>
  );

export default PlansPage
