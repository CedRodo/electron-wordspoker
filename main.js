const { app, BrowserWindow } = require('electron')
const path = require('node:path')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    // win.setBackgroundColor('hsl(230, 100%, 50%)')
    // win.setBackgroundColor('rgb(255, 145, 145)')
    // win.setBackgroundColor('#ff00a3')
    // win.setBackgroundColor('blueviolet')
    // win.setFullScreen(true);
    win.setFullScreen(false);
    // win.setAutoHideMenuBar(true);

    win.loadFile('./www/index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})