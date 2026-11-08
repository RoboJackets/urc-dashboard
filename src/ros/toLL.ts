import { useCallback, useRef } from "react";
import { useService } from "./hooks";
import { SERVICES } from "./interfaces";
import type { Coordinate } from "../components/NavigationPanel/CoordinateInterface";

/**
 * map-frame Point -> lat/lng via navsat_transform's /toLL service.
 * Throttled per call site; returns the last converted coordinate.
 */
export function useMapToLL(minIntervalMs = 1000) {
  const toLL = useService(SERVICES.toLL, "robot_localization/srv/ToLL");
  const lastCall = useRef(0);
  const pending = useRef<{ x: number; y: number; z: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (point: { x: number; y: number; z?: number }, cb: (c: Coordinate | null) => void) => {
      const run = () => {
        lastCall.current = Date.now();
        const p = pending.current!;
        pending.current = null;
        toLL({ map_point: { x: p.x, y: p.y, z: p.z ?? 0 } })
          .then((res) =>
            cb(
              res?.ll_point
                ? { id: "", lat: res.ll_point.latitude, lng: res.ll_point.longitude }
                : null,
            ),
          )
          .catch(() => cb(null));
      };
      pending.current = { x: point.x, y: point.y, z: point.z ?? 0 };
      const wait = minIntervalMs - (Date.now() - lastCall.current);
      if (wait <= 0 && !timer.current) run();
      else if (!timer.current)
        timer.current = setTimeout(() => {
          timer.current = null;
          run();
        }, wait);
    },
    [toLL, minIntervalMs],
  );
}
