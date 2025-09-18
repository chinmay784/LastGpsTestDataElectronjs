// import { useEffect, useState } from "react";
// import '.././index.css'
// export default function GpsDashboard() {
//   const [devices, setDevices] = useState([]);
//   const [selectedDevice, setSelectedDevice] = useState("");
//   const [baudRate, setBaudRate] = useState(9600); // default
//   const [gpsData, setGpsData] = useState([]);

//   const baudRates = [4800, 9600, 19200, 38400, 57600, 115200];

//   useEffect(() => {
//     window.electronAPI.onUsbAdded((device) => {
//       const name =
//         device.deviceName ||
//         device.manufacturer ||
//         `Vendor:${device.vendorId}-Product:${device.productId}`;
//       setDevices((prev) => (prev.includes(name) ? prev : [...prev, name]));
//     });

//     window.electronAPI.onUsbRemoved((device) => {
//       const name =
//         device.deviceName ||
//         device.manufacturer ||
//         `Vendor:${device.vendorId}-Product:${device.productId}`;
//       setDevices((prev) => prev.filter((d) => d !== name));
//     });

//     window.electronAPI.onGpsData((data) => {
//       setGpsData((prev) => [...prev, data]); // store ALL data (no slicing)
//     });

//     window.electronAPI.onGpsError((err) => {
//       setGpsData((prev) => [...prev, "❌ ERROR: " + err]);
//     });
//   }, []);

//   const handleStartGps = async () => {
//     if (!selectedDevice) {
//       alert("Select a device first!");
//       return;
//     }

//     const result = await window.electronAPI.findGpsPort();
//     if (!result.success) {
//       alert(result.error);
//       return;
//     }

//     await window.electronAPI.startGps(result.path, parseInt(baudRate, 10));
//   };

//   return (
//     <div className="grid grid-cols-[250px_1fr] h-screen font-sans bg-gray-100">
//       {/* Sidebar */}
//       <div className="bg-gray-900 text-white p-5 flex flex-col">
//         <h2 className="mb-5 text-lg font-semibold">🔌 USB Devices</h2>
//         <ul className="list-none p-0 flex-1 overflow-y-auto space-y-2">
//           {devices.length === 0 && <li>No devices connected</li>}
//           {devices.map((d, i) => (
//             <li
//               key={i}
//               onClick={() => setSelectedDevice(d)}
//               className={`p-2 rounded cursor-pointer transition 
//                 ${selectedDevice === d
//                   ? "bg-gray-700"
//                   : "bg-gray-800 hover:bg-gray-700"
//                 }`}
//             >
//               {d}
//             </li>
//           ))}
//         </ul>

//         {/* Baud rate dropdown */}
//         {selectedDevice && (
//           <>
//             <select
//               value={baudRate}
//               onChange={(e) => setBaudRate(e.target.value)}
//               className="mt-3 p-2 rounded text-sm cursor-pointer bg-black text-white"
//             >
//               {baudRates.map((rate) => (
//                 <option key={rate} value={rate}>
//                   {rate} bps
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={handleStartGps}
//               className="mt-3 py-2 text-sm rounded bg-green-500 hover:bg-green-600 text-white font-medium cursor-pointer"
//             >
//               ▶ Start GPS
//             </button>
//           </>
//         )}
//       </div>

//       {/* Main Content */}
//       <div className="p-5 flex flex-col">
//         <h1 className="mb-4 text-xl font-bold text-gray-800">
//           📡 GPS Data Stream
//         </h1>
//         <div className="flex-1 bg-black text-green-400 p-4 rounded font-mono text-sm overflow-y-auto shadow-inner">
//           {gpsData.length === 0 ? (
//             <p className="text-gray-400">Waiting for GPS data...</p>
//           ) : (
//             gpsData.map((line, i) => <div key={i}>{line}</div>)
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Settings,
  Power,
  PowerOff,
  Database,
  Activity,
  RefreshCw,
} from "lucide-react";

const Hello = () => {
  const [baudRate, setBaudRate] = useState(9600);
  const [connected, setConnected] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");

  // ✅ GPS latest data stored as key:value object
  const [gpsData, setGpsData] = useState({});

  const baudRates = [4800, 9600, 19200, 38400, 57600, 115200];

  useEffect(() => {
    if (!window.electronAPI) return;

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

    // ✅ Parse incoming GPS data line by line
    window.electronAPI.onGpsData((line) => {
      const parts = line.split(":");
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(":").trim();

        setGpsData((prev) => ({
          ...prev,
          [key]: value,
        }));
      }
    });

    window.electronAPI.onGpsError((err) => {
      setGpsData((prev) => ({
        ...prev,
        ERROR: err,
      }));
    });
  }, []);

  // Connect
  const handleConnect = async () => {
    if (!selectedDevice) {
      alert("Please select a USB/COM device!");
      return;
    }
    const result = await window.electronAPI.findGpsPort();
    if (!result.success) {
      alert(result.error);
      return;
    }
    await window.electronAPI.startGps(result.path, parseInt(baudRate, 10));
    setConnected(true);
  };

  // Disconnect
  const handleDisconnect = () => {
    setConnected(false);
    setGpsData({});
  };

  // Refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setGpsData({});
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <Cpu className="w-7 h-7 text-blue-600" />
          <h1 className="text-xl font-bold text-blue-700">
            Traxo Testing Software
          </h1>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 hover:bg-blue-100 transition disabled:opacity-70"
        >
          <RefreshCw
            className={`w-5 h-5 text-blue-600 ${refreshing ? "animate-spin" : ""
              }`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <div className="flex flex-1 gap-6 p-6">
        {/* Left Panel */}
        <div className="w-1/4 bg-white shadow rounded-2xl p-6 border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" /> Serial Port
          </h2>

          {/* Devices */}
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="">Select Device</option>
            {devices.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Baud Rate */}
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(e.target.value)}
            className="w-full p-2 border rounded mb-6"
          >
            {baudRates.map((rate) => (
              <option key={rate} value={rate}>
                {rate} bps
              </option>
            ))}
          </select>

          {!connected ? (
            <button
              onClick={handleConnect}
              className="w-full py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              <Power className="inline w-5 h-5 mr-2" /> Connect
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="w-full py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              <PowerOff className="inline w-5 h-5 mr-2" /> Disconnect
            </button>
          )}

          <div className="mt-6 text-center">
            <span
              className={`text-lg font-bold flex items-center justify-center gap-2 ${connected ? "text-green-600" : "text-red-600"
                }`}
            >
              <Activity className="w-5 h-5" />
              {connected ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white shadow rounded-2xl p-6 border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-green-600" /> Latest GPS Data
          </h2>

          {Object.keys(gpsData).length === 0 ? (
            <div className="text-center text-gray-500 py-20 italic">
              📡 No GPS data yet...
            </div>
          ) : (
            <div className="overflow-y-auto max-h-[500px]">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-700">
                    <th className="border px-3 py-2 text-left">Parameter</th>
                    <th className="border px-3 py-2 text-left">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(gpsData).map(([key, value], idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border px-3 py-2 font-medium">{key}</td>
                      <td className="border px-3 py-2">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 text-center py-3 text-sm">
        © 2025 Traxo Testing Software
      </footer>
    </div>
  );
};

export default Hello;




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
