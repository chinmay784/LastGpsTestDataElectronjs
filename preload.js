const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onUsbAdded: (cb) => ipcRenderer.on("usb-added", (_, d) => cb(d)),
  onUsbRemoved: (cb) => ipcRenderer.on("usb-removed", (_, d) => cb(d)),
  findGpsPort: () => ipcRenderer.invoke("find-gps-port"),
  startGps: (port, baudRate) => ipcRenderer.invoke("start-gps", port, baudRate),
  onGpsData: (cb) => ipcRenderer.on("gps-data", (_, data) => cb(data)),
  onGpsError: (cb) => ipcRenderer.on("gps-error", (_, err) => cb(err)),
});





// again new read Dtaa from Gps device
// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronAPI", {
//   onGpsData: (callback) => ipcRenderer.on("gps-data", (_, data) => callback(data)),
//   onUsbAdded: (callback) => ipcRenderer.on("usb-added", (_, device) => callback(device)),
//   onUsbRemoved: (callback) => ipcRenderer.on("usb-removed", (_, device) => callback(device)),
// });

