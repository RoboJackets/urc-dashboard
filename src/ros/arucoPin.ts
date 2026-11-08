import { useSyncExternalStore } from "react";
import type { Coordinate } from "../components/NavigationPanel/CoordinateInterface";

// Shared slot for the ArUco-refined arrival pose from a route mission result —
// MissionPanel writes it (converted via /toLL), NavigationPanel renders it.
let pin: Coordinate | null = null;
const listeners = new Set<() => void>();

export function setArucoPin(c: Coordinate | null) {
  pin = c;
  listeners.forEach((l) => l());
}

export function useArucoPin(): Coordinate | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => pin,
    () => pin,
  );
}
