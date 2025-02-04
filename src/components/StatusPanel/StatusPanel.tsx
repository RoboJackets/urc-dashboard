import {
  Card,
  Box,
  CardContent,
  CardHeader,
  Typography,
  useTheme,
} from "@mui/material";
import { Statuses } from "./Statuses";

interface StatusPanelProps {
  ROS: ROSLIB.Ros;
  isDark: boolean;
}
export const StatusPanel = (props: StatusPanelProps) => {
  return (
    <Card
      sx={{
        backgroundColor: props.isDark ? "grey.800" : "white",
        color: props.isDark ? "white" : "black",
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
            Status Panel
          </Typography>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding: "4px",
        }}
      />
      <CardContent>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={0.7}
        >
          <Statuses ROS={props.ROS} isDark={props.isDark} />
        </Box>
      </CardContent>
    </Card>
  );
};
