# Running the URC Dashboard

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

If the maps are gray in offline mode, that means the tiles are not downloaded. Download the tiles from this [link](https://drive.google.com/drive/folders/1c812eV4HamnchAFPQAVT9MSjyUMZn3OQ?usp=sharing) and place them in the `public/static` folder. I have offline tiles for the competitiion area.
