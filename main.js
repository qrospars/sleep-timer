// Modules to control application life and create native browser window
const electron = require('electron');
const {app, BrowserWindow, Tray, Menu} = require('electron');
const path = require('path');
const shutdown = require('electron-shutdown-command');
const ipcMain = require('electron').ipcMain;


const iconPath = path.join(__dirname, 'mug.ico');

electron.app.setLoginItemSettings({
    openAtLogin: true,
    path: electron.app.getPath("exe")
});

let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    });

    const appIcon = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App', click: function () {
                mainWindow.show()
            }
        },
        {
            label: 'Quit', click: function () {
                app.isQuiting = true;
                app.quit()
            }
        }
    ]);

    appIcon.setContextMenu(contextMenu);

    mainWindow.loadFile('index.html');

    // Hide Menu Bar
    mainWindow.removeMenu();

    mainWindow.on('minimize', function (event) {
        event.preventDefault();
        mainWindow.hide();
    });

    mainWindow.on('close', function (event) {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    });

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
}

let interval;
let timeInterval;

let secondsLeft = 60;

const clearObjectsAndIntervals = () => {
    clearInterval(interval);
    clearInterval(timeInterval);
    secondsLeft = 60;
};

ipcMain.on('submitForm', function (event, date) {
    let [hours, minutes] = date.toString().split(':');
    // Modify DOM
    mainWindow.loadFile('index2.html');


    function getCurrHoursAndMinutes() {
        let date = new Date(Date.now());
        let currHours = date.getHours();
        currHours = ("0" + currHours).slice(-2).toString();
        let currMinutes = date.getMinutes();
        currMinutes = ("0" + currMinutes).slice(-2).toString();
        return [currHours, currMinutes];
    }
    timeInterval = setInterval(() => {
        // Update countdown every second
        const [currHours, currMinutes] = getCurrHoursAndMinutes();
        if (currHours === hours && minutes - currMinutes <= 1) {
            mainWindow.webContents.send('changeCountdown', secondsLeft.toString())
            secondsLeft -= 1;
        }
    }, 1000);

    // Verify Time every 5 seconds
    interval = setInterval(function () {
        [currHours, currMinutes] = getCurrHoursAndMinutes();

        if (currHours === hours && minutes - currMinutes <= 1) {
            // If it is going to shutdown in one minute
            // show the main window to prevent for being surprised
            mainWindow.show();
        }
        if (currHours === hours && secondsLeft <= 45) {
            clearObjectsAndIntervals();
            shutdown.shutdown({
                // force: true,
                sudo: true,
                // debug: true,
                quitapp: true
            });
        }
    }, 5000); // every 30 seconds
});

ipcMain.on('submitForm2', function (event, date) {
    clearObjectsAndIntervals();
    mainWindow.loadFile('index.html');
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});


