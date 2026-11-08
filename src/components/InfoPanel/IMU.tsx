import { Card, CardHeader, CardContent, Stack, Typography } from "@mui/material";
import { useTopic } from "../../ros/hooks";
import { TOPICS, TOPIC_TYPES } from "../../ros/interfaces";
import { StaleBadge } from "../StaleBadge/StaleBadge";

interface IMUProps {
  ROS: any;
  isDark: boolean;
}

interface ImuMsg {
  orientation: { x: number; y: number; z: number; w: number };
}

export const IMU = (props: IMUProps) => {
  const imu = useTopic<ImuMsg>(TOPICS.imu, TOPIC_TYPES.imu, { staleAfterMs: 1500 });

  const heading = (() => {
    if (!imu.msg) return 0;
    const { x, y, z, w } = imu.msg.orientation;
    const [sqx, sqy, sqz, sqw] = [x * x, y * y, z * z, w * w];
    const unit = sqx + sqy + sqz + sqw;
    let eulerZ = 0;
    const test = x * y * z * w;
    if (test < 0.499 * unit && test > -0.499 * unit) {
      eulerZ = Math.atan2(2 * x * w - 2 * y * z, -sqx + sqy - sqz + sqw);
    }
    let deg = (eulerZ * 180) / Math.PI - 90;
    if (deg < 0) deg += 360;
    return deg % 360;
  })();

  return (
    <Card
      sx={{
        backgroundColor: props.isDark ? "grey.800" : "white",
        color: props.isDark ? "white" : "black",
        overflow: "hidden",
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" sx={{ fontSize: "1rem", fontWeight: 500 }}>
              Heading (IMU Direction)
            </Typography>
            <StaleBadge ageMs={imu.ageMs} stale={imu.stale} />
          </Stack>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding: "4px",
        }}
      />
      <CardContent>
        <div>{`Heading: ${heading.toFixed(1)}`}</div>
        <div
          style={{
            position: "relative",
            width: "120px",
            height: "120px",
            margin: "10px auto",
            border: "2px solid #ccc",
            borderRadius: "50%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "2px",
              height: "30%",
              backgroundColor: "red",
              transform: `translate(-50%, -100%) rotate(${heading}deg)`,
              transformOrigin: "50% 100%",
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -100%) rotate(${heading}deg)`,
              transformOrigin: "50% 100%",
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "20px solid red",
              transition: "transform 0.3s ease",
              zIndex: 2,
            }}
          />
          {["N", "E", "S", "W"].map((d, i) => (
            <div
              key={d}
              style={{
                position: "absolute",
                top: i === 0 ? 0 : i === 3 ? "50%" : undefined,
                bottom: i === 2 ? 0 : undefined,
                left: i === 3 ? 0 : "50%",
                right: i === 1 ? 0 : undefined,
                transform:
                  i === 0
                    ? "translateX(-50%)"
                    : i === 1
                      ? "translateY(-50%)"
                      : i === 2
                        ? "translateX(-50%)"
                        : "translateY(-50%)",
                color: "#ccc",
                fontWeight: "bold",
              }}
            >
              {d}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
