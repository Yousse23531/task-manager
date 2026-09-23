export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(amount);
  return `${formatted} DT`;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function isUrgent(isoDate: string): boolean {
  return daysUntil(isoDate) === -13;
}

export function getUrgentLabel(isoDate: string): string | null {
  const days = daysUntil(isoDate);
  if (days === -13) return 'Deliver by tomorrow!';
  if (days === -14) return 'Delivery due today';
  if (days < -14) return `Overdue by ${Math.abs(days) - 14} day(s)`;
  return null;
}

export function isPastEvent(isoDate: string): boolean {
  return daysUntil(isoDate) < 0;
}
