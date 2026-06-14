import { render, screen } from '@testing-library/react';
import type { SubscriptionStatus } from '@/types/models';

import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it.each<{
    status: SubscriptionStatus;
    label: string;
    className: string;
  }>([
    {
      status: 'ACTIVE',
      label: 'ACTIVE',
      className: 'text-emerald-700',
    },
    {
      status: 'CANCELLED',
      label: 'CANCELLED',
      className: 'text-slate-600',
    },
    {
      status: 'EXPIRED',
      label: 'EXPIRED',
      className: 'text-amber-700',
    },
    {
      status: 'PAST_DUE',
      label: 'PAST DUE',
      className: 'text-rose-700',
    },
  ])('renders $status with its readable label and tone', ({ status, label, className }) => {
    render(<StatusBadge status={status} />);

    const badge = screen.getByText(label);

    expect(badge).toHaveClass(className);
  });
});
