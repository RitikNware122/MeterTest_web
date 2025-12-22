import { useEffect, useState } from "react";
import { createMqttClient } from "./mqtt";
import { GATEWAY_COMMANDS } from "./gatewaysCommands";

export default function App() {
  const [client, setClient] = useState(null);
  const [imei, setImei] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("DISCONNECTED");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    let mqtt;

    createMqttClient().then(c => {
      mqtt = c;
      setClient(c);

      c.on("connect", () => setStatus("CONNECTED"));
      c.on("reconnect", () => setStatus("RECONNECTING"));
      c.on("error", () => setStatus("ERROR"));
    });

    return () => mqtt?.end();
  }, []);

  const publishCommand = (cmd) => {
    if (!client || !client.connected) {
      alert("MQTT not connected yet. Please wait...");
      return;
    }

    if (!imei || !amount) {
      alert("Please enter IMEI and Amount");
      return;
    }

    const topic = `gateway/${imei}`;

    const payload = {
      type: "gatewaySwitch",
      amt: Number(amount),
      txn_id: "5050",
      lang: "eng",
      url: "https://bizintuit.in/soundbox/sounds_nextpay.czip",
      restart: "true",
      lang_support: "eng",
      gateway: cmd.hex
    };

    client.publish(topic, JSON.stringify(payload), { qos: 1 });

    // ✅ LOG AFTER PUBLISH
    setLogs(prev => [
      {
        label: cmd.label,
        topic,
        amount,
        hex: cmd.hex,
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  return (
    <div style={{ padding: 30, maxWidth: 700 }}>
      <h2>Gateway MQTT Control Panel</h2>

      <p>
        <b>Status:</b>{" "}
        <span style={{ color: status === "CONNECTED" ? "green" : "red" }}>
          {status}
        </span>
      </p>

      <input
        placeholder="Enter IMEI"
        value={imei}
        onChange={e => setImei(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 20 }}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {GATEWAY_COMMANDS.map(cmd => (
          <button
            key={cmd.label}
            disabled={!client || status !== "CONNECTED"}
            onClick={() => publishCommand(cmd)}
            style={{
              padding: 12,
              background: status === "CONNECTED" ? "#007bff" : "#999",
              color: "#fff",
              border: "none",
              cursor: status === "CONNECTED" ? "pointer" : "not-allowed",
              borderRadius: 4
            }}
          >
            {cmd.label}
          </button>
        ))}
      </div>

      <hr />
      <h4>Logs</h4>

      {logs.map((l, i) => (
        <div key={i} style={{ fontSize: 13 }}>
          <b>{l.label}</b>
          <div>Topic: {l.topic}</div>
          <div>Amount: ₹{l.amount}</div>
          <div>{l.hex}</div>
          <div>{l.time}</div>
          <hr />
        </div>
      ))}
    </div>
  );
}


