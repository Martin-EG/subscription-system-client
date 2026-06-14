import { CalendarDays, CircleDollarSign } from 'lucide-react';
import { StatusBadge } from '@/components';
import type { FC } from 'react';
import type { Subscription } from '@/types/models';

const formatDate = (date: string | null) =>
  date
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(date))
    : 'No expiry date'

interface DashboardContentProps {
  currentSubscription: Subscription;
}

const DashboardContent: FC<DashboardContentProps> = ({ currentSubscription }) => (
  <>
    <section className="mt-10 grid gap-5 lg:grid-cols-[1.4fr_.8fr_.8fr]">
      <article className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white">
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400">Current membership</p>
            <h2 className="font-display mt-3 text-4xl font-semibold">{currentSubscription.plan.name}</h2>
          </div>
          <StatusBadge status={currentSubscription.status} />
        </div>
        <div className="relative mt-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500">Member since</p>
            <p className="mt-1 font-semibold">{formatDate(currentSubscription.startedAt)}</p>
          </div>
        </div>
      </article>
      <article className="rounded-[2rem] border border-slate-200 bg-white p-7">
        <CalendarDays className="text-cyan-600" aria-hidden="true" />
        <p className="mt-8 text-sm text-slate-500">Next renewal</p>
        <p className="font-display mt-2 text-2xl font-semibold">{formatDate(currentSubscription.expiresAt)}</p>
      </article>
      <article className="rounded-[2rem] border border-slate-200 bg-white p-7">
        <CircleDollarSign className="text-cyan-600" aria-hidden="true" />
        <p className="mt-8 text-sm text-slate-500">Current rate</p>
        <p className="font-display mt-2 text-2xl font-semibold">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currentSubscription.plan.currency,
          }).format(currentSubscription.plan.price)}
        </p>
        <p className="mt-1 text-xs text-slate-400">per {currentSubscription.plan.billingPeriod?.toLowerCase() ?? 'period'}</p>
      </article>
    </section>

    <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-7 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Subscription details</h2>
          <p className="mt-1 text-sm text-slate-500">Your access and account information.</p>
        </div>
        <StatusBadge status={currentSubscription.status} />
      </div>
      <dl className="mt-8 grid gap-6 border-t border-slate-100 pt-7 sm:grid-cols-3">
        <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Account</dt><dd className="mt-2 font-semibold">{currentSubscription.userEmail}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Billing cycle</dt><dd className="mt-2 font-semibold">{currentSubscription.plan.billingPeriod ?? 'Flexible'}</dd></div>
        <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Auto renew</dt><dd className="mt-2 font-semibold">{currentSubscription.cancelAtPeriodEnd ? 'Off' : 'On'}</dd></div>
      </dl>
    </section>
  </>
);

export default DashboardContent;