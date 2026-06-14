import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { dismiss } from '@/store/notificationSlice'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const ToastRegion = () => {
  const notifications = useAppSelector((state) => state.notifications);
  const dispatch = useAppDispatch();

  const notificationsSection = notifications.map((notification) => {
    const Icon = icons[notification.tone]
    return (
      <div
        className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-2xl shadow-slate-900/10"
        key={notification.id}
        role="status"
      >
        <Icon className="mt-0.5 shrink-0 text-cyan-600" aria-hidden="true" size={20} />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{notification.title}</p>
          <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
        </div>
        <button
          aria-label="Dismiss notification"
          className="self-start rounded-md p-1 text-slate-400 hover:bg-slate-100"
          onClick={() => dispatch(dismiss(notification.id))}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    )
  });

  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="fixed right-4 top-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3"
    >
      {notificationsSection}
    </div>
  )
}

export default ToastRegion;