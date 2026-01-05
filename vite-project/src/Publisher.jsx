import { useState } from "react";
import { GATEWAY_COMMANDS } from "./gatewaysCommands";

export default function Publisher() {
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
        { label: cmd.label, time: new Date().toLocaleTimeString() },
        ...prev
      ]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>⚙ Gateway Control Panel</h2>

      {/* Inputs */}
      <div style={styles.inputGroup}>
        <input
          placeholder="📟 Enter IMEI"
          value={imei}
          onChange={e => setImei(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="💰 Amount (optional)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Buttons */}
      <div style={styles.grid}>
        {GATEWAY_COMMANDS.map(cmd => (
          <button
            key={cmd.label}
            style={styles.button}
            onClick={() => sendCommand(cmd)}
          >
            ⚡ {cmd.label}
          </button>
        ))}
      </div>

      {/* Logs */}
      <div style={styles.logs}>
        <h4>📜 Command Logs</h4>

        {logs.length === 0 && (
          <p style={{ color: "#777" }}>No commands sent yet</p>
        )}

        {logs.map((l, i) => (
          <div key={i} style={styles.logItem}>
            <span>✅ {l.label}</span>
            <span style={styles.time}>{l.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    maxWidth: 900,
    margin: "auto",
    padding: 20
  },
  heading: {
    textAlign: "center",
    marginBottom: 20
  },
  inputGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10
  },
  input: {
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
    fontSize: 14
  },
  grid: {
    marginTop: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12
  },
  button: {
    background: "linear-gradient(135deg, #e8f9edff, #e7cb8eff)",
    border: "none",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
    transition: "transform 0.2s"
  },
  logs: {
    marginTop: 30
  },
  logItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#f5f7fa",
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
    fontSize: 14
  },
  time: {
    color: "#555"
  }
};
