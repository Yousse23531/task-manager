import { useMemo, useState } from 'react';
import {
  History,
  MapPin,
  Calendar,
  CheckCircle2,
  Circle,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Task } from '@/lib/types';
import { formatCurrency, formatDate, isPastEvent } from '@/lib/utils';

interface HistoryViewProps {
  tasks: Task[];
}

export default function HistoryView({ tasks }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const pastTasks = useMemo(() => {
    const past = tasks.filter((t) =>
      t.days.some((d) => d.date && isPastEvent(d.date))
    );

    const filtered = search.trim()
      ? past.filter((t) =>
          (t.name + ' ' + t.surname).toLowerCase().includes(search.toLowerCase())
        )
      : past;

    const sorted = [...filtered].sort((a, b) => {
      const aDate = a.days.map((d) => d.date).filter(Boolean).sort().reverse()[0] || '';
      const bDate = b.days.map((d) => d.date).filter(Boolean).sort().reverse()[0] || '';
      return bDate.localeCompare(aDate);
    });

    return sorted;
  }, [tasks, search]);

  const totals = useMemo(() => {
    const totalService = pastTasks.reduce((s, t) => s + t.servicePrice, 0);
    const totalCost = pastTasks.reduce((s, t) => s + t.cost, 0);
    const totalProfit = pastTasks.reduce((s, t) => s + t.profit, 0);
    return { totalService, totalCost, totalProfit };
  }, [pastTasks]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <History size={20} className="text-cyan-400" />
        <h2 className="text-lg font-bold text-cyan-50">Event History</h2>
        <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
          {pastTasks.length} past
        </span>
      </div>

 {/* Summary */}
      {pastTasks.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-cyan-500/15 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total Service</p>
            <p className="mt-0.5 text-sm font-bold text-cyan-100">{formatCurrency(totals.totalService)}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/15 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total Cost</p>
            <p className="mt-0.5 text-sm font-bold text-cyan-100">{formatCurrency(totals.totalCost)}</p>
          </div>
          <div className={`rounded-xl border p-3 ${
            totals.totalProfit > 0
              ? 'border-emerald-500/20 bg-emerald-500/10'
              : 'border-red-500/20 bg-red-500/10'
          }`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Total Profit</p>
            <p className={`mt-0.5 flex items-center gap-1 text-sm font-bold ${
              totals.totalProfit > 0 ? 'text-emerald-300' : 'text-red-300'
            }`}>
              {totals.totalProfit > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {formatCurrency(totals.totalProfit)}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      {tasks.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client name..."
            className="w-full rounded-xl border border-cyan-500/20 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-cyan-50 placeholder-slate-500 outline-none transition focus:border-cyan-400"
          />
        </div>
      )}

      {pastTasks.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-cyan-500/20 py-16 text-center">
          <History size={36} className="mx-auto text-cyan-500/40" />
          <p className="mt-3 text-sm text-slate-400">
            {tasks.length === 0
              ? 'No events recorded yet.'
              : 'No past events found. Past events will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pastTasks.map((task) => {
            const expanded = expandedId === task.id;
            const pastDays = task.days
              .filter((d) => d.date && isPastEvent(d.date))
              .sort((a, b) => b.date.localeCompare(a.date));
            const latestDate = pastDays[0]?.date;
            const allWorkDone = pastDays.every((d) => d.workDone);

            return (
              <div
                key={task.id}
                className="overflow-hidden rounded-2xl border border-cyan-500/15 bg-white/5 backdrop-blur-md transition hover:border-cyan-500/25"
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : task.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-cyan-50">
                      {task.name} {task.surname}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {latestDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={11} /> Last: {formatDate(latestDate)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        {pastDays.length} past day{pastDays.length !== 1 ? 's' : ''}
                      </span>
                      {allWorkDone ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 size={11} /> Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400">
                          <Circle size={11} /> Incomplete
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${
                      task.profit > 0 ? 'text-emerald-300' : task.profit < 0 ? 'text-red-300' : 'text-cyan-100'
                    }`}>
                      {task.profit > 0 ? <TrendingUp size={12} className="inline" /> : task.profit < 0 ? <TrendingDown size={12} className="inline" /> : <DollarSign size={12} className="inline" />}
                      {' '}{formatCurrency(task.profit)}
                    </span>
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-white/10 p-4">
                    {task.location && (
                      <a
                        href={task.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-3 inline-flex items-center gap-1.5 text-xs text-cyan-400 transition hover:text-cyan-300 hover:underline"
                      >
                        <MapPin size={12} /> Location <ExternalLink size={10} />
                      </a>
                    )}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="rounded-lg bg-white/5 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase text-slate-500">Service</p>
                        <p className="text-xs font-bold text-cyan-100">{formatCurrency(task.servicePrice)}</p>
                      </div>
                      <div className="rounded-lg bg-white/5 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase text-slate-500">Cost</p>
                        <p className="text-xs font-bold text-cyan-100">{formatCurrency(task.cost)}</p>
                      </div>
                      <div className={`rounded-lg px-3 py-2 ${
                        task.profit > 0 ? 'bg-emerald-500/10' : task.profit < 0 ? 'bg-red-500/10' : 'bg-white/5'
                      }`}>
                        <p className="text-[10px] font-semibold uppercase text-slate-500">Profit</p>
                        <p className={`text-xs font-bold ${
                          task.profit > 0 ? 'text-emerald-300' : task.profit < 0 ? 'text-red-300' : 'text-cyan-100'
                        }`}>{formatCurrency(task.profit)}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {pastDays.map((day, idx) => (
                        <div key={day.id} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-cyan-200">
                              {formatDate(day.date)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`flex items-center gap-1 text-xs ${
                                day.workDone ? 'text-emerald-400' : 'text-slate-500'
                              }`}>
                                {day.workDone ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                                Work
                              </span>
                              <span className={`flex items-center gap-1 text-xs ${
                                day.printingDone ? 'text-cyan-400' : 'text-slate-500'
                              }`}>
                                <Printer size={12} />
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
