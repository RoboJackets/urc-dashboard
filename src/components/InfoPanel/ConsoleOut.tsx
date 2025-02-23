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
      if (message.level <= 20) {
        if (lowPriorityMsgs.length >= MAX_MSGS) {
          setLowPriorityMsgs((msgs) => msgs.slice(1));
        }
        setLowPriorityMsgs((msgs) => [...msgs, message]);
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
                {displayedLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{log.level}</TableCell>
                    <TableCell>{log.name}</TableCell>
                    <TableCell>{log.msg}</TableCell>
                    <TableCell>
                      {new Date(log.timestamp).toLocaleString()}
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
