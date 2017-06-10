const {app, BrowserWindow, ipcMain, globalShortcut, Menu} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

const info_path = path.join(app.getPath("userData"), "bounds-info.json");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow () {
  var bounds;
  try {
    bounds = JSON.parse(fs.readFileSync(info_path, 'utf8'));
  } catch (e) {
    bounds = {width: 800, height: 600};
  }

  if (process.platform == 'linux') {
    bounds["icon"] = "./icons/ss.png";
  }

  // Create the browser window.
  win = new BrowserWindow(bounds);

  // and load the index.html of the app.
  if(process.env.ENV === 'development') {
    // Open the DevTools.
    win.webContents.openDevTools();
    win.loadURL("http://localhost:8080");
  } else {
    if (process.platform !== 'darwin') {
      win.setMenu(null);
    } else {
        var template = [
            {
                label: app.getName(),
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services', submenu: []},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideothers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            },
            {
                label: "Edit",
                submenu: [
                    {role: 'cut'},
                    {role: 'copy'},
                    {role: 'paste'},
                    {role: 'selectall'}
                ]
            }
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }
    win.loadURL(url.format({
      pathname: path.join(__dirname, '../dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  win.on('close', function () {
    fs.writeFileSync(info_path, JSON.stringify(win.getBounds()));
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    globalShortcut.register('ctrl+alt+Enter', () => {
        win.focus();
        win.webContents.send('activate_message_form');
    });
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('ready', (event, args) => {
    event.sender.send('userData', app.getPath("userData"));
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
