// const {app , BrowserWindow} = require("electron");
// const url = require("url");
// const path = require("path")

// function createMainWindow(){
//     const mainWindow = new BrowserWindow({
//         title:"Electron",
//         // width:1000,
//         // height:600,
//     });

//     mainWindow.webContents.openDevTools()

//     const startUrl = url.format({
//         pathname :path.join(__dirname,"./Electron_Js/dist/index.html"),
//         protocol:"file"
//     });

//     mainWindow.loadURL("http://localhost:5173");
// };

// app.whenReady().then(createMainWindow);




// // // new updated code
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const usbDetect = require("usb-detection");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

let mainWindow;
let gpsPort;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.webContents.openDevTools();
  mainWindow.loadURL("http://localhost:5173");

  // USB detection
  usbDetect.startMonitoring();
  usbDetect.find().then((devices) =>
    devices.forEach((device) => mainWindow.webContents.send("usb-added", device))
  );
  usbDetect.on("add", (device) => mainWindow.webContents.send("usb-added", device));
  usbDetect.on("remove", (device) => mainWindow.webContents.send("usb-removed", device));

  // Find GPS port
  ipcMain.handle("find-gps-port", async () => {
    const ports = await SerialPort.list();
    const gps = ports.find((p) =>
      (p.vendorId && p.vendorId.toLowerCase() === "1a86") ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes("traxo"))
    );
    if (!gps) return { success: false, error: "No GPS device found" };
    return { success: true, path: gps.path };
  });

  // Start GPS with custom baud rate
 ipcMain.handle("start-gps", async (_, portPath, baudRate = 9600) => {
  try {
    gpsPort = new SerialPort({ path: portPath, baudRate: baudRate, autoOpen: true });
    const parser = gpsPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    parser.on("data", (line) => {
      console.log("📡 GPS Data:", line);   // ✅ log to main process console
      mainWindow.webContents.send("gps-data", line); // still send to frontend
    });

    gpsPort.on("error", (err) => {
      console.error("❌ GPS Error:", err.message); // ✅ log errors
      mainWindow.webContents.send("gps-error", err.message);
    });

    return { success: true };
  } catch (err) {
    console.error("❌ Failed to open GPS port:", err.message);
    return { success: false, error: err.message };
  }
});
}

app.whenReady().then(createMainWindow);
app.on("window-all-closed", () => {
  usbDetect.stopMonitoring();
  if (gpsPort) gpsPort.close();
  if (process.platform !== "darwin") app.quit();
});






// again new read Dtaa from Gps device
// const { app, BrowserWindow, ipcMain } = require("electron");
// const path = require("path");
// const { SerialPort } = require("serialport");
// const drivelist = require("drivelist"); // optional, for storage devices
// const usbDetect = require("usb-detection");

// let mainWindow;
// let gpsPort;

// function createMainWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1000,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: false,
//     },
//   });

//   mainWindow.webContents.openDevTools();
//   mainWindow.loadURL("http://localhost:5173");

//   // 🟢 Detect USB devices
//   usbDetect.startMonitoring();

//   usbDetect.on("add", (device) => {
//     console.log("USB added:", device);
//     mainWindow.webContents.send("usb-added", device);

//     // TODO: filter by your GPS vendorId/productId if known
//     // Otherwise, just try opening a COM port
//   });

//   usbDetect.on("remove", (device) => {
//     console.log("USB removed:", device);
//     mainWindow.webContents.send("usb-removed", device);

//     if (gpsPort) {
//       gpsPort.close();
//       gpsPort = null;
//     }
//   });

//   // 🟢 Manually open GPS COM port (Windows: COM3, COM4... / Linux: /dev/ttyUSB0)
//   startGpsReader("COM3"); // 👉 change to your actual COM port
// }

// function startGpsReader(portName) {
//   gpsPort = new SerialPort({
//     path: portName,
//     baudRate: 9600, // GPS devices almost always use 9600
//   });

//   gpsPort.on("open", () => {
//     console.log(`✅ GPS Connected on ${portName}`);
//   });

//   gpsPort.on("data", (data) => {
//     const gpsData = data.toString("utf-8").trim();
//     console.log("📡 GPS Data:", gpsData);

//     // Send to frontend (React)
//     if (mainWindow) {
//       mainWindow.webContents.send("gps-data", gpsData);
//     }
//   });

//   gpsPort.on("error", (err) => {
//     console.error("❌ GPS Error:", err);
//   });
// }

// app.whenReady().then(createMainWindow);

// app.on("window-all-closed", () => {
//   usbDetect.stopMonitoring();
//   if (gpsPort) gpsPort.close();
//   if (process.platform !== "darwin") app.quit();
// });
