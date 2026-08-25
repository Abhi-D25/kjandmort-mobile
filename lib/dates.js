// visit_date is stored as a date-only string (YYYY-MM-DD). Parsing that
// with new Date() treats it as UTC midnight, which renders as the previous
// day in western timezones — so parse it as a local date instead.
export function formatVisitDate(dateString, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!dateString) return 'Date unknown'
  const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  const date = new Date(isDateOnly ? `${dateString}T00:00:00` : dateString)
  if (isNaN(date.getTime())) return 'Date unknown'
  return date.toLocaleDateString('en-US', options)
}
