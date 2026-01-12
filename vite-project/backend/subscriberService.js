import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IOT_ENDPOINT = "ar7fthu9bpn11-ats.iot.ap-south-1.amazonaws.com";

/* 🔥 IN-MEMORY STATUS CACHE */
export const devices = {}; // imei -> latest status

/* ---------- MQTT SUBSCRIBER ---------- */
export function startSubscriber(io) {
  const client = mqtt.connect(`mqtts://${IOT_ENDPOINT}:8883`, {
    clientId: "gateway-subscriber-" + Date.now(),
    key: fs.readFileSync(path.join(__dirname, "certs/MyThing.private.key")),
    cert: fs.readFileSync(path.join(__dirname, "certs/MyThing.cert.pem")),
    ca: fs.readFileSync(path.join(__dirname, "certs/AmazonRootCA1.pem")),
    protocol: "mqtts",
    keepalive: 60
  });

  client.on("connect", () => {
    console.log("📡 MQTT Subscriber Connected");
    client.subscribe("gateway/status", { qos: 1 });
  });

  client.on("message", (topic, message) => {
    try {
      const data = JSON.parse(message.toString());

      const imei = data.device_id || data.imei;
      if (!imei) return;

      devices[imei] = {
        device_id: imei,
        signal: Number(data.signal),
        device_status: data.status,
        gateway: data.gateway,
        battery: data.battery,
        last_seen: Date.now(),
        online: data.status === "online"
      };

      // 🔥 SEND TO ALL CONNECTED FRONTENDS
      io.emit("device_update", devices[imei]);

    } catch (err) {
      console.error("❌ Invalid MQTT message", err);
    }
  });
}

/* ---------- RESET STATUS CACHE ---------- */
export function resetDevices() {
  Object.keys(devices).forEach(key => delete devices[key]);
  console.log("🔄 Device status cache cleared");
}
