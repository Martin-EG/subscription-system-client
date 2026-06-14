import { Radio } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

const DashboardHeader = () => {
  const user = useAppSelector((state) => state.auth.session?.user)

  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">Overview</p>
        <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.045em]">
          Good to see you, {user?.name?.split(' ')[0] ?? 'there'}.
        </h1>
        <p className="mt-2 text-slate-500">Here is the latest on your premium access.</p>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
        <Radio className="text-emerald-500" aria-hidden="true" size={14} />
        LIVE UPDATES ON
      </span>
    </header>
  );
};

export default DashboardHeader;
