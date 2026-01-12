import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import {
  publishGatewayCommand,
  publishOtaUpdate
} from "./mqttservice.js";

import {
  startSubscriber,
  devices,
  resetDevices
} from "./subscriberService.js";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

/* ---------- GATEWAY SWITCH API ---------- */
app.post("/publish", (req, res) => {
  const { imei, amount, gateway } = req.body;

  if (!imei || !gateway) {
    return res.status(400).json({ error: "IMEI and gateway required" });
  }

  publishGatewayCommand(imei, Number(amount || 0), gateway);
  res.json({ success: true });
});

/* ---------- OTA API ---------- */
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

/* ---------- GET CURRENT STATUS ---------- */
app.get("/devices", (req, res) => {
  res.json(devices);
});

/* ---------- SOCKET.IO ---------- */
io.on("connection", socket => {
  console.log("🧩 Frontend connected");

  // send current cached status
  Object.values(devices).forEach(d => {
    socket.emit("device_update", d);
  });

  // 🔄 REFRESH FROM SUBSCRIBER UI
  socket.on("refresh_status", () => {
    resetDevices();
    console.log("🔄 Status refresh requested by UI");
  });
});

/* ---------- START MQTT SUBSCRIBER ---------- */
startSubscriber(io);

/* ---------- START SERVER ---------- */
server.listen(3001, () => {
  console.log("🚀 Backend running on http://localhost:3001");
});
