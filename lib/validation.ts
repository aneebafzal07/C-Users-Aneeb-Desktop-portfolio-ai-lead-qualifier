export function isValidEmail(value: string) {
  const email = value.trim();
  if (!email) return false;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
