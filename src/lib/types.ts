export interface TaskDay {
  id: string;
  date: string;
  workDone: boolean;
  printingDone: boolean;
  comments: string;
}

export interface Client {
  id: string;
  name: string;
  surname: string;
  location: string;
  createdAt: string;
}

export interface Task {
  id: string;
  clientId: string | null;
  name: string;
  surname: string;
  location: string;
  days: TaskDay[];
  servicePrice: number;
  cost: number;
  profit: number;
  createdAt: string;
}

export type FilterType = 'all' | 'pending' | 'done' | 'urgent';
export type SortType = 'date' | 'name' | 'profit';
export type TabType = 'tasks' | 'clients' | 'history';
