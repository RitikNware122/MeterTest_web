import express from "express";
import cors from "cors";
import { publishGatewayCommand } from "./mqttservice.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/publish", (req, res) => {
  const { imei, amount, gateway } = req.body;

  if (!imei || !gateway) {
    return res.status(400).json({ error: "IMEI and gateway required" });
  }

  publishGatewayCommand(imei, Number(amount || 0), gateway);
  res.json({ success: true });
});

app.listen(3001, () => {
  console.log("🚀 Backend running on http://localhost:3001");
});
