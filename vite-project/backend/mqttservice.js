import mqtt from "mqtt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IOT_ENDPOINT = "ar7fthu9bpn11-ats.iot.ap-south-1.amazonaws.com";

const client = mqtt.connect(`mqtts://${IOT_ENDPOINT}:8883`, {
  clientId: "gateway-backend-" + Date.now(),
  key: fs.readFileSync(path.join(__dirname, "certs/MyThing.private.key")),
  cert: fs.readFileSync(path.join(__dirname, "certs/MyThing.cert.pem")),
  ca: fs.readFileSync(path.join(__dirname, "certs/AmazonRootCA1.pem")),
  protocol: "mqtts",
  keepalive: 60,
  clean: true
});

client.on("connect", () => {
  console.log("✅ MQTT Connected (Backend)");
});

client.on("error", err => {
  console.error("❌ MQTT Error:", err);
});

export function publishGatewayCommand(imei, amount, gatewayHex) {
  const topic = `gateway/${imei}`;

  const payload = {
    type: "gatewaySwitch",
    amt: amount,
    txn_id: Date.now().toString(),
    lang: "eng",
    url: "https://bizintuit.in/soundbox/sounds_nextpay.czip",
    restart: true,
    lang_support: "eng",
    gateway: gatewayHex
  };

  console.log("📤 Publishing to:", topic);
  console.log("📦 Payload:", payload);

  client.publish(topic, JSON.stringify(payload), { qos: 1 });
}
