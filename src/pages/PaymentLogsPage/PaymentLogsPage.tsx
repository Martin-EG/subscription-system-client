import { ChevronLeft, ChevronRight, RefreshCw, Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { subscriptionRepository } from '@/services/subscriptionRepository'
import { useAppSelector } from '@/store/hooks'
import type { PaymentLog, Subscription } from '@/types/models'

const PAGE_SIZE = 20
const SUBSCRIPTION_LOOKUP_LIMIT = 100

interface PaymentLogRow extends PaymentLog {
  subscription?: Subscription
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))

const statusStyles: Record<string, string> = {
  FAILED: 'bg-rose-50 text-rose-700 ring-rose-200',
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  REFUNDED: 'bg-slate-100 text-slate-600 ring-slate-200',
  SUCCESS: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  SUCCEEDED: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const PaymentStatus = ({ status }: { status: string }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${
      statusStyles[status.toUpperCase()] ?? 'bg-cyan-50 text-cyan-700 ring-cyan-200'
    }`}
  >
    {status.replaceAll('_', ' ')}
  </span>
)

const PaymentLogsPage = () => {
  const token = useAppSelector((state) => state.auth.session?.accessToken)
  const [logs, setLogs] = useState<PaymentLogRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    if (!token) return

    setIsLoading(true)
    setError(null)
    try {
      const [paymentResponse, subscriptionResponse] = await Promise.all([
        subscriptionRepository.getPaymentLogs(token, page, PAGE_SIZE),
        subscriptionRepository.getAdminSubscriptions(token, SUBSCRIPTION_LOOKUP_LIMIT),
      ])
      const subscriptionsById = new Map(
        subscriptionResponse.data.map((subscription) => [subscription.subscriptionId, subscription]),
      )

      setLogs(paymentResponse.data.map((log) => ({
        ...log,
        subscription: subscriptionsById.get(log.subscriptionId),
      })))
      setTotal(paymentResponse.total)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load payment logs.')
    } finally {
      setIsLoading(false)
    }
  }, [page, token])

  useEffect(() => {
    // This effect synchronizes the table with the requested backend page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLogs()
  }, [loadLogs])

  const statuses = useMemo(
    () => [...new Set(logs.map((log) => log.status))].sort(),
    [logs],
  )
  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return logs.filter((log) => {
      const matchesStatus = status === 'ALL' || log.status === status
      const matchesQuery = !normalizedQuery || [
        log.transactionId,
        log.subscriptionId,
        log.userId,
        log.subscription?.userName ?? '',
        log.subscription?.userEmail ?? '',
        log.subscription?.plan.name ?? '',
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
      return matchesStatus && matchesQuery
    })
  }, [logs, query, status])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-7xl p-5 sm:p-8 lg:p-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-700">Administration</p>
          <h1 className="font-display mt-2 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Payment logs
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Review payment attempts, transaction references, and processing results.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-60"
          disabled={isLoading}
          onClick={() => void loadLogs()}
          type="button"
        >
          <RefreshCw aria-hidden="true" className={isLoading ? 'animate-spin' : ''} size={17} />
          Refresh
        </button>
      </header>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full max-w-md">
            <span className="sr-only">Search payment logs</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Transaction, user, email, or plan"
              type="search"
              value={query}
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            Status
            <select
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              <option value="ALL">All</option>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>

        {error ? (
          <div className="p-10 text-center">
            <h2 className="font-display text-2xl font-semibold">Payment logs could not be loaded.</h2>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <button
              className="mt-5 font-bold text-cyan-700 hover:text-cyan-900"
              onClick={() => void loadLogs()}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div aria-label="Loading payment logs" className="grid gap-3 p-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div className="h-14 animate-pulse rounded-xl bg-slate-100" key={item} />
            ))}
          </div>
        ) : filteredLogs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold" scope="col">Transaction</th>
                  <th className="px-6 py-4 font-bold" scope="col">User</th>
                  <th className="px-6 py-4 font-bold" scope="col">Plan</th>
                  <th className="px-6 py-4 font-bold" scope="col">Amount</th>
                  <th className="px-6 py-4 font-bold" scope="col">Status</th>
                  <th className="px-6 py-4 font-bold" scope="col">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr className="transition hover:bg-slate-50/80" key={log.id}>
                    <td className="px-6 py-5 font-mono text-xs font-semibold text-slate-700">{log.transactionId}</td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        {log.subscription?.userName ?? 'Unknown user'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {log.subscription?.userEmail ?? log.userId}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-slate-900">
                        {log.subscription?.plan.name ?? 'Unknown plan'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {log.subscription?.plan.billingPeriod?.replace('_', ' ').toLowerCase()
                          ?? log.subscriptionId}
                      </p>
                    </td>
                    <td className="px-6 py-5 font-semibold">{formatCurrency(log.amount, log.currency)}</td>
                    <td className="px-6 py-5"><PaymentStatus status={log.status} /></td>
                    <td className="px-6 py-5 text-sm text-slate-500">{formatDate(log.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h2 className="font-display text-2xl font-semibold">No payment logs found.</h2>
            <p className="mt-2 text-sm text-slate-500">Try changing the current search or status filter.</p>
          </div>
        )}

        {!error && !isLoading && total > 0 ? (
          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            <p>{total} payment {total === 1 ? 'record' : 'records'}</p>
            <div className="flex items-center gap-3">
              <button
                aria-label="Previous page"
                className="rounded-lg border border-slate-200 p-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={18} />
              </button>
              <span className="font-semibold text-slate-700">Page {page} of {totalPages}</span>
              <button
                aria-label="Next page"
                className="rounded-lg border border-slate-200 p-2 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={18} />
              </button>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  )
}

export default PaymentLogsPage
