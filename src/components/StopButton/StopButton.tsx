import { Button } from "@mui/material";
import ROSLIB from "roslib";
import { useRos } from "../../ros/RosContext";
import { useService } from "../../ros/hooks";
import { SERVICES, TOPICS, TOPIC_TYPES } from "../../ros/interfaces";
import { logOps } from "../../ros/opsLog";

/** Big always-visible stop: disables cmd_vel AND aborts any active mission. */
export const StopButton = () => {
  const { ros } = useRos();
  const abort = useService(SERVICES.abortMission, "std_srvs/srv/Trigger");

  const stop = () => {
    if (ros) {
      const t = new ROSLIB.Topic({ ros, name: TOPICS.cmdVelEnabled, messageType: TOPIC_TYPES.cmdVelEnabled });
      t.advertise();
      t.publish(new ROSLIB.Message({ data: false }));
      setTimeout(() => t.unadvertise(), 500);
    }
    abort({}).catch(() => {});
    logOps("sys", "STOP pressed — cmd_vel disabled + abort sent");
  };

  return (
    <Button
      variant="contained"
      color="error"
      onClick={stop}
      sx={{ fontWeight: 700, textTransform: "none", ml: 2, flexShrink: 0 }}
    >
      STOP
    </Button>
  );
};
