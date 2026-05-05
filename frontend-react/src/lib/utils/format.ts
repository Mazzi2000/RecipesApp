/** Format a number for display, hiding zero / null values. */
export function formatNumber(n: number | null | undefined, digits = 0): string {
  if (n == null || Number.isNaN(n)) return '—';
  return n.toFixed(digits);
}

/** Returns YYYY-MM-DD for a Date in local time. */
export function toIsoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function shiftDate(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return toIsoDate(date);
}
