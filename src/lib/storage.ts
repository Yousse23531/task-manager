import type { Task, Client } from './types';

const TASKS_KEY = 'task-manager-data';
const CLIENTS_KEY = 'task-manager-clients';

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    // ignore
  }
}

export function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Client[];
  } catch {
    return [];
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
  } catch {
    // ignore
  }
}
