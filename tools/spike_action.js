// Spike: verify ROS 2 action transport over rosbridge using raw wire ops.
// Protocol: send {op:"send_action_goal", action, action_type, args, feedback, id}
//           recv {op:"action_feedback"|"action_result", action, values, status, result, id}
//           send {op:"cancel_action_goal", action, id}
const ROSLIB = require("roslib");

const ACTION = "/execute_autonomous_mission";
const ACTION_TYPE = "urc_msgs/action/ExecuteAutonomousMission";
const GOAL_ID = "spike-goal-1";
const ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

let resultReceived = false;

ros.on("connection", () => {
  log("connected");

  // wrap onmessage to catch action ops roslib doesn't dispatch
  const orig = ros.socket.onmessage;
  ros.socket.onmessage = (data) => {
    try {
      const m = JSON.parse(typeof data === "string" ? data : data.data);
      if (m.op === "action_feedback") {
        log(`FEEDBACK [${m.id}]:`, JSON.stringify(m.values));
        return;
      }
      if (m.op === "action_result") {
        log(`RESULT [${m.id}]: ok=${m.result} status=${m.status}`, JSON.stringify(m.values));
        resultReceived = true;
        return;
      }
    } catch (e) { /* non-json path */ }
    orig(data);
  };

  ros.callOnConnection({
    op: "send_action_goal",
    action: ACTION,
    action_type: ACTION_TYPE,
    feedback: true,
    id: GOAL_ID,
    args: {
      waypoint: {
        header: { frame_id: "map", stamp: { sec: 0, nanosec: 0 } },
        pose: {
          position: { x: 5.0, y: 5.0, z: 0.0 },
          orientation: { x: 0, y: 0, z: 0, w: 1.0 },
        },
      },
    },
  });
  log("goal sent, id=" + GOAL_ID);

  // cancel after 4s if no terminal result
  setTimeout(() => {
    if (!resultReceived) {
      log("cancelling goal");
      ros.callOnConnection({ op: "cancel_action_goal", action: ACTION, id: GOAL_ID });
    }
  }, 4000);

  setTimeout(() => { log("done, exiting"); ros.close(); process.exit(0); }, 20000);
});
ros.on("error", (e) => log("ros error:", e));
ros.on("close", () => log("closed"));
