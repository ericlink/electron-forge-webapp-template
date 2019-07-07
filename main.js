// package.json
//  - name
//  - productName
//  - description
//  - config.app.url
//
//

const createMainWindow = (url, appName) => {
  const windowStateKeeper = require('electron-window-state');
  let mainWindowState = windowStateKeeper({ defaultWidth: 1000, defaultHeight: 800 });

  const { BrowserWindow } = require('electron');
  const window = new BrowserWindow({
    show: false,
    title: appName,
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    webPreferences: {
      nodeIntegration: true,
      partition: "persist:main",
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  mainWindowState.manage(window);

  window.loadURL(url);
  window.once('ready-to-show', () => {
    window.show();
    // open other domains in default browser
    const wc = window.webContents;
    wc.on('will-navigate', function (e, wcUrl) {
      console.log(wcUrl);
      console.log(wc.getURL());
      if (!wcUrl.startsWith(wc.getURL())) {
        e.preventDefault();
        require('electron').shell.openExternal(wcUrl);
      }
    })
  });


}

const init = () => {
  const { app, session } = require('electron');

  const pjson  = require('./package.json');
  const appName = pjson.name;
  const url = process.argv[1] ? process.argv[1] : pjson.config.app.url;

  if (!app.requestSingleInstanceLock()) {
    // quit and let second-instance handler take it
    app.quit()
  } else {
    // register these only on first instance that got the lock
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      createMainWindow(url, appName);
    });

    app.on('ready', () => {
      const cookie = require('./cookie.js');
      cookie.initCookieManager(session.defaultSession);
      const menu   = require('./menu.js');
      menu.setupMenu(app);
      createMainWindow(url, appName);
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    });

  }
}

init();

