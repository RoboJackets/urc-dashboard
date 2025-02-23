import { useEffect, useState } from "react";
import ROSLIB from "roslib";
import { Card, CardHeader, CardContent, Typography } from "@mui/material";

interface IMUProps {
  ROS: any;
  isDark: boolean;
}

export const IMU = (props: IMUProps) => {
  const [heading, setHeading] = useState(0);
  const IMUTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/imu/data",
    messageType: "sensor_msgs/Imu",
  });

  useEffect(() => {
    IMUTopic.subscribe((message: any) => {
      const [x, y, z, w]: number[] = [
        message.orientation.x,
        message.orientation.y,
        message.orientation.z,
        message.orientation.w,
      ];
      const [sqx, sqy, sqz, sqw]: number[] = [x * x, y * y, z * z, w * w];
      const unit = sqx + sqy + sqz + sqw;
      let eulerZ = 5;

      const test = x * y * z * w;
      if (test < 0.499 * unit && test > -0.499 * unit) {
        // singularity at north pole
        eulerZ = Math.atan2(2 * x * w - 2 * y * z, -sqx + sqy - sqz + sqw);
      }
      let headingDegrees = (eulerZ * 180) / Math.PI;
      if (headingDegrees < 0) {
        headingDegrees += 360;
      }
      headingDegrees %= 360;
      setHeading(headingDegrees);
    });
  });

  return (
    <Card
      sx={{
        backgroundColor: props.isDark ? "grey.800" : "white",
        color: props.isDark ? "white" : "black",
        // Ensure the arrow doesn't visibly overflow the card
        overflow: "hidden",
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            align="center"
            gutterBottom
            sx={{ fontSize: "1rem", fontWeight: 500 }}
          >
            Heading (IMU Direction)
          </Typography>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding: "4px",
        }}
      />
      <CardContent>
        {/* Numeric heading */}
        <div>{`Heading: ${heading}`}</div>

        {/* Compass circle */}
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
          {/* Arrow stem (behind arrowhead) */}
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
          {/* Arrow (the triangle) */}
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

          {/* N/E/S/W labels */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#ccc",
              fontWeight: "bold",
            }}
          >
            N
          </div>
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ccc",
              fontWeight: "bold",
            }}
          >
            E
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              transform: "translateX(-50%)",
              color: "#ccc",
              fontWeight: "bold",
            }}
          >
            S
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#ccc",
              fontWeight: "bold",
            }}
          >
            W
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
