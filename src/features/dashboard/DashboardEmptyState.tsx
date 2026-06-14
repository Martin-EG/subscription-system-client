import { Sparkles } from 'lucide-react';


const DashboardEmptyState = () => (
  <section className="mt-10 overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white sm:p-12">
    <div className="max-w-xl">
      <Sparkles className="text-cyan-300" aria-hidden="true" />
      <h2 className="font-display mt-6 text-4xl font-semibold tracking-[-0.04em]">
        Your premium chapter starts here.
      </h2>
      <p className="mt-4 text-slate-300">Your account is ready for a subscription.</p>
    </div>
  </section>
);

export default DashboardEmptyState;