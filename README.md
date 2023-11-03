# Setup Instructions

Install node.js and npm using these commands:

```bash
sudo apt-get install nodejs
sudo apt-get install npm
```

Install the dependencies:

```bash
npm install
```

Follow the instructions in [`urc_dashboard`](../urc_dashboard/README.md) package to launch Foxglove, and the websocket.

Run the server:

```bash
npm start
```

# Usage

## Host Input

1. Start the rosbridge server on the rover using `ros2 launch urc_bringup websocket.launch.py`. Then find the ip of the roroverbot using `hostname -I`.

2. Input the host IP into the dashboard and click connect.

## Control Panel

1. You can enable/disable the rover using the dropdown.

2. You can change what mode the rover is in. Auto is for autonomous mode, and Teleop is for manual mode. Test is for simulation only mode.

3. If you want to use a controller with the dashboard, make sure you have the necessary drivers installed. Then, plug in the controller and wiggle around the joysticks or press a couple buttons to make sure it is connected (if nothing happens, then your drivers didnt install properly and javascript cannot see the controllers). Then, choose the controller you want to use for driving the rover and operating the arm.

4. You can see the statuses of rosbridge and the rover in the status panel.

## Navigation Panel

1. If you want to use the maps in offline mode, download the tiles from this [link](https://drive.google.com/drive/folders/1c812eV4HamnchAFPQAVT9MSjyUMZn3OQ?usp=sharing) and place them in the `public/static` folder. I have offline tiles for the competitiion area in this folder.

2. You can add and delete waypoints in the waypoints panel

3. The waypoints are displayed on the map using blue markers, and the robot is displayed using a green "R" marker.

4. The odometery of the rover is displayed in the odometery panel.
