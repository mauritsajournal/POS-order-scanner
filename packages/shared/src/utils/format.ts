/**
 * Format date for display (NL locale default).
 * formatDate('2026-03-15T10:30:00Z') → "15 maart 2026"
 */
export function formatDate(
  dateStr: string,
  locale: string = 'nl-NL',
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format date + time.
 * formatDateTime('2026-03-15T10:30:00Z') → "15 mrt 2026, 11:30"
 */
export function formatDateTime(
  dateStr: string,
  locale: string = 'nl-NL',
): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time.
 * formatRelativeTime('2026-03-15T10:28:00Z') → "2 minuten geleden"
 */
export function formatRelativeTime(
  dateStr: string,
  locale: string = 'nl-NL',
): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSecs < 60) return rtf.format(-diffSecs, 'second');
  if (diffMins < 60) return rtf.format(-diffMins, 'minute');
  if (diffHours < 24) return rtf.format(-diffHours, 'hour');
  return rtf.format(-diffDays, 'day');
}

/**
 * Format number with NL locale.
 * formatNumber(1234.5) → "1.234,5"
 */
export function formatNumber(
  value: number,
  locale: string = 'nl-NL',
  decimals: number = 0,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
