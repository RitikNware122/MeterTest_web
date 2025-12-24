import { useState } from "react";
import { GATEWAY_COMMANDS } from "./gatewaysCommands";

export default function App() {
  const [imei, setImei] = useState("");
  const [amount, setAmount] = useState("");
  const [logs, setLogs] = useState([]);

  const sendCommand = async (cmd) => {
  if (!/^\d{15}$/.test(imei)) {
    alert("Invalid IMEI (15 digits required)");
    return;
  }

  try {
    const res = await fetch("http://localhost:3001/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imei,
        amount: Number(amount || 0),
        gateway: cmd.hex
      })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Publish failed");

    setLogs(prev => [
      {
        label: cmd.label,
        hex: cmd.hex,
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  } catch (err) {
    alert(err.message);
  }
};

  return (
    <div style={{ padding: 30 }}>
      <h2>Gateway Control Panel</h2>

      <input
        placeholder="Enter IMEI"
        value={imei}
        onChange={e => setImei(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <input
        placeholder="Amount (optional)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {GATEWAY_COMMANDS.map(cmd => (
          <button key={cmd.label} onClick={() => sendCommand(cmd)}>
            {cmd.label}
          </button>
        ))}
      </div>

      <hr />
      <h4>Logs</h4>
      {logs.map((l, i) => (
        <div key={i}>
          <b>{l.label}</b> — {l.time}
        </div>
      ))}
    </div>
  );
}
