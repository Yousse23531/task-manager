import { useState } from 'react';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Circle,
  Printer,
  Pencil,
  Trash2,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Task } from '@/lib/types';
import { formatCurrency, formatDate, getUrgentLabel } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);

  const allWorkDone = task.days.length > 0 && task.days.every((d) => d.workDone);
  const allPrintingDone = task.days.length > 0 && task.days.every((d) => d.printingDone);

  const earliestDate = task.days.map((d) => d.date).filter(Boolean).sort()[0];
  const urgentLabel = earliestDate ? getUrgentLabel(earliestDate) : null;
  const sortedDays = [...task.days].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-md transition hover:shadow-lg ${
        urgentLabel
          ? 'border-amber-400/40 bg-amber-950/20'
          : 'border-cyan-500/15 bg-white/5'
      }`}
    >
      {urgentLabel && (
        <div className="flex items-center gap-2 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-300">
          <AlertTriangle size={16} className="animate-pulse" />
          {urgentLabel}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-cyan-50">
              {task.name} {task.surname}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {allWorkDone ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                  <CheckCircle2 size={12} /> Work Complete
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                  <Circle size={12} /> Work Pending
                </span>
              )}
              {allPrintingDone ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                  <Printer size={12} /> Printed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
                  <Printer size={12} /> Not Printed
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/15 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
          {task.location && (
            <a
              href={task.location}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 transition hover:text-cyan-300 hover:underline"
            >
              <MapPin size={14} /> Location
              <ExternalLink size={11} />
            </a>
          )}
          {task.days.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} /> {task.days.length} day{task.days.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Service</p>
            <p className="mt-0.5 text-sm font-bold text-cyan-100">{formatCurrency(task.servicePrice)}</p>
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Cost</p>
            <p className="mt-0.5 text-sm font-bold text-cyan-100">{formatCurrency(task.cost)}</p>
          </div>
          <div
            className={`rounded-lg px-3 py-2 ${
              task.profit > 0
                ? 'bg-emerald-500/10'
                : task.profit < 0
                  ? 'bg-red-500/10'
                  : 'bg-white/5'
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Profit</p>
            <p
              className={`mt-0.5 flex items-center gap-1 text-sm font-bold ${
                task.profit > 0
                  ? 'text-emerald-300'
                  : task.profit < 0
                    ? 'text-red-300'
                    : 'text-cyan-100'
              }`}
            >
              {task.profit > 0 ? <TrendingUp size={12} /> : task.profit < 0 ? <TrendingDown size={12} /> : <DollarSign size={12} />}
              {formatCurrency(task.profit)}
            </p>
          </div>
        </div>

        {task.days.length > 0 && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5"
            >
              <span>View {task.days.length} day{task.days.length !== 1 ? 's' : ''}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expanded && (
              <div className="mt-2 space-y-2">
                {sortedDays.map((day, idx) => (
                  <div
                    key={day.id}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-200">
                        Day {idx + 1} — {formatDate(day.date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            day.workDone ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {day.workDone ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                          Work
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            day.printingDone ? 'text-cyan-400' : 'text-slate-500'
                          }`}
                        >
                          <Printer size={13} />
                          Print
                        </span>
                      </div>
                    </div>
                    {day.comments && (
                      <p className="mt-1.5 text-xs text-slate-400">{day.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
