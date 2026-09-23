import { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  MapPin,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  Search,
  X,
  User,
  Link2,
} from 'lucide-react';
import type { Client, Task } from '@/lib/types';
import { formatCurrency, formatDate, generateId } from '@/lib/utils';

interface ClientsViewProps {
  clients: Client[];
  tasks: Task[];
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onAddTaskForClient: (client: Client) => void;
}

export default function ClientsView({
  clients,
  tasks,
  onSaveClient,
  onDeleteClient,
  onAddTaskForClient,
}: ClientsViewProps) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [location, setLocation] = useState('');

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    return clients.filter((c) =>
      (c.name + ' ' + c.surname).toLowerCase().includes(search.toLowerCase())
    );
  }, [clients, search]);

  function openNew() {
    setEditingClient(null);
    setName('');
    setSurname('');
    setLocation('');
    setShowForm(true);
  }

  function openEdit(client: Client) {
    setEditingClient(client);
    setName(client.name);
    setSurname(client.surname);
    setLocation(client.location);
    setShowForm(true);
  }

  function handleSave() {
    if (!name.trim()) return;
    const client: Client = {
      id: editingClient?.id || generateId(),
      name: name.trim(),
      surname: surname.trim(),
      location: location.trim(),
      createdAt: editingClient?.createdAt || new Date().toISOString(),
    };
    onSaveClient(client);
    setShowForm(false);
    setEditingClient(null);
  }

  function getTaskCount(clientId: string): number {
    return tasks.filter((t) => t.clientId === clientId).length;
  }

  function getClientProfit(clientId: string): number {
    return tasks
      .filter((t) => t.clientId === clientId)
      .reduce((sum, t) => sum + t.profit, 0);
  }

  function getClientLastDate(clientId: string): string {
    const clientTasks = tasks.filter((t) => t.clientId === clientId);
    const dates = clientTasks
      .flatMap((t) => t.days.map((d) => d.date))
      .filter(Boolean)
      .sort();
    return dates[dates.length - 1] || '';
  }

  const inputClass =
    'w-full rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-2.5 text-sm text-cyan-50 placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20';
  const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-cyan-400" />
          <h2 className="text-lg font-bold text-cyan-50">Clients</h2>
          <span className="rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
            {clients.length}
          </span>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 active:scale-95"
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      {clients.length > 0 && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full rounded-xl border border-cyan-500/20 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-cyan-50 placeholder-slate-500 outline-none transition focus:border-cyan-400"
          />
        </div>
      )}

      {clients.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-cyan-500/20 py-16 text-center">
          <Users size={36} className="mx-auto text-cyan-500/40" />
          <p className="mt-3 text-sm text-slate-400">No clients yet. Add clients to quickly reuse their info when creating tasks.</p>
          <button
            onClick={openNew}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500"
          >
            <Plus size={18} /> Add First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredClients.map((client) => {
            const taskCount = getTaskCount(client.id);
            const profit = getClientProfit(client.id);
            const lastDate = getClientLastDate(client.id);

            return (
              <div
                key={client.id}
                className="rounded-2xl border border-cyan-500/15 bg-white/5 p-4 backdrop-blur-md transition hover:border-cyan-500/25 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-cyan-50">
                      {client.name} {client.surname}
                    </h3>
                    {client.location && (
                      <a
                        href={client.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300 hover:underline"
                      >
                        <MapPin size={11} /> Location
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(client)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-cyan-300"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(client.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/15 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={11} /> {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </span>
                  {lastDate && (
                    <span className="inline-flex items-center gap-1">
                      Last: {formatDate(lastDate)}
                    </span>
                  )}
                  {taskCount > 0 && (
                    <span className={`inline-flex items-center gap-1 font-semibold ${
                      profit > 0 ? 'text-emerald-300' : profit < 0 ? 'text-red-300' : 'text-slate-400'
                    }`}>
                      <TrendingUp size={11} /> {formatCurrency(profit)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onAddTaskForClient(client)}
                  className="mt-3 w-full rounded-lg border border-cyan-500/20 bg-cyan-500/10 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
                >
                  <Plus size={12} className="mr-1 inline" /> Add Task for This Client
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Client Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/20 bg-slate-950/90 shadow-2xl shadow-cyan-500/10">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold text-cyan-50">
                {editingClient ? 'Edit Client' : 'New Client'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={labelClass}>
                  <User size={12} className="mr-1 inline" /> Name
                </label>
                <input
                  className={inputClass}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Surname</label>
                <input
                  className={inputClass}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="Last name"
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Link2 size={12} className="mr-1 inline" /> Location (link)
                </label>
                <input
                  className={inputClass}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="https://maps.google.com/..."
                  type="url"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {editingClient ? 'Save' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-slate-950/90 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-cyan-50">Delete Client?</h3>
            <p className="mt-1 text-sm text-slate-400">
              The client will be removed. Their tasks will remain but won't be linked to a client.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteClient(deleteId);
                  setDeleteId(null);
                }}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
