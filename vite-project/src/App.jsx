import { useState } from "react";
import Publisher from "./Publisher";
import Subscriber from "./Subscriber";

export default function App() {
  const [mode, setMode] = useState(null);

  if (!mode) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>Gateway Dashboard</h2>

        <button
          style={{ padding: 15, margin: 10, width: 200 }}
          onClick={() => setMode("publisher")}
        >
          📤 Publisher
        </button>

        <button
          style={{ padding: 15, margin: 10, width: 200 }}
          onClick={() => setMode("subscriber")}
        >
          📡 Subscriber
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => setMode(null)}>⬅ Back</button>
      <hr />

      {mode === "publisher" && <Publisher />}
      {mode === "subscriber" && <Subscriber />}
    </div>
  );
}
