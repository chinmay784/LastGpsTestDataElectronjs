const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // USB events
  onUsbAdded: (callback) => ipcRenderer.on("usb-added", (_, device) => callback(device)),
  onUsbRemoved: (callback) => ipcRenderer.on("usb-removed", (_, device) => callback(device)),
  listUsbDrives: () => ipcRenderer.invoke("list-usb-drives"),

  // GPS APIs
  findGpsPort: () => ipcRenderer.invoke("find-gps-port"),
  startGps: (port) => ipcRenderer.invoke("start-gps", port),
  onGpsData: (callback) => ipcRenderer.on("gps-data", (_, data) => callback(data)),
  onGpsError: (callback) => ipcRenderer.on("gps-error", (_, err) => callback(err)),
});





// again new read Dtaa from Gps device
// const { contextBridge, ipcRenderer } = require("electron");

// contextBridge.exposeInMainWorld("electronAPI", {
//   onGpsData: (callback) => ipcRenderer.on("gps-data", (_, data) => callback(data)),
//   onUsbAdded: (callback) => ipcRenderer.on("usb-added", (_, device) => callback(device)),
//   onUsbRemoved: (callback) => ipcRenderer.on("usb-removed", (_, device) => callback(device)),
// });

