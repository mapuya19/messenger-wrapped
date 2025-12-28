/**
 * Date utility functions for formatting and parsing dates
 */

/**
 * Parse a date string in "YYYY-MM" format to a Date object
 * @param dateString - Date string in "YYYY-MM" format
 * @returns Date object representing the first day of that month
 */
export function parseMonthDate(dateString: string): Date {
  const [year, month] = dateString.split('-').map(Number);
  // JavaScript Date months are 0-based, so month-1
  return new Date(year, month - 1, 1);
}

/**
 * Format a date range (timestamps) to a readable string
 * @param dateRange - Object with start and end timestamps
 * @returns Formatted date range string or null if invalid
 */
export function formatDateRange(dateRange?: { start: number; end: number }): string | null {
  if (!dateRange) return null;
  const start = new Date(dateRange.start);
  const end = new Date(dateRange.end);
  return `${start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

/**
 * Format a month date string to a readable format
 * @param dateString - Date string in "YYYY-MM" format
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string
 */
export function formatMonthDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' }
): string {
  const date = parseMonthDate(dateString);
  return date.toLocaleDateString('en-US', options);
}

