const electron = require('electron')
const moment = require('moment')
const filesize = require('filesize')
const { ipcRenderer } = electron
const fs = electron.remote.require('fs')

// element vars
const $form = document.querySelector('.vidForm')
const $fileInput = document.querySelector('.file_input')
const $info = document.querySelector('.info')

const $nameDisplay = document.querySelector('.name')
const $pathDisplay = document.querySelector('.path')
const $sizeDisplay = document.querySelector('.size')
const $durationDisplay = document.querySelector('.duration')
const $formatDisplay = document.querySelector('.format')
const $resolutionDisplay = document.querySelector('.resolution')
const $aspectRatioDisplay = document.querySelector('.aspectRatio')
const $frameRateDisplay = document.querySelector('.frameRate')
const $creationTimeDisplay = document.querySelector('.creationTime')
const $imageDisplay = document.querySelector('.info_img')

const $error = document.querySelector('.error')

// global vars
let file
let fileName
let vidInfo

// functions
const displayInfo = (
    {
        aspectRatio, 
        creationTime,
        duration,
        format,
        frameRate,
        name,
        path,
        res,
        size,
    }) => {
        $info.classList.remove('disabled')  // display info container

        $nameDisplay.textContent = name
        $pathDisplay.textContent = path
        $sizeDisplay.textContent = size
        $durationDisplay.textContent = duration
        $formatDisplay.textContent = format
        $resolutionDisplay.textContent = `${res.width} X ${res.height}`
        $aspectRatioDisplay.textContent = aspectRatio
        $frameRateDisplay.textContent = frameRate
        $creationTimeDisplay.textContent = creationTime
}

const isVideo = () => {     // weather file is vid or not
    const type = $fileInput.files[0].type.split('/')[0]

    if (type === 'video') {
        return true
    }

    return false
}

// events
$form.addEventListener('submit', (e) => {       // form event
    e.preventDefault()

    if ($fileInput.files[0] && isVideo()) {
        file = $fileInput.files[0]     // get first file

        const {path, name} = file

        fileName = name.slice(0, name.length - 4)   // remove extension from file name
        ipcRenderer.send('vidSubmit', {path, fileName})     // request video info to backend

        vidInfo = {
            name: fileName,
            path: file.path
        }

        $error.classList.add('disabled')    // hide error message
    } else {    // if error
        $error.classList.remove('disabled')     // display error message
        $info.classList.add('disabled')         // hide info container
    }
})

// renderer events
ipcRenderer.on('vidInfo', (e, info) => {     // get video duration, sent from backend
    vidInfo = {     // destructure both objects
        ...vidInfo,
        ...info
    }

    // transform data into readable format
    duration = moment.duration(vidInfo.duration, 'seconds')._data

    vidInfo.creationTime = moment(vidInfo.creationTime).format('MMMM Do YYYY, h:mm:ss a')
    vidInfo.duration = `${duration.hours}:${duration.minutes}:${duration.seconds}`
    vidInfo.size = filesize(vidInfo.size)
    vidInfo.frameRate = vidInfo.frameRate.split('/')[0]

    displayInfo(vidInfo)

    if (fs.existsSync(`./thumbnails/${fileName}.png`)) {        // if file exsists, dont wait for screenshot
        $imageDisplay.src = `./thumbnails/${fileName}.png`
    } else {            // if it doesnt exist wait for screenshot
        ipcRenderer.on('thumbnailDone', () => {         // ready to display image, sent from backend
            $imageDisplay.src = `./thumbnails/${fileName}.png`
        })
    }
})
