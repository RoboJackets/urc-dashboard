import { Card, CardHeader, CardContent, Stack, Typography } from "@mui/material";
import { useTopic } from "../../ros/hooks";
import { TOPICS, TOPIC_TYPES } from "../../ros/interfaces";
import { StaleBadge } from "../StaleBadge/StaleBadge";

interface CmdVelProps {
  ROS: any;
  isDark: boolean;
}

interface Twist {
  linear: { x: number };
  angular: { z: number };
}

export const CmdVels = (props: CmdVelProps) => {
  const cmd = useTopic<Twist>(TOPICS.cmdVel, TOPIC_TYPES.cmdVel, { staleAfterMs: 2000 });
  const linear = cmd.msg?.linear.x ?? 0;
  const angular = cmd.msg?.angular.z ?? 0;

  return (
    <Card
      sx={{
        backgroundColor: props.isDark ? "grey.800" : "white",
        color: props.isDark ? "white" : "black",
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontSize: "1rem", fontWeight: 500 }}>
              Cmd Vel
            </Typography>
            <StaleBadge ageMs={cmd.ageMs} stale={cmd.stale} />
          </Stack>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding: "4px",
        }}
      />
      <CardContent>
        <Typography variant="body2">
          {`Linear: ${linear.toPrecision(3)}, Angular: ${angular.toPrecision(3)}`}
        </Typography>
      </CardContent>
    </Card>
  );
};
