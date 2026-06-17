export const INITIAL_PARTICIPANT_COUNT = 12389;
export const PARTICIPANT_STORAGE_KEY = "zhangqiu-qualifier-participants";

export function nextParticipantCount(storedValue: string | null) {
  const parsed = storedValue ? Number.parseInt(storedValue, 10) : INITIAL_PARTICIPANT_COUNT;
  const current = Number.isFinite(parsed) && parsed >= INITIAL_PARTICIPANT_COUNT ? parsed : INITIAL_PARTICIPANT_COUNT;
  return current + 1;
}
