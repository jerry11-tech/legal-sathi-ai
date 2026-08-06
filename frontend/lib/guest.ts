export const GUEST_QUESTION_LIMIT = 5;

export function getGuestCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem('legalsathi_guest_count');
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function incrementGuestCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const current = getGuestCount();
    const updated = current + 1;
    localStorage.setItem('legalsathi_guest_count', updated.toString());
    return updated;
  } catch {
    return 0;
  }
}

export function isGuestLimitReached(): boolean {
  return getGuestCount() >= GUEST_QUESTION_LIMIT;
}
