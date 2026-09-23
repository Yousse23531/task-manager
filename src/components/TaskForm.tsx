import { useEffect, useState } from 'react';
import { X, Plus, Trash2, MapPin, User, Calendar, Users, Link2 } from 'lucide-react';
import type { Task, TaskDay, Client } from '@/lib/types';
import { generateId } from '@/lib/utils';

interface TaskFormProps {
  task: Task | null;
  clients: Client[];
  onSave: (task: Task) => void;
  onClose: () => void;
}

export default function TaskForm({ task, clients, onSave, onClose }: TaskFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [location, setLocation] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [cost, setCost] = useState('');
  const [days, setDays] = useState<TaskDay[]>([
    { id: generateId(), date: '', workDone: false, printingDone: false, comments: '' },
  ]);

  useEffect(() => {
    if (task) {
      setSelectedClientId(task.clientId || '');
      setName(task.name);
      setSurname(task.surname);
      setLocation(task.location);
      setServicePrice(String(task.servicePrice || ''));
      setCost(String(task.cost || ''));
      setDays(
        task.days.length > 0
          ? task.days.map((d) => ({ ...d }))
          : [{ id: generateId(), date: '', workDone: false, printingDone: false, comments: '' }]
      );
    }
  }, [task]);

  function handleClientSelect(id: string) {
    setSelectedClientId(id);
    if (id) {
      const client = clients.find((c) => c.id === id);
      if (client) {
        setName(client.name);
        setSurname(client.surname);
        setLocation(client.location);
      }
    }
  }

  const computedProfit = (() => {
    const sp = parseFloat(servicePrice) || 0;
    const c = parseFloat(cost) || 0;
    return sp - c;
  })();

  function addDay() {
    setDays((prev) => [
      ...prev,
      { id: generateId(), date: '', workDone: false, printingDone: false, comments: '' },
    ]);
  }

  function removeDay(id: string) {
    setDays((prev) => (prev.length > 1 ? prev.filter((d) => d.id !== id) : prev));
  }

  function updateDay(id: string, field: keyof TaskDay, value: string | boolean) {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const newTask: Task = {
      id: task?.id || generateId(),
      clientId: selectedClientId || null,
      name: name.trim(),
      surname: surname.trim(),
      location: location.trim(),
      servicePrice: parseFloat(servicePrice) || 0,
      cost: parseFloat(cost) || 0,
      profit: computedProfit,
      days: days.filter((d) => d.date !== ''),
      createdAt: task?.createdAt || new Date().toISOString(),
    };
    onSave(newTask);
  }

  const inputClass =
    'w-full rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-2.5 text-sm text-cyan-50 placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20';
  const labelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="my-4 w-full max-w-2xl rounded-2xl border border-cyan-500/20 bg-slate-950/90 shadow-2xl shadow-cyan-500/10">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-cyan-50">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Client selection */}
          {clients.length > 0 && (
            <div className="mb-4 rounded-xl border border-cyan-500/15 bg-cyan-950/20 p-4">
              <label className={labelClass}>
                <Users size={12} className="mr-1 inline" /> Select Existing Client
              </label>
              <select
                className={inputClass}
                value={selectedClientId}
                onChange={(e) => handleClientSelect(e.target.value)}
              >
                <option value="" className="bg-slate-900">— New client (fill manually) —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name} {c.surname}
                  </option>
                ))}
              </select>
              {selectedClientId && (
                <p className="mt-2 text-xs text-cyan-400">
                  Client details auto-filled. You can still edit them for this task.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>

          <div className="mt-4">
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

          <div className="mt-5 rounded-xl border border-cyan-500/15 bg-white/5 p-4">
            <h3 className="mb-3 text-sm font-bold text-cyan-200">Financials (Tunisian Dinar)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Service Price</label>
                <input
                  className={inputClass}
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="0"
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>Cost</label>
                <input
                  className={inputClass}
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  type="number"
                  step="0.001"
                  min="0"
                />
              </div>
              <div>
                <label className={labelClass}>Profit</label>
                <div
                  className={`flex items-center rounded-xl border px-4 py-2.5 text-sm font-semibold ${
                    computedProfit > 0
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : computedProfit < 0
                        ? 'border-red-500/30 bg-red-500/10 text-red-300'
                        : 'border-cyan-500/20 bg-white/5 text-slate-400'
                  }`}
                >
                  {computedProfit.toFixed(3)} DT
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-cyan-200">
                <Calendar size={14} className="mr-1.5 inline" /> Event Days
              </h3>
              <button
                type="button"
                onClick={addDay}
                className="flex items-center gap-1 rounded-lg bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/25"
              >
                <Plus size={14} /> Add Day
              </button>
            </div>

            <div className="space-y-3">
              {days.map((day, idx) => (
                <div key={day.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Day {idx + 1}
                    </span>
                    {days.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(day.id)}
                        className="rounded-lg p-1 text-slate-500 transition hover:bg-red-500/15 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Date</label>
                      <input
                        type="date"
                        className={inputClass}
                        value={day.date}
                        onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Comments</label>
                      <input
                        className={inputClass}
                        value={day.comments}
                        onChange={(e) => updateDay(day.id, 'comments', e.target.value)}
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10">
                      <input
                        type="checkbox"
                        checked={day.workDone}
                        onChange={(e) => updateDay(day.id, 'workDone', e.target.checked)}
                        className="h-4 w-4 accent-cyan-500"
                      />
                      <span className="text-sm font-medium text-slate-300">Work Done</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10">
                      <input
                        type="checkbox"
                        checked={day.printingDone}
                        onChange={(e) => updateDay(day.id, 'printingDone', e.target.checked)}
                        className="h-4 w-4 accent-cyan-500"
                      />
                      <span className="text-sm font-medium text-slate-300">Printing Done</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-400 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-600/20 transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
