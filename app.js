const electron = require('electron')
const { ipcRenderer } = electron
const fs = electron.remote.require('fs')

let file = {}

document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()

    file = document.querySelector('input').files[0]

    ipcRenderer.send('vidSubmit', {path: file.path, name: file.name})
})

ipcRenderer.on('vidDuration', (e, dur) => {
    document.querySelector('#dur').textContent = dur
})

ipcRenderer.on('thumbnailDone', () => {
    if (fs.existsSync(`./thumbnails/${file.name.slice(0, file.name.length - 4)}.png`)) {
        document.querySelector('.thumbnail').src = `./thumbnails/${file.name.slice(0, file.name.length - 4)}.png`
    }
})