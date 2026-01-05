import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

export default function Subscriber() {
  const [devices, setDevices] = useState({});

  useEffect(() => {
    socket.on("device_update", data => {
      setDevices(prev => ({
        ...prev,
        [data.device_id]: data
      }));
    });

    return () => socket.off("device_update");
  }, []);

  const getSignalColor = (signal) => {
    if (signal >= 20) return "green";
    if (signal >= 10) return "orange";
    return "red";
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📡 Live Devices</h2>

      {Object.values(devices).length === 0 && (
        <p style={styles.empty}>No devices online</p>
      )}

      <div style={styles.grid}>
        {Object.values(devices).map(d => (
          <div key={d.device_id} style={styles.card}>
            
            {/* Header */}
            <div style={styles.cardHeader}>
              <span style={styles.imei}>📟 {d.device_id}</span>

              <span
                style={{
                  ...styles.status,
                  backgroundColor: d.device_status === "online" ? "#2ecc71" : "#e74c3c"
                }}
              >
                {d.device_status?.toUpperCase()}
              </span>
            </div>

            {/* Body */}
            <div style={styles.row}>
              <span>📶 Signal</span>
              <span style={{ color: getSignalColor(d.signal), fontWeight: "bold" }}>
                {d.signal}
              </span>
            </div>

            <div style={styles.row}>
              <span>🔋 Battery</span>
              <span>{d.battery}%</span>
            </div>

            <div style={styles.row}>
              <span>⏱ Last Update</span>
              <span>{new Date(d.last_seen).toLocaleTimeString()}</span>
            </div>

            {/* Gateway */}
            <div style={{ marginTop: 10 }}>
              <div style={styles.gatewayTitle}>⚙ Gateway Data</div>
              <pre style={styles.gatewayBox}>
                {JSON.stringify(d.gateway, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  container: {
    padding: 20,
    maxWidth: 1200,
    margin: "auto"
  },
  heading: {
    textAlign: "center",
    marginBottom: 20
  },
  empty: {
    textAlign: "center",
    color: "#777"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 15
  },
  card: {
    borderRadius: 10,
    background: "#ffffff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: 15,
    transition: "transform 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  imei: {
    fontWeight: "bold",
    fontSize: 14
  },
  status: {
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 6,
    fontSize: 14
  },
  gatewayTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 13
  },
  gatewayBox: {
    background: "#f4f6f8",
    padding: 10,
    borderRadius: 6,
    fontSize: 12,
    maxHeight: 120,
    overflow: "auto"
  }
};
