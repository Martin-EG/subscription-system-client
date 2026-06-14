import type { SubscriptionStatus } from '@/types/models'
import type { FC } from 'react';

const styles: Record<SubscriptionStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-200',
  EXPIRED: 'bg-amber-50 text-amber-700 ring-amber-200',
  PAST_DUE: 'bg-rose-50 text-rose-700 ring-rose-200',
}

interface StatusBadgeProps {
  status: SubscriptionStatus;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default StatusBadge;
