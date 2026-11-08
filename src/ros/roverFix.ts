import { TopicData, useTopic } from "./hooks";
import { TOPICS, TOPIC_TYPES } from "./interfaces";

/** sensor_msgs/msg/NavSatFix (fields the dashboard uses) */
export interface NavSatFix {
  status: { status: number; service: number };
  latitude: number;
  longitude: number;
  altitude: number;
  position_covariance: number[];
  position_covariance_type: number;
}

// sensor_msgs/msg/NavSatStatus
export const FIX_STATUS_LABELS: Record<number, string> = {
  [-1]: "NO FIX",
  0: "FIX",
  1: "SBAS",
  2: "GBAS",
};

const COVARIANCE_TYPE_UNKNOWN = 0;

export const hasFix = (fix: NavSatFix | null): fix is NavSatFix =>
  fix != null && fix.status.status >= 0 && Number.isFinite(fix.latitude) && Number.isFinite(fix.longitude);

export interface FixAccuracy {
  /** horizontal DRMS (sqrt of east + north variance), meters */
  horizontal: number;
  /** vertical 1-sigma, meters */
  vertical: number;
}

/** null when the receiver does not report covariance */
export function fixAccuracy(fix: NavSatFix): FixAccuracy | null {
  const c = fix.position_covariance;
  if (fix.position_covariance_type === COVARIANCE_TYPE_UNKNOWN || !c || c.length < 9) return null;
  return { horizontal: Math.sqrt(Math.max(0, c[0] + c[4])), vertical: Math.sqrt(Math.max(0, c[8])) };
}

export function useRoverFix(): TopicData<NavSatFix> {
  return useTopic<NavSatFix>(TOPICS.gps, TOPIC_TYPES.gps, { staleAfterMs: 3000 });
}
