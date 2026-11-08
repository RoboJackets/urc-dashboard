# Dashboard Ops Runbook

## Pre-mission (15 min setup)

1. `npm start` → dashboard on :3000.
2. Host input: `rover-ip:9090` → Connect.
3. Header → **Preflight**. Every line should be green; fix any red before the
   clock starts (rosbridge, heartbeat, GNSS fix, /fromLL + /toLL, mission
   actions, abort/resume, coordinator, drive mode, planner costmap).
4. Verify chips: Rosbridge green, Robot green, mode/light chips live, header
   **link** chip green (amber ≥ 1 s / red ≥ 3 s since the last message).
5. Toggle map to **Offline** if using cached tiles (see below).
6. Ops & Scoring → pick the timer preset (C2 setup 15, Autonomy 40, Equipment
   servicing 30; Custom for Astrobiology/Delivery as set by the judges).

## Missions

- **Route / Astronaut goal:** Mission Control → pick type → enter GNSS
  (DD `38.411,-110.786`, DDM `38 24.66 N, 110 47.16 W`, or DMS) → Send Goal.
  Goal entry locks while the rover is moving (rule 1.e.iii).
- **Abort** pauses for teleop, preserves the task (20% penalty). **Resume** retries it.
- **Cancel** terminates the goal entirely — different from Abort.
- **STOP** (header): `/cmd_vel_enabled=false` + abort. Use for any "stop now".

## Scoring aids

- Ops & Scoring: mission timer, per-task abort/teleop/intervention counters
  (autonomy penalties cap at 50%), ops log for the debrief. The log survives a
  page refresh; **Export** saves it as CSV — do this before **Clear**.
- Distance readouts show against arrival thresholds (1 m route / 3 m astronaut).
- GNSS readout (Navigation panel) shows fix type, altitude and accuracy; the
  copy button puts `lat, lng` on the clipboard. Waypoint rows and the mission
  goal field show distance and true bearing from the rover.

## Offline tiles (required — no internet at MDRS)

`./tools/fetch_tiles.sh` once before leaving → tiles cached in `public/static/map`
for the competition square mile. Map Online/Offline button switches sources.

## Stack requirements rover-side

- `rosbridge_websocket` launched with `send_action_goals_in_new_thread:=true`
  (else an active goal blocks the socket and Abort/Cancel never arrive) and
  `call_services_in_new_thread:=true` (else one slow service call stalls every
  later call from the dashboard, including abort).
- `rosapi` running (the rosbridge launch file starts it) — used for preflight
  and arrival-radius parameters.
- `ekf.launch.py` (navsat_transform) running — `/fromLL` is required for GNSS goals.
- `autonomy.launch.py` for the mission action servers.
