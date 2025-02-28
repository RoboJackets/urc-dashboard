import { useEffect, useState } from "react";
import ROSLIB from "roslib";

import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormControlLabel,
  Switch,
} from "@mui/material";

interface ConsoleOutProps {
  ROS: any;
  isDark: boolean;
}

const levelToLevelName: { [key: number]: string } = {
  10: "DEBUG",
  20: "INFO",
  30: "WARN",
  40: "ERROR",
  50: "FATAL",
};

export const ConsoleOut = (props: ConsoleOutProps) => {
  const [lowPriorityMsgs, setLowPriorityMsgs] = useState<any[]>([]);
  const [highPriorityMsgs, setHighPriorityMsgs] = useState<any[]>([]);

  const [showHighPriority, setShowHighPriority] = useState(false);

  const ConsoleOutTopic = new ROSLIB.Topic({
    ros: props.ROS,
    name: "/rosout",
    messageType: "rcl_interfaces/Log",
  });

  const MAX_MSGS = 100;

  useEffect(() => {
    ConsoleOutTopic.subscribe((message: any) => {
      console.log(message);

      // remove duplicates
      if (
        lowPriorityMsgs.length > 0 &&
        message.stamp.sec === lowPriorityMsgs[0].stamp.sec &&
        message.stamp.nanosec === lowPriorityMsgs[0].stamp.nanosec
      ) {
        console.log("HERE");
        return;
      }
      if (
        highPriorityMsgs.length > 0 &&
        message.stamp.sec === highPriorityMsgs[0].stamp.sec &&
        message.stamp.nanosec === highPriorityMsgs[0].stamp.nanosec
      ) {
        return;
      }

      if (message.level <= 20) {
        if (lowPriorityMsgs.length >= MAX_MSGS) {
          setLowPriorityMsgs((msgs) => msgs.slice(0, MAX_MSGS - 1));
        }
        setLowPriorityMsgs((msgs) => [message, ...msgs]);
      } else {
        setHighPriorityMsgs((msgs) => [message, ...msgs]);
      }
    });
  }, []);

  const displayedLogs = showHighPriority ? highPriorityMsgs : lowPriorityMsgs;

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
            Console Out
          </Typography>
        }
        sx={{
          backgroundColor: props.isDark ? "grey.700" : "grey.300",
          padding: "4px",
        }}
      />

      <CardContent>
        <div>
          {/* Toggle switch */}
          <FormControlLabel
            control={
              <Switch
                checked={showHighPriority}
                onChange={() => setShowHighPriority(!showHighPriority)}
              />
            }
            label={
              showHighPriority
                ? "Showing High Priority Logs"
                : "Showing Low Priority Logs"
            }
            style={{ marginBottom: "10px" }}
          />

          {/* Scrollable Table */}
          <TableContainer
            component={Paper}
            style={{ maxHeight: 400, overflowY: "auto" }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Level</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedLogs
                  .filter((_, index) => index % 2 === 0)
                  .map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{levelToLevelName[log.level]}</TableCell>
                      <TableCell>{log.name}</TableCell>
                      <TableCell>{log.msg}</TableCell>
                      <TableCell>
                        {new Date(
                          log.stamp.sec * 1000 + log.stamp.nanosec,
                        ).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </CardContent>
    </Card>
  );
};
