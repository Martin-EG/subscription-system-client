import { Layers3 } from 'lucide-react';

const PlansEmptyState = () => (
  <section className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-12">
    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
      <Layers3 aria-hidden="true" size={30} />
    </div>
    <h2 className="font-display mt-6 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
      No plans are available yet.
    </h2>
    <p className="mx-auto mt-3 max-w-md leading-7 text-slate-500">
      We are preparing new subscription options. Please check back soon to find the plan that
      fits you.
    </p>
  </section>
);

export default PlansEmptyState;
