const electron = require('electron')
const ffmpeg = require('fluent-ffmpeg')

const { app, BrowserWindow, ipcMain } = electron;

let mainWindow

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    })
    mainWindow.loadURL(`file://${__dirname}/index.html`)
})

ipcMain.on('vidSubmit', (e, {path, name}) => {
    ffmpeg(path)
    .on('end', () => {
        mainWindow.webContents.send('thumbnailDone')
    })
    .screenshots({
        count: 1,
        folder: './thumbnails',
        filename: `${name.slice(0, name.length - 4)}.png`
    })
    .ffprobe((err, metadata) => {
        mainWindow.webContents.send('vidDuration', metadata.format.duration)
        console.log(metadata)
    })
})