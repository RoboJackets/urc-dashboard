// Central registry of ROS interface names. Defaults mirror the parameter
// defaults in urc_state_machine/config/mission.yaml — keep them in sync.
// Only the parameters listed in NAV_COORDINATOR_PARAMS are resolved at
// connect time (via rosapi); every other name here is fixed.

export const ACTIONS = {
  executeAutonomousMission: "execute_autonomous_mission",
  executeAstronautMission: "execute_astronaut_mission",
} as const;

export const ACTION_TYPES = {
  executeAutonomousMission: "urc_msgs/action/ExecuteAutonomousMission",
  executeAstronautMission: "urc_msgs/action/ExecuteAstronautMission",
} as const;

export const SERVICES = {
  abortMission: "/abort_mission",
  resumeMission: "/resume_mission",
  fromLL: "/fromLL",
  toLL: "/toLL",
  getParam: "/rosapi/get_param",
  rosapiNodes: "/rosapi/nodes",
  rosapiServices: "/rosapi/services",
  rosapiActionServers: "/rosapi/action_servers",
} as const;

export const TOPICS = {
  heartbeat: "/heartbeat",
  driverJoy: "/driver/joy",
  imu: "/imu/fused",
  cmdVel: "/cmd_vel",
  rosout: "/rosout",
  gps: "/gps",
  setBase: "/set_base",
  gpsWaypoint: "/waypoint",
  mapWaypoint: "/nav/waypoint",
  command: "/command",
  coordinatorState: "nav_coordinator_state",
  driveMode: "/drive_mode",
  cmdVelMode: "/cmd_vel_mode",
  cmdVelEnabled: "/cmd_vel_enabled",
  statusLight: "/command/status_light",
  astronautPose: "/astronaut/pose",
  arucoDetections: "/aruco/detections",
  battery: "state_battery",
  costmap: "/costmap",
} as const;

export const TOPIC_TYPES: Record<keyof typeof TOPICS, string> = {
  heartbeat: "std_msgs/msg/Header",
  driverJoy: "sensor_msgs/msg/Joy",
  imu: "sensor_msgs/msg/Imu",
  cmdVel: "geometry_msgs/msg/Twist",
  rosout: "rcl_interfaces/msg/Log",
  gps: "sensor_msgs/msg/NavSatFix",
  setBase: "std_msgs/msg/Bool",
  gpsWaypoint: "urc_msgs/msg/Waypoint",
  mapWaypoint: "geometry_msgs/msg/PoseStamped",
  command: "urc_msgs/msg/AstronautCommand",
  coordinatorState: "std_msgs/msg/String",
  driveMode: "std_msgs/msg/String",
  cmdVelMode: "std_msgs/msg/String",
  cmdVelEnabled: "std_msgs/msg/Bool",
  statusLight: "urc_msgs/msg/StatusLightCommand",
  astronautPose: "geometry_msgs/msg/PoseStamped",
  arucoDetections: "urc_msgs/msg/ArucoDetection",
  battery: "urc_msgs/msg/BatteryInfo",
  costmap: "grid_map_msgs/msg/GridMap",
};

export const FRAMES = {
  map: "map",
  base: "base_link",
  utm: "utm",
} as const;

export const NAV_COORDINATOR_NODE = "/nav_coordinator";

// NavCoordinator parameters read at connect time; values are the
// mission.yaml defaults used when rosapi or the node is unavailable.
export const NAV_COORDINATOR_PARAMS = {
  routeArrivalRadius: { name: "route_arrival_radius", fallback: 1.0 },
  astronautArrivalRadius: { name: "astronaut_arrival_radius", fallback: 3.0 },
} as const;
