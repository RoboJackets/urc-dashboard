import { useCallback, useEffect, useRef, useState } from "react";
import ROSLIB from "roslib";
import { useRos, ActionHandlers, ActionResultMsg } from "./RosContext";
import { SERVICES } from "./interfaces";

export interface TopicData<T> {
  msg: T | null;
  /** Date.now() of last received message; 0 if none */
  stamp: number;
  /** ms since last message; recomputed ~4x/sec */
  ageMs: number;
  /** true once ageMs exceeds staleAfterMs */
  stale: boolean;
}

/**
 * Subscribe to a topic for the lifetime of the component.
 * Returns the last message plus freshness metadata for staleness badges.
 */
export function useTopic<T = any>(
  name: string,
  messageType: string,
  opts: { staleAfterMs?: number; enabled?: boolean } = {},
): TopicData<T> {
  const { ros, connectionState } = useRos();
  const { staleAfterMs = 3000, enabled = true } = opts;
  const [data, setData] = useState<TopicData<T>>({
    msg: null,
    stamp: 0,
    ageMs: 0,
    stale: true,
  });

  useEffect(() => {
    if (!ros || connectionState !== "connected" || !enabled) {
      setData((d) => ({ ...d, stale: true }));
      return;
    }
    const topic = new ROSLIB.Topic({ ros, name, messageType });
    topic.subscribe((m: any) =>
      setData({ msg: m as T, stamp: Date.now(), ageMs: 0, stale: false }),
    );
    return () => topic.unsubscribe();
  }, [ros, connectionState, name, messageType, enabled]);

  useEffect(() => {
    const t = setInterval(
      () =>
        setData((d) => ({
          ...d,
          ageMs: d.stamp ? Date.now() - d.stamp : 0,
          stale: !d.stamp || Date.now() - d.stamp > staleAfterMs,
        })),
      250,
    );
    return () => clearInterval(t);
  }, [staleAfterMs]);

  return data;
}

/** Type-safe-ish wrapper around a rosbridge service call. */
export function useService(name: string, serviceType: string) {
  const { ros } = useRos();
  const service = useRef<ROSLIB.Service | null>(null);

  useEffect(() => {
    service.current = ros
      ? new ROSLIB.Service({ ros, name, serviceType })
      : null;
  }, [ros, name, serviceType]);

  return useCallback(
    (args: any): Promise<any> =>
      new Promise((resolve, reject) => {
        if (!service.current) return reject(new Error("not connected"));
        service.current.callService(
          new ROSLIB.ServiceRequest(args),
          resolve,
          reject,
        );
      }),
    [],
  );
}

export interface UseActionApi {
  sendGoal: (args: any) => string | null;
  cancelGoal: () => void;
  /** the client goal id currently in flight, if any */
  goalId: string | null;
}

/**
 * ROS 2 action client over raw rosbridge ops (send_action_goal /
 * cancel_action_goal / action_feedback / action_result).
 * Only one in-flight goal per hook instance; a new sendGoal replaces it.
 */
export function useAction(
  action: string,
  actionType: string,
  handlers: ActionHandlers,
): UseActionApi {
  const { sendActionGoal, cancelActionGoal } = useRos();
  const [goalId, setGoalId] = useState<string | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const sendGoal = useCallback(
    (args: any): string | null => {
      const id = `${action}-${Date.now().toString(36)}`;
      sendActionGoal(id, action, actionType, args, {
        onFeedback: (v) => handlersRef.current.onFeedback?.(v),
        onResult: (v: ActionResultMsg) => {
          setGoalId(null);
          handlersRef.current.onResult?.(v);
        },
        onLost: () => {
          setGoalId(null);
          handlersRef.current.onLost?.();
        },
      });
      setGoalId(id);
      return id;
    },
    [action, actionType, sendActionGoal],
  );

  const cancelGoal = useCallback(() => {
    if (goalId) cancelActionGoal(goalId, action);
  }, [goalId, action, cancelActionGoal]);

  return { sendGoal, cancelGoal, goalId };
}

/**
 * Resolve a node parameter via rosapi, with fallback. The fetched value is
 * used only when it has the same type as the fallback (and, for numbers,
 * is finite); anything else keeps the fallback.
 */
export function useParam<T extends string | number>(
  nodeName: string,
  paramName: string,
  fallback: T,
): T {
  const { ros, connectionState } = useRos();
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    if (!ros || connectionState !== "connected") {
      setValue(fallback);
      return;
    }
    let active = true;
    const getParam = new ROSLIB.Service({
      ros,
      name: SERVICES.getParam,
      serviceType: "rosapi_msgs/srv/GetParam",
    });
    const readParam = () =>
      getParam.callService(
        new ROSLIB.ServiceRequest({ name: `${nodeName}:${paramName}` }),
        (res: any) => {
          if (!active) return;
          try {
            const parsed = JSON.parse(res.value);
            const usable =
              typeof parsed === typeof fallback &&
              (typeof parsed === "number" ? Number.isFinite(parsed) : parsed !== "");
            if (usable) setValue(parsed as T);
          } catch {
            // keep fallback
          }
        },
        () => active && setValue(fallback),
      );
    // rosapi's get_param blocks indefinitely when the target node is absent,
    // and rosbridge serializes service calls per client — so a get_param on a
    // missing node would stall every later service call (incl. abort). Only
    // ask once the node is confirmed in the graph.
    new ROSLIB.Service({ ros, name: SERVICES.rosapiNodes, serviceType: "rosapi_msgs/srv/Nodes" }).callService(
      new ROSLIB.ServiceRequest({}),
      (res: any) => {
        if (active && Array.isArray(res.nodes) && res.nodes.includes(nodeName)) readParam();
      },
      () => {},
    );
    return () => {
      active = false;
    };
  }, [ros, connectionState, nodeName, paramName, fallback]);

  return value;
}
