import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import ROSLIB from "roslib";

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "lost";

export interface ActionResultMsg {
  result: boolean;
  status: number;
  values: any;
}

export interface ActionHandlers {
  onFeedback?: (values: any) => void;
  onResult?: (msg: ActionResultMsg) => void;
  /** Called if the connection drops while the goal is in flight. */
  onLost?: () => void;
}

interface ActionApi {
  sendActionGoal: (
    id: string,
    action: string,
    actionType: string,
    args: any,
    handlers: ActionHandlers,
  ) => void;
  cancelActionGoal: (id: string, action: string) => void;
}

interface RosApi extends ActionApi {
  ros: ROSLIB.Ros | null;
  connectionState: ConnectionState;
  connect: (host: string, port: number) => void;
  disconnect: () => void;
  /** ms since the websocket last delivered any message; -1 if unknown */
  lastMsgAge: () => number;
}

const RosContext = createContext<RosApi>({
  ros: null,
  connectionState: "disconnected",
  connect: () => {},
  disconnect: () => {},
  sendActionGoal: () => {},
  cancelActionGoal: () => {},
  lastMsgAge: () => -1,
});

export const useRos = () => useContext(RosContext);

const RECONNECT_MIN_MS = 1000;
const RECONNECT_MAX_MS = 15000;

export const RosProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ros, setRos] = useState<ROSLIB.Ros | null>(null);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("disconnected");
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const handlersRef = useRef(new Map<string, ActionHandlers>());
  const lastMsgRef = useRef(0);
  const manualCloseRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(RECONNECT_MIN_MS);
  const targetRef = useRef<{ host: string; port: number } | null>(null);

  const failAllGoals = useCallback(() => {
    handlersRef.current.forEach((h) => h.onLost?.());
    handlersRef.current.clear();
  }, []);

  const wireActionDispatch = useCallback(
    (r: ROSLIB.Ros) => {
      const sock: any = (r as any).socket;
      if (!sock || typeof sock.onmessage !== "function") return;
      const orig = sock.onmessage;
      sock.onmessage = (data: any) => {
        lastMsgRef.current = Date.now();
        try {
          const m = JSON.parse(
            typeof data === "string" ? data : data.data,
          );
          if (m.op === "action_feedback" || m.op === "action_result") {
            const h = handlersRef.current.get(m.id);
            if (h) {
              if (m.op === "action_feedback") h.onFeedback?.(m.values);
              else {
                h.onResult?.(m as ActionResultMsg);
                handlersRef.current.delete(m.id);
              }
            }
            return;
          }
        } catch {
          // non-JSON frame — fall through to roslib's handler
        }
        orig(data);
      };
    },
    [],
  );

  const scheduleReconnect = useCallback(() => {
    if (manualCloseRef.current || !targetRef.current) return;
    const delay = backoffRef.current;
    backoffRef.current = Math.min(backoffRef.current * 2, RECONNECT_MAX_MS);
    reconnectTimerRef.current = setTimeout(() => {
      const t = targetRef.current;
      if (t && rosRef.current) {
        setConnectionState("connecting");
        rosRef.current.connect(`ws://${t.host}:${t.port}`);
      }
    }, delay);
  }, []);

  const connect = useCallback(
    (host: string, port: number) => {
      manualCloseRef.current = false;
      targetRef.current = { host, port };
      backoffRef.current = RECONNECT_MIN_MS;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      const old = rosRef.current;
      if (old) {
        // Strip the lifecycle listeners we attached, but keep an error sink —
        // eventemitter2 throws on an 'error' event with no listeners if the
        // old socket emits asynchronously after close().
        old.removeAllListeners("connection");
        old.removeAllListeners("close");
        old.on("error", () => {});
        old.close();
      }

      const r = new ROSLIB.Ros({ url: `ws://${host}:${port}` });
      rosRef.current = r;
      setConnectionState("connecting");

      r.on("connection", () => {
        backoffRef.current = RECONNECT_MIN_MS;
        lastMsgRef.current = Date.now();
        wireActionDispatch(r);
        setRos(r);
        setConnectionState("connected");
      });
      r.on("error", () => {});
      r.on("close", () => {
        failAllGoals();
        setConnectionState((s) => (s === "connected" ? "lost" : s));
        setRos(null);
        scheduleReconnect();
      });
    },
    [failAllGoals, scheduleReconnect, wireActionDispatch],
  );

  const disconnect = useCallback(() => {
    manualCloseRef.current = true;
    targetRef.current = null;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    failAllGoals();
    rosRef.current?.close();
    setConnectionState("disconnected");
  }, [failAllGoals]);

  const sendActionGoal = useCallback(
    (
      id: string,
      action: string,
      actionType: string,
      args: any,
      handlers: ActionHandlers,
    ) => {
      const r = rosRef.current;
      if (!r) return;
      handlersRef.current.set(id, handlers);
      (r as any).callOnConnection({
        op: "send_action_goal",
        action,
        action_type: actionType,
        feedback: true,
        id,
        args,
      });
    },
    [],
  );

  const cancelActionGoal = useCallback((id: string, action: string) => {
    const r = rosRef.current;
    if (!r) return;
    (r as any).callOnConnection({
      op: "cancel_action_goal",
      action,
      id,
    });
  }, []);

  const lastMsgAge = useCallback(
    () => (lastMsgRef.current ? Date.now() - lastMsgRef.current : -1),
    [],
  );

  useEffect(
    () => () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      rosRef.current?.close();
    },
    [],
  );

  return (
    <RosContext.Provider
      value={{
        ros,
        connectionState,
        connect,
        disconnect,
        sendActionGoal,
        cancelActionGoal,
        lastMsgAge,
      }}
    >
      {children}
    </RosContext.Provider>
  );
};
