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

ipcMain.on('vidSubmit', (e, {path, fileName}) => {
    ffmpeg(path)
    .on('end', () => {
        mainWindow.webContents.send('thumbnailDone')
    })
    .screenshots({
        count: 1,
        folder: './thumbnails',
        filename: `${fileName}.png`
    })
    .ffprobe((err, metadata) => {
        const info = {
            res: {
                width: metadata.streams[0].width,
                height: metadata.streams[0].height
            },
            aspectRatio: metadata.streams[0].display_aspect_ratio,
            frameRate: metadata.streams[0].r_frame_rate,
            creationTime: metadata.format.tags.creation_time,
            format: metadata.format.format_long_name,
            size: metadata.format.size,
            duration: metadata.format.duration
        }

        mainWindow.webContents.send('vidInfo', info)
    })
})