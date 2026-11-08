import { useSyncExternalStore } from "react";

// Tiny shared slot so WaypointsManager rows can hand a coordinate to the
// MissionPanel's goal entry without prop-drilling through App.
let draft: string | null = null;
const listeners = new Set<() => void>();

export function setGoalDraft(text: string) {
  draft = text;
  listeners.forEach((l) => l());
}

export function useGoalDraft(): string | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => draft,
    () => draft,
  );
}

export function clearGoalDraft() {
  draft = null;
  listeners.forEach((l) => l());
}
