import { Check, ShieldCheck } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { Button, CheckoutDialog } from '@/components'
import { useAppSelector } from '@/store/hooks'
import type { Plan } from '@/types/models'

const benefits = [
  'Instant premium access',
  'Real-time payment confirmation',
  'Flexible subscription management',
];

interface PlanCardProps {
  disabled: boolean
  featured: boolean
  onSelect: (plan: Plan) => void
  plan: Plan
}

const PlanCard = memo(({ disabled, featured, onSelect, plan }: PlanCardProps) => (
  <article
    className={`relative flex flex-col rounded-[2rem] border p-7 sm:p-8 ${
      featured ? 'border-slate-950 bg-slate-950 text-white shadow-2xl shadow-slate-900/15' : 'border-slate-200 bg-white'
    }`}
  >
    {featured && (
      <span className="absolute right-6 top-6 rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
        MOST POPULAR
      </span>
    )}
    <p className={`text-sm font-bold ${featured ? 'text-cyan-300' : 'text-cyan-700'}`}>{plan.name}</p>
    <div className="mt-6 flex items-end gap-2">
      <span className="font-display text-5xl font-semibold tracking-tight">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: plan.currency, maximumFractionDigits: 0 }).format(plan.price)}
      </span>
      <span className={`pb-1 text-sm ${featured ? 'text-slate-400' : 'text-slate-500'}`}>
        / {plan.billingPeriod?.toLowerCase() ?? 'once'}
      </span>
    </div>
    <div className={`my-7 h-px ${featured ? 'bg-white/10' : 'bg-slate-100'}`} />
    <ul className="grid gap-4 text-sm">
      {benefits.map((benefit) => (
        <li className="flex items-center gap-3" key={benefit}>
          <span className={`grid size-6 place-items-center rounded-full ${featured ? 'bg-cyan-300 text-slate-950' : 'bg-cyan-50 text-cyan-700'}`}>
            <Check size={14} strokeWidth={3} />
          </span>
          {benefit}
        </li>
      ))}
    </ul>
    <Button
      $secondary={!featured}
      className="mt-9 w-full"
      disabled={disabled}
      onClick={() => onSelect(plan)}
      type="button"
    >
      Choose {plan.name}
    </Button>
  </article>
));

PlanCard.displayName = 'PlanCard';

const PlansContent = () => {
  const plans = useAppSelector((state) => state.subscriptions.plans);
  const subscriptions = useAppSelector((state) => state.subscriptions.subscriptions);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const activePlanId = subscriptions.find((subscription) => subscription.status === 'ACTIVE')?.plan.id;
  const selectPlan = useCallback((plan: Plan) => setSelectedPlan(plan), []);
  const closeCheckout = useCallback(() => setSelectedPlan(null), []);

  const checkoutDialog = selectedPlan 
  ? <CheckoutDialog onClose={closeCheckout} plan={selectedPlan} />
  : null;

  const plansSection = plans.map((plan, index) => {
    const featured = index === 1 || (plans.length === 1 && index === 0)

    return (
      <PlanCard
        disabled={activePlanId === plan.id}
        featured={featured}
        key={plan.id}
        onSelect={selectPlan}
        plan={plan}
      />
    )
  });

  return (
    <>
      <section className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plansSection}
      </section>

      <div className="mx-auto mt-10 flex max-w-xl items-center justify-center gap-3 text-center text-sm text-slate-500">
        <ShieldCheck className="shrink-0 text-cyan-700" size={20} />
        Checkout requests are protected against duplicate charges with an idempotency key.
      </div>

      {checkoutDialog}
    </>
  )
}

export default PlansContent;
