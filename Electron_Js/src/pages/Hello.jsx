import { useEffect, useState } from "react";

export default function Hello() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [gpsData, setGpsData] = useState([]);

  useEffect(() => {
    window.electronAPI.onUsbAdded((device) => {
      const name =
        device.deviceName ||
        device.manufacturer ||
        `Vendor:${device.vendorId}-Product:${device.productId}`;
      setDevices((prev) => (prev.includes(name) ? prev : [...prev, name]));
    });

    window.electronAPI.onUsbRemoved((device) => {
      const name =
        device.deviceName ||
        device.manufacturer ||
        `Vendor:${device.vendorId}-Product:${device.productId}`;
      setDevices((prev) => prev.filter((d) => d !== name));
    });

    window.electronAPI.onGpsData((data) => {
      setGpsData((prev) => [...prev.slice(-30), data]); // last 30 lines
    });

    window.electronAPI.onGpsError((err) => {
      setGpsData((prev) => [...prev, "❌ ERROR: " + err]);
    });
  }, []);

  const handleStartGps = async () => {
    const result = await window.electronAPI.findGpsPort();
    if (!result.success) {
      alert(result.error);
      return;
    }
    await window.electronAPI.startGps(result.path);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "250px 1fr",
        height: "100vh",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#eef2f7",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          backgroundColor: "#1f2937",
          color: "#fff",
          padding: 20,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginBottom: 20, fontSize: 20 }}>🔌 USB Devices</h2>
        <ul style={{ listStyle: "none", padding: 0, flex: 1, overflowY: "auto" }}>
          {devices.length === 0 && <li>No devices connected</li>}
          {devices.map((d, i) => (
            <li
              key={i}
              onClick={() => setSelectedDevice(d)}
              style={{
                padding: "10px",
                marginBottom: 8,
                borderRadius: 6,
                cursor: "pointer",
                backgroundColor: selectedDevice === d ? "#374151" : "#111827",
                transition: "0.2s",
              }}
            >
              {d}
            </li>
          ))}
        </ul>
        {selectedDevice && (
          <button
            onClick={handleStartGps}
            style={{
              marginTop: 20,
              padding: "10px",
              fontSize: 15,
              borderRadius: 6,
              border: "none",
              backgroundColor: "#10b981",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ▶ Start GPS
          </button>
        )}
      </div>

      {/* Main Content */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column" }}>
        <h1 style={{ marginBottom: 15, color: "#333" }}>📡 GPS Data Stream</h1>
        <div
          style={{
            flex: 1,
            backgroundColor: "#000",
            color: "#0f0",
            padding: 15,
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 14,
            overflowY: "auto",
            boxShadow: "inset 0 0 10px rgba(0,0,0,0.8)",
          }}
        >
          {gpsData.length === 0 ? (
            <p style={{ color: "#aaa" }}>Waiting for GPS data...</p>
          ) : (
            gpsData.map((line, i) => <div key={i}>{line}</div>)
          )}
        </div>
      </div>
    </div>
  );
}





// new data read from Gps Device Data
// import { useEffect, useState } from "react";

// export default function Hello() {
//   const [gpsLogs, setGpsLogs] = useState([]);

//   useEffect(() => {
//     window.electronAPI.onGpsData((data) => {
//       setGpsLogs((prev) => [...prev.slice(-20), data]); // keep last 20 lines
//     });
//   }, []);

//   return (
//     <div style={{ padding: 20, fontFamily: "monospace" }}>
//       {/* <h2>📡 GPS Live Data</h2> */}
//       <div style={{
//         background: "#000",
//         color: "#0f0",
//         padding: 10,
//         borderRadius: 8,
//         height: 600,
//         overflowY: "auto",
//       }}>
//         {gpsLogs.map((line, i) => (
//           <div key={i}>{line}</div>
//         ))}
//       </div>
//     </div>
//   );
// }
