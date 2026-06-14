import { Sparkles } from 'lucide-react'

const Brand = () => (
  <div className="flex items-center gap-3">
    <span className="grid size-10 place-items-center rounded-xl bg-cyan-300 text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,.2)]">
      <Sparkles aria-hidden="true" size={20} />
    </span>
    <span className="font-display text-lg font-semibold tracking-tight">Subscription Portal</span>
  </div>
);

export default Brand