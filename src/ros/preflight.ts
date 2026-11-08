import ROSLIB from "roslib";
import { ACTIONS, NAV_COORDINATOR_NODE, SERVICES, TOPICS, TOPIC_TYPES } from "./interfaces";
import { FIX_STATUS_LABELS, NavSatFix, fixAccuracy, hasFix } from "./roverFix";

export type CheckStatus = "pass" | "warn" | "fail";

export interface CheckResult {
  label: string;
  status: CheckStatus;
  detail: string;
}

const TOPIC_WAIT_MS = 3000;
const COSTMAP_WAIT_MS = 5000;
const SERVICE_TIMEOUT_MS = 3000;
const LINK_HEALTHY_MS = 1000;
// Coordinator states that force the mux back to teleop every tick.
const TELEOP_HOLDING_STATES = ["PAUSED", "CANCELED"];

function waitForMessage<T>(ros: ROSLIB.Ros, name: string, messageType: string, timeoutMs: number): Promise<T | null> {
  return new Promise((resolve) => {
    const topic = new ROSLIB.Topic({ ros, name, messageType, throttle_rate: 1000, queue_length: 1 });
    const handler = (m: any) => {
      clearTimeout(timer);
      topic.unsubscribe(handler);
      resolve(m as T);
    };
    const timer = setTimeout(() => {
      topic.unsubscribe(handler);
      resolve(null);
    }, timeoutMs);
    topic.subscribe(handler);
  });
}

function callService<T>(ros: ROSLIB.Ros, name: string, serviceType: string, request: object): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`no response in ${SERVICE_TIMEOUT_MS / 1000}s`)), SERVICE_TIMEOUT_MS);
    new ROSLIB.Service({ ros, name, serviceType }).callService(
      new ROSLIB.ServiceRequest(request),
      (res: any) => {
        clearTimeout(timer);
        resolve(res as T);
      },
      (err: any) => {
        clearTimeout(timer);
        reject(new Error(String(err)));
      },
    );
  });
}

const absolute = (name: string) => (name.startsWith("/") ? name : `/${name}`);

interface Graph {
  nodes: string[];
  services: string[];
  actionServers: string[];
}

async function queryGraph(ros: ROSLIB.Ros): Promise<Graph | null> {
  try {
    // Graph queries only: they are answered by rosapi itself and never block on
    // another node (unlike rosapi/get_param on an absent node).
    const [n, s, a] = await Promise.all([
      callService<{ nodes: string[] }>(ros, SERVICES.rosapiNodes, "rosapi_msgs/srv/Nodes", {}),
      callService<{ services: string[] }>(ros, SERVICES.rosapiServices, "rosapi_msgs/srv/Services", {}),
      callService<{ action_servers: string[] }>(ros, SERVICES.rosapiActionServers, "rosapi_msgs/srv/GetActionServers", {}),
    ]);
    return { nodes: n.nodes ?? [], services: s.services ?? [], actionServers: (a.action_servers ?? []).map(absolute) };
  } catch {
    return null;
  }
}

function checkLink(lastMsgAgeMs: number): CheckResult {
  const label = "Rosbridge link";
  if (lastMsgAgeMs < 0) return { label, status: "fail", detail: "connected, but no messages received yet" };
  return {
    label,
    status: lastMsgAgeMs < LINK_HEALTHY_MS ? "pass" : "warn",
    detail: `last message ${(lastMsgAgeMs / 1000).toFixed(1)}s ago`,
  };
}

function checkGnss(fix: NavSatFix | null): CheckResult {
  const label = "GNSS fix (/gps)";
  if (!fix) return { label, status: "fail", detail: `no message in ${TOPIC_WAIT_MS / 1000}s` };
  const status = FIX_STATUS_LABELS[fix.status.status] ?? `status ${fix.status.status}`;
  if (!hasFix(fix)) return { label, status: "fail", detail: status };
  const acc = fixAccuracy(fix);
  return {
    label,
    status: "pass",
    detail: `${status} ${fix.latitude.toFixed(6)}, ${fix.longitude.toFixed(6)}, ${acc ? `±${acc.horizontal.toFixed(2)} m` : "accuracy unknown"}`,
  };
}

async function checkConversions(ros: ROSLIB.Ros, graph: Graph | null, fix: NavSatFix | null): Promise<CheckResult> {
  const label = "GNSS ↔ map conversion (/fromLL, /toLL)";
  if (!graph) return { label, status: "fail", detail: "cannot query services (rosapi unavailable)" };
  const missing = [SERVICES.fromLL, SERVICES.toLL].filter((s) => !graph.services.includes(s));
  if (missing.length) {
    return { label, status: "fail", detail: `${missing.join(", ")} not advertised — is navsat_transform running?` };
  }
  if (!hasFix(fix)) return { label, status: "warn", detail: "services present; not exercised without a GNSS fix" };
  try {
    const res = await callService<{ map_point: { x: number; y: number } }>(ros, SERVICES.fromLL, "robot_localization/srv/FromLL", {
      ll_point: { latitude: fix.latitude, longitude: fix.longitude, altitude: 0.0 },
    });
    await callService(ros, SERVICES.toLL, "robot_localization/srv/ToLL", { map_point: { x: 0, y: 0, z: 0 } });
    return { label, status: "pass", detail: `rover at map (${res.map_point.x.toFixed(1)}, ${res.map_point.y.toFixed(1)})` };
  } catch (e) {
    return { label, status: "fail", detail: String((e as Error).message ?? e) };
  }
}

