import { useState } from "react";

/* 🔒 OTA URL HIDDEN & CONTROLLED */
const OTA_URL = "https://bizintuit.in/soundbox/fota.bin";

export default function OtaUpdate() {
  const [imei, setImei] = useState("");
  const [amount, setAmount] = useState("");
  const [logs, setLogs] = useState([]);

  const sendOta = async () => {
    if (!/^\d{15}$/.test(imei)) {
      alert("Invalid IMEI (15 digits required)");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/ota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imei,
          amount: Number(amount || 0),
          url: OTA_URL,
          restart: true
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTA failed");

      setLogs(prev => [
        {
          time: new Date().toLocaleTimeString(),
          imei
        },
        ...prev
      ]);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📦 OTA Update Panel</h2>

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

      <button style={styles.button} onClick={sendOta}>
        🚀 Trigger OTA Update
      </button>

      {/* Logs */}
      <div style={styles.logs}>
        <h4>📜 OTA Logs</h4>

        {logs.length === 0 && (
          <p style={{ color: "#777" }}>No OTA triggered yet</p>
        )}

        {logs.map((l, i) => (
          <div key={i} style={styles.logItem}>
            <span>✅ OTA Triggered for {l.imei}</span>
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
  button: {
    marginTop: 20,
    width: "100%",
    background: "linear-gradient(135deg, #dde7e2ff, #b39f74ff)",
    border: "none",
    color: "#fff",
    padding: 14,
    borderRadius: 8,
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
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
