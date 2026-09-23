import { ClipboardList, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export default function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-500/20 py-20 text-center">
      <div className="rounded-2xl bg-cyan-500/10 p-5">
        <ClipboardList size={40} className="text-cyan-500/50" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-cyan-100">No tasks yet</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-400">
        Create your first task to start tracking events, work status, and profits.
      </p>
      <button
        onClick={onAdd}
        className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500"
      >
        <Plus size={18} /> Add First Task
      </button>
    </div>
  );
}
