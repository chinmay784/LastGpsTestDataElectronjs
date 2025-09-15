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
const drivelist = require("drivelist");
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
  mainWindow.loadURL("http://localhost:5173"); // Vite dev server
  // Or production:
  // mainWindow.loadFile(path.join(__dirname, "./dist/index.html"));

  // Handle USB drive list
  ipcMain.handle("list-usb-drives", async () => {
    const drives = await drivelist.list();
    return drives.filter((d) => d.isUSB);
  });

  // Start USB monitoring
  usbDetect.startMonitoring();

  // Already connected devices
  usbDetect.find().then((devices) => {
    devices.forEach((device) => mainWindow.webContents.send("usb-added", device));
  });

  usbDetect.on("add", (device) => {
    console.log("USB added:", device);
    mainWindow.webContents.send("usb-added", device);
  });

  usbDetect.on("remove", (device) => {
    console.log("USB removed:", device);
    mainWindow.webContents.send("usb-removed", device);
  });

  // ✅ Find GPS COM Port
  ipcMain.handle("find-gps-port", async () => {
    const ports = await SerialPort.list();
    console.log("Available Serial Ports:", ports);

    // Try to find Traxo GPS by vendorId/productId/manufacturer
    const gps = ports.find(
      (p) =>
        (p.vendorId && p.vendorId.toLowerCase() === "1a86") || // Example: CH340 USB-to-Serial
        (p.manufacturer && p.manufacturer.toLowerCase().includes("traxo"))
    );

    if (!gps) {
      return { success: false, error: "No GPS device found" };
    }

    return { success: true, path: gps.path }; // e.g. "COM5" or "/dev/ttyUSB0"
  });

  // ✅ Start GPS reading
  ipcMain.handle("start-gps", async (_, comPort) => {
    try {
      gpsPort = new SerialPort({
        path: comPort,
        baudRate: 9600, // Standard for GPS
        autoOpen: true,
      });

      const parser = gpsPort.pipe(new ReadlineParser({ delimiter: "\r\n" }));

      parser.on("data", (line) => {
        console.log("📡 GPS Data:", line);
        mainWindow.webContents.send("gps-data", line);
      });

      gpsPort.on("error", (err) => {
        console.error("❌ GPS Error:", err);
        mainWindow.webContents.send("gps-error", err.message);
      });

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
}

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  usbDetect.stopMonitoring();
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
