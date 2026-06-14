import { Check, CreditCard, LoaderCircle, LockKeyhole, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import Button from '@/components/Button';
import FormField from '@/components/FormField';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { notify } from '@/store/notificationSlice';
import { checkout, fetchSubscriptions, resetCheckout } from '@/store/subscriptionSlice';
import type { Plan } from '@/types/models';

interface CheckoutDialogProps {
  plan: Plan
  onClose: () => void
}

const CheckoutDialog = ({ plan, onClose }: CheckoutDialogProps) => {
  const dispatch = useAppDispatch();
  const checkoutStatus = useAppSelector((state) => state.subscriptions.checkoutStatus);
  const error = useAppSelector((state) => state.subscriptions.error);
  const user = useAppSelector((state) => state.auth.session?.user);
  const [paymentMethod, setPaymentMethod] = useState('simulated-card');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && checkoutStatus !== 'loading') onClose()
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [checkoutStatus, onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const action = await dispatch(checkout({ planId: plan.id, paymentMethod }));
    if (checkout.fulfilled.match(action)) {
      dispatch(notify({
        title: 'Payment confirmed',
        message: `${plan.name} is active. Your dashboard is being refreshed.`,
        tone: 'success',
      }));
      void dispatch(fetchSubscriptions());
    }
  }

  const close = () => {
    dispatch(resetCheckout());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <section
        aria-labelledby="checkout-title"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Secure checkout</p>
            <h2 className="font-display mt-2 text-3xl font-semibold" id="checkout-title">
              Complete your purchase
            </h2>
          </div>
          <button
            aria-label="Close checkout"
            className="rounded-full bg-slate-100 p-2 text-slate-600"
            disabled={checkoutStatus === 'loading'}
            onClick={close}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        {checkoutStatus === 'success' ? (
          <div className="py-10 text-center">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-700">
              <Check size={30} />
            </span>
            <h3 className="font-display mt-5 text-2xl font-semibold">You are all set.</h3>
            <p className="mt-2 text-slate-500">Your payment succeeded and premium access is active.</p>
            <Button className="mt-7 w-full" onClick={close} type="button">Done</Button>
          </div>
        ) : (
          <form className="mt-8 grid gap-6" onSubmit={submit}>
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{plan.name}</p>
                  <p className="font-display mt-1 text-3xl font-semibold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: plan.currency }).format(plan.price)}
                  </p>
                </div>
                <CreditCard className="text-cyan-300" aria-hidden="true" />
              </div>
              <p className="mt-5 text-xs text-slate-400">
                Billed {plan.billingPeriod?.toLowerCase() ?? 'once'} to {user?.email}
              </p>
            </div>

            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-2 text-sm font-bold text-slate-700 sm:col-span-2">
                Account details
              </legend>
              <FormField
                autoComplete="name"
                label="Name"
                name="name"
                readOnly
                value={user?.name ?? ''}
              />
              <FormField
                autoComplete="email"
                label="Email address"
                name="email"
                readOnly
                type="email"
                value={user?.email ?? ''}
              />
            </fieldset>

            <fieldset className="grid gap-3">
              <legend className="mb-2 text-sm font-bold text-slate-700">Simulated payment method</legend>
              {[
                ['simulated-card', 'Simulated card', 'Successful payment'],
                ['simulated-card-secondary', 'Secondary simulated card', 'Successful payment'],
                ['simulated-declined', 'Test declined card', 'Simulates a declined payment'],
              ].map(([value, label, detail]) => (
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 has-checked:border-cyan-400 has-checked:bg-cyan-50" key={value}>
                  <input
                    checked={paymentMethod === value}
                    className="accent-cyan-600"
                    name="payment"
                    onChange={() => setPaymentMethod(value)}
                    type="radio"
                    value={value}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{label}</span>
                    <span className="block text-xs text-slate-500">{detail}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <Button disabled={checkoutStatus === 'loading'} type="submit">
              {checkoutStatus === 'loading' ? (
                <><LoaderCircle className="animate-spin" size={18} /> Processing payment...</>
              ) : (
                <><LockKeyhole size={17} /> Pay securely</>
              )}
            </Button>
            <p className="text-center text-xs text-slate-400">
              This assessment uses a simulated payment processor. No real charge is made.
            </p>
          </form>
        )}
      </section>
    </div>
  )
}

export default CheckoutDialog
