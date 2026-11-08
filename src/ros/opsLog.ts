import { useSyncExternalStore } from "react";

export interface OpsLogEntry {
  stamp: number;
  tag: "mission" | "cmd" | "nav" | "sys";
  text: string;
}

const MAX = 200;
// Persisted so an accidental refresh mid-mission doesn't lose the debrief record.
const STORAGE_KEY = "opsLog:v1";

function loadEntries(): OpsLogEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(-MAX) : [];
  } catch {
    return [];
  }
}

let entries: OpsLogEntry[] = loadEntries();
const listeners = new Set<() => void>();

function update(next: OpsLogEntry[]) {
  entries = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — keep the in-memory log
  }
  listeners.forEach((l) => l());
}

export function logOps(tag: OpsLogEntry["tag"], text: string) {
  update([...entries.slice(-MAX + 1), { stamp: Date.now(), tag, text }]);
}

export function clearOpsLog() {
  update([]);
}

const csvField = (s: string) => `"${s.replace(/"/g, '""')}"`;

export function opsLogToCsv(log: OpsLogEntry[]): string {
  const rows = log.map((e) => {
    const d = new Date(e.stamp);
    return [csvField(d.toLocaleString()), d.toISOString(), e.tag, csvField(e.text)].join(",");
  });
  return ["time_local,time_utc,tag,text", ...rows].join("\n");
}

export function useOpsLog(): OpsLogEntry[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => entries,
    () => entries,
  );
}
