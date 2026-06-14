import { DashboardContent, DashboardHeader } from '@/features/dashboard'

const DashboardPage = () => (
  <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
    <DashboardHeader />
    <DashboardContent />
  </div>
);

export default DashboardPage;