function checkActions(graph: Graph | null): CheckResult {
  const label = "Mission action servers";
  if (!graph) return { label, status: "fail", detail: "cannot query action servers (rosapi unavailable)" };
  const wanted = [ACTIONS.executeAutonomousMission, ACTIONS.executeAstronautMission].map(absolute);
  const missing = wanted.filter((a) => !graph.actionServers.includes(a));
  return missing.length
    ? { label, status: "fail", detail: `missing ${missing.join(", ")} — is autonomy.launch.py running?` }
    : { label, status: "pass", detail: wanted.join(", ") };
}

function checkAbortResume(graph: Graph | null): CheckResult {
  const label = "Abort / Resume services";
  if (!graph) return { label, status: "fail", detail: "cannot query services (rosapi unavailable)" };
  const missing = [SERVICES.abortMission, SERVICES.resumeMission].filter((s) => !graph.services.includes(s));
  return missing.length
    ? { label, status: "fail", detail: `missing ${missing.join(", ")}` }
    : { label, status: "pass", detail: "available" };
}

function checkCoordinator(graph: Graph | null, state: { data: string } | null): CheckResult {
  const label = "Mission coordinator";
  if (graph && !graph.nodes.includes(NAV_COORDINATOR_NODE)) {
    return { label, status: "fail", detail: `${NAV_COORDINATOR_NODE} not running` };
  }
  if (!state) return { label, status: "warn", detail: "no state message received" };
  const phase = state.data.match(/state=(\w+)/)?.[1] ?? state.data;
  return TELEOP_HOLDING_STATES.includes(phase)
    ? { label, status: "warn", detail: `${phase} — coordinator holds teleop until a new mission (Auto toggle will snap back)` }
    : { label, status: "pass", detail: phase };
}

function checkDriveMode(mode: { data: string } | null): CheckResult {
  const label = "Drive mode (/drive_mode)";
  if (!mode) return { label, status: "fail", detail: "no state from twist_mux" };
  return mode.data === "disabled"
    ? { label, status: "warn", detail: "disabled — re-enable before driving" }
    : { label, status: "pass", detail: mode.data };
}

function checkReceived(label: string, msg: unknown, waitedMs: number, missingDetail: string): CheckResult {
  return msg
    ? { label, status: "pass", detail: "receiving" }
    : { label, status: "fail", detail: `no message in ${waitedMs / 1000}s — ${missingDetail}` };
}

/** Run every competition-readiness check against the live rosbridge connection. */
export async function runPreflight(ros: ROSLIB.Ros, lastMsgAgeMs: number): Promise<CheckResult[]> {
  const [graph, heartbeat, fix, driveMode, coordState, costmap] = await Promise.all([
    queryGraph(ros),
    waitForMessage(ros, TOPICS.heartbeat, TOPIC_TYPES.heartbeat, TOPIC_WAIT_MS),
    waitForMessage<NavSatFix>(ros, TOPICS.gps, TOPIC_TYPES.gps, TOPIC_WAIT_MS),
    waitForMessage<{ data: string }>(ros, TOPICS.driveMode, TOPIC_TYPES.driveMode, TOPIC_WAIT_MS),
    waitForMessage<{ data: string }>(ros, TOPICS.coordinatorState, TOPIC_TYPES.coordinatorState, TOPIC_WAIT_MS),
    waitForMessage(ros, TOPICS.costmap, TOPIC_TYPES.costmap, COSTMAP_WAIT_MS),
  ]);

  return [
    checkLink(lastMsgAgeMs),
    { label: "rosapi", status: graph ? "pass" : "fail", detail: graph ? `${graph.nodes.length} nodes` : "graph queries failed" },
    checkReceived("Rover heartbeat (/heartbeat)", heartbeat, TOPIC_WAIT_MS, "is the heartbeat publisher running?"),
    checkGnss(fix),
    await checkConversions(ros, graph, fix),
    checkActions(graph),
    checkAbortResume(graph),
    checkCoordinator(graph, coordState),
    checkDriveMode(driveMode),
    checkReceived("Planner costmap (/costmap)", costmap, COSTMAP_WAIT_MS, 'missions will fail with "Costmap is invalid"'),
  ];
}
