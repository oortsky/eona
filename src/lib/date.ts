export function safeDate(value: string | null) {
  return value ? new Date(value) : null;
}
export function safeTime(value: string | null) {
  return value ? new Date(value).getTime() : 0;
}
