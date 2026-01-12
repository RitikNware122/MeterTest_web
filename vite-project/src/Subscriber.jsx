import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";

export default function Subscriber() {
  const [devices, setDevices] = useState({});
  const socketRef = useRef(null);

  /* ---------- CONNECT SOCKET ---------- */
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("device_update", (data) => {
      setDevices(prev => ({
        ...prev,
        [data.device_id]: data
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  /* ---------- REFRESH HANDLER ---------- */
  const handleRefresh = () => {
    // 1️⃣ Clear UI immediately
    setDevices({});

    // 2️⃣ Tell backend to reset device cache
    socketRef.current.emit("refresh_status");
  };

  const getSignalColor = (signal) => {
    if (signal >= 20) return "green";
    if (signal >= 10) return "orange";
    return "red";
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.heading}>📡 Live Devices</h2>

        <button style={styles.refreshBtn} onClick={handleRefresh}>
          🔄 Refresh
        </button>
      </div>

      {Object.values(devices).length === 0 && (
        <p style={styles.empty}>No devices online</p>
      )}

      <div style={styles.grid}>
        {Object.values(devices).map((d) => (
          <div key={d.device_id} style={styles.card}>
            {/* Card Header */}
            <div style={styles.cardHeader}>
              <span style={styles.imei}>📟 {d.device_id}</span>

              <span
                style={{
                  ...styles.status,
                  backgroundColor:
                    d.device_status === "online" ? "#2ecc71" : "#e74c3c"
                }}
              >
                {d.device_status?.toUpperCase()}
              </span>
            </div>

            {/* Card Body */}
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

/* ---------- STYLES ---------- */

const styles = {
  container: {
    padding: 20,
    maxWidth: 1200,
    margin: "auto"
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  heading: {
    margin: 0,
    flex: 1,
    textAlign: "center"
  },
  refreshBtn: {
    padding: "8px 16px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    background: "linear-gradient(135deg, #dde7e2ff, #b39f74ff)",
    color: "#fff",
    fontSize: 14,
    boxShadow: "0 3px 8px rgba(0,0,0,0.2)"
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
    padding: 15
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
