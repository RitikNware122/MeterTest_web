import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import {
  publishGatewayCommand,
  publishOtaUpdate
} from "./mqttservice.js";
import { startSubscriber, devices } from "./subscriberService.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

/* ---------- EXISTING GATEWAY SWITCH ---------- */
app.post("/publish", (req, res) => {
  const { imei, amount, gateway } = req.body;

  if (!imei || !gateway) {
    return res.status(400).json({ error: "IMEI and gateway required" });
  }

  publishGatewayCommand(imei, Number(amount || 0), gateway);
  res.json({ success: true });
});

/* ---------- NEW OTA API ---------- */
app.post("/ota", (req, res) => {
  const { imei, amount, url, restart } = req.body;

  if (!imei || !url) {
    return res.status(400).json({ error: "IMEI and OTA URL required" });
  }

  publishOtaUpdate(
    imei,
    Number(amount || 0),
    url,
    restart !== false
  );

  res.json({ success: true });
});

/* ---------- GET LIVE DEVICES ---------- */
app.get("/devices", (req, res) => {
  res.json(devices);
});

/* ---------- SOCKET ---------- */
io.on("connection", socket => {
  console.log("🧩 Frontend connected");

  Object.values(devices).forEach(d => {
    socket.emit("device_update", d);
  });
});

/* ---------- START SUBSCRIBER ---------- */
startSubscriber(io);

/* ---------- SERVER ---------- */
server.listen(3001, () => {
  console.log("🚀 Backend running on http://localhost:3001");
});
