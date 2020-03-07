const electron = require('electron')
const moment = require('moment')
const filesize = require('filesize')
const { ipcRenderer } = electron
const fs = electron.remote.require('fs')

// element vars
const $form = document.querySelector('form')
const $fileInput = document.querySelector('.file_input')
const $durationDisplay = document.querySelector('#dur')
const $thumbnail = document.querySelector('.thumbnail')

// global vars
let file
let fileName
let vidInfo

// functions
// displayInfo

// events
$form.addEventListener('submit', (e) => {       // form event
    e.preventDefault()

    if ($fileInput.files[0]) {
        file = $fileInput.files[0]     // get first file

        const {path, name} = file

        fileName = name.slice(0, name.length - 4)   // remove extension from file name

        ipcRenderer.send('vidSubmit', {path, fileName})     // request video info to backend

        vidInfo = {
            name: fileName,
            path: file.path
        }
    }
})


// renderer events
ipcRenderer.on('vidInfo', (e, info) => {     // get video duration, sent from backend
    vidInfo = {
        ...vidInfo,
        ...info
    }

    duration = moment.duration(vidInfo.duration, 'seconds')._data

    vidInfo.creationTime = moment(vidInfo.creationTime).format('MMMM Do YYYY, h:mm:ss a')
    vidInfo.duration = `${duration.hours}:${duration.minutes}:${duration.seconds}`
    vidInfo.size = filesize(vidInfo.size)
    vidInfo.frameRate = vidInfo.frameRate.split('/')[0]

    console.log(vidInfo)
})

ipcRenderer.on('thumbnailDone', () => {         // ready to display image, sent from backend
    if (fs.existsSync(`./thumbnails/${fileName}.png`)) {
        $thumbnail.src = `./thumbnails/${fileName}.png`
    }
})