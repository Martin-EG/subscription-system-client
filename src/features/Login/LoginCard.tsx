import { ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Brand, Button, FormField } from '@/components';
import { login } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const LoginCard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useAppSelector((state) => state.auth);
  const [fields, setFields] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = schema.safeParse(fields);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message])));
      
      return;
    }

    setErrors({});
    const action = await dispatch(login(result.data));
    if (login.fulfilled.match(action)) {
      const destination = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(destination, { replace: true });
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
      <div className="w-full max-w-md">

        <div className="mb-12"><Brand /></div>
        <p className="text-sm font-bold text-cyan-700">WELCOME</p>
        <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
          Sign in to your account
        </h2>
        <p className="mt-3 text-slate-500">Manage your plan and subscription status.</p>

        <form className="mt-9 grid gap-5" noValidate onSubmit={submit}>
          <FormField
            autoComplete="email"
            error={errors.email}
            label="Email address"
            name="email"
            onChange={(event) => setFields((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            type="email"
            value={fields.email}
          />
          <FormField
            autoComplete="current-password"
            error={errors.password}
            label="Password"
            name="password"
            onChange={(event) => setFields((current) => ({ ...current, password: event.target.value }))}
            placeholder="Your password"
            type="password"
            value={fields.password}
          />
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <Button disabled={status === 'loading'} type="submit">
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
            {status !== 'loading' && <ArrowRight aria-hidden="true" size={18} />}
          </Button>
        </form>
      </div>
    </div>
  )
};

export default LoginCard;
