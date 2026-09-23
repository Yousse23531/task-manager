import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  ClipboardList,
  ListChecks,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
  Users,
  History,
} from 'lucide-react';
import type { Task, Client, FilterType, SortType, TabType } from '@/lib/types';
import { loadTasks, saveTasks, loadClients, saveClients } from '@/lib/storage';
import { getUrgentLabel, formatCurrency, generateId } from '@/lib/utils';
import TaskForm from '@/components/TaskForm';
import TaskCard from '@/components/TaskCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import HistoryView from '@/components/HistoryView';
import ClientsView from '@/components/ClientsView';
import WaterBackground from '@/components/WaterBackground';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tab, setTab] = useState<TabType>('tasks');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [presetClientId, setPresetClientId] = useState<string | null>(null);

  useEffect(() => {
    setTasks(loadTasks());
    setClients(loadClients());
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  function handleSaveTask(task: Task) {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === task.id);
      if (exists) return prev.map((t) => (t.id === task.id ? task : t));
      return [...prev, task];
    });

    // Auto-create client if name is filled and no client selected
    if (!task.clientId && task.name.trim()) {
      const existing = clients.find(
        (c) =>
          c.name.toLowerCase() === task.name.toLowerCase() &&
          c.surname.toLowerCase() === task.surname.toLowerCase()
      );
      if (!existing && task.name.trim()) {
        const newClient: Client = {
          id: generateId(),
          name: task.name.trim(),
          surname: task.surname.trim(),
          location: task.location.trim(),
          createdAt: new Date().toISOString(),
        };
        setClients((prev) => [...prev, newClient]);
      }
    }

    setShowForm(false);
    setEditingTask(null);
    setPresetClientId(null);
  }

  function handleDeleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeleteId(null);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setPresetClientId(null);
    setShowForm(true);
  }

  function openNew() {
    setEditingTask(null);
    setPresetClientId(null);
    setShowForm(true);
  }

  function openNewForClient(client: Client) {
    setEditingTask(null);
    setPresetClientId(client.id);
    setShowForm(true);
    setTab('tasks');
  }

  function handleSaveClient(client: Client) {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === client.id);
      if (exists) return prev.map((c) => (c.id === client.id ? client : c));
      return [...prev, client];
    });
  }

  function handleDeleteClient(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    // Unlink tasks from deleted client
    setTasks((prev) =>
      prev.map((t) => (t.clientId === id ? { ...t, clientId: null } : t))
    );
  }

  // If presetClientId is set, create a synthetic editing task with client info
  const formTask: Task | null = useMemo(() => {
    if (editingTask) return editingTask;
    if (presetClientId) {
      const client = clients.find((c) => c.id === presetClientId);
      if (client) {
        return {
          id: '',
          clientId: client.id,
          name: client.name,
          surname: client.surname,
          location: client.location,
          days: [],
          servicePrice: 0,
          cost: 0,
          profit: 0,
          createdAt: new Date().toISOString(),
        };
      }
    }
    return null;
  }, [editingTask, presetClientId, clients]);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === 'pending') {
      result = result.filter((t) => !t.days.every((d) => d.workDone));
    } else if (filter === 'done') {
      result = result.filter((t) => t.days.length > 0 && t.days.every((d) => d.workDone));
    } else if (filter === 'urgent') {
      result = result.filter((t) => {
        const earliest = t.days.map((d) => d.date).filter(Boolean).sort()[0];
        return earliest ? getUrgentLabel(earliest) !== null : false;
      });
    }

    if (sort === 'date') {
      result.sort((a, b) => {
        const ad = a.days.map((d) => d.date).filter(Boolean).sort()[0] || '9999';
        const bd = b.days.map((d) => d.date).filter(Boolean).sort()[0] || '9999';
        return ad.localeCompare(bd);
      });
    } else if (sort === 'name') {
      result.sort((a, b) => (a.name + a.surname).localeCompare(b.name + b.surname));
    } else if (sort === 'profit') {
      result.sort((a, b) => b.profit - a.profit);
    }

    return result;
  }, [tasks, filter, sort]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.days.length > 0 && t.days.every((d) => d.workDone)).length;
    const urgent = tasks.filter((t) => {
      const earliest = t.days.map((d) => d.date).filter(Boolean).sort()[0];
      return earliest ? getUrgentLabel(earliest) !== null : false;
    }).length;
    const totalProfit = tasks.reduce((sum, t) => sum + t.profit, 0);
    const totalService = tasks.reduce((sum, t) => sum + t.servicePrice, 0);
    return { total, done, urgent, totalProfit, totalService };
  }, [tasks]);

  const filterButtons: { key: FilterType; label: string; icon: typeof ListChecks }[] = [
    { key: 'all', label: 'All', icon: ClipboardList },
    { key: 'pending', label: 'Pending', icon: Clock },
    { key: 'done', label: 'Done', icon: CheckCircle2 },
    { key: 'urgent', label: 'Urgent', icon: AlertTriangle },
  ];

  const tabs: { key: TabType; label: string; icon: typeof ListChecks }[] = [
    { key: 'tasks', label: 'Tasks', icon: ListChecks },
    { key: 'clients', label: 'Clients', icon: Users },
    { key: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="relative min-h-screen text-cyan-50">
      <WaterBackground />

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-cyan-500/15 bg-slate-950/70 backdrop-blur-md">
          <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-600 p-2.5 shadow-lg shadow-cyan-600/30">
                  <ListChecks size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-cyan-50">Task Manager</h1>
                  <p className="text-xs text-slate-400">Track events, work & profits</p>
                </div>
              </div>
              {tab === 'tasks' && (
                <button
                  onClick={openNew}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 active:scale-95"
                >
                  <Plus size={18} /> New Task
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-1">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-cyan-600/20 text-cyan-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} /> {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {tab === 'tasks' && (
            <>
              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-cyan-500/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-slate-400">
                    <ClipboardList size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-cyan-50">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Done</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-cyan-50">{stats.done}</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Urgent</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-cyan-50">{stats.urgent}</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/15 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <TrendingUp size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Profit</span>
                  </div>
                  <p className="mt-1 text-lg font-bold text-cyan-50">{formatCurrency(stats.totalProfit)}</p>
                </div>
              </div>

              {tasks.length === 0 ? (
                <EmptyState onAdd={openNew} />
              ) : (
                <>
                  {/* Filters & Sort */}
                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                      {filterButtons.map((btn) => {
                        const Icon = btn.icon;
                        const active = filter === btn.key;
                        return (
                          <button
                            key={btn.key}
                            onClick={() => setFilter(btn.key)}
                            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                              active
                                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                                : 'bg-white/5 text-slate-400 border border-cyan-500/15 hover:bg-white/10'
                            }`}
                          >
                            <Icon size={14} /> {btn.label}
                          </button>
                        );
                      })}
                    </div>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortType)}
                      className="rounded-xl border border-cyan-500/15 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 outline-none transition focus:border-cyan-400"
                    >
                      <option value="date">Sort: Date</option>
                      <option value="name">Sort: Name</option>
                      <option value="profit">Sort: Profit</option>
                    </select>
                  </div>

                  {/* Task List */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredTasks.length === 0 ? (
                      <div className="col-span-full rounded-2xl border-2 border-dashed border-cyan-500/20 py-12 text-center text-sm text-slate-400">
                        No tasks match this filter.
                      </div>
                    ) : (
                      filteredTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onEdit={openEdit} onDelete={(id) => setDeleteId(id)} />
                      ))
                    )}
                  </div>
                </>
              )}

              {tasks.length > 0 && (
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <Wallet size={14} />
                  Total service value: {formatCurrency(stats.totalService)}
                </div>
              )}
            </>
          )}

          {tab === 'clients' && (
            <ClientsView
              clients={clients}
              tasks={tasks}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              onAddTaskForClient={openNewForClient}
            />
          )}

          {tab === 'history' && <HistoryView tasks={tasks} />}
        </main>
      </div>

      {/* Modals */}
      {showForm && (
        <TaskForm
          task={formTask}
          clients={clients}
          onSave={handleSaveTask}
          onClose={() => {
            setShowForm(false);
            setEditingTask(null);
            setPresetClientId(null);
          }}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message="This task and all its days will be permanently removed."
          onConfirm={() => handleDeleteTask(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
