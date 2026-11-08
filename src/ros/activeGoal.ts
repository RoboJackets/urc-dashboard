import { useSyncExternalStore } from "react";

export interface ActiveGoal {
  lat: number;
  lng: number;
  /** meters — mission arrival threshold drawn around the goal */
  radius: number;
}

// Shared slot for the in-flight mission goal — MissionPanel writes it,
// NavigationPanel renders the marker and arrival ring.
let goal: ActiveGoal | null = null;
const listeners = new Set<() => void>();

export function setActiveGoal(g: ActiveGoal | null) {
  goal = g;
  listeners.forEach((l) => l());
}

export function useActiveGoal(): ActiveGoal | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => goal,
    () => goal,
  );
}
