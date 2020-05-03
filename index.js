const serverURL = 'http://' + document.location.host
const newCharacterRoute = serverURL + '/newcharacter'
const newMapRoute = serverURL + '/newgamemap'

// New characters
function getUrlParams() {
    let inputVal = document.getElementById('name').value
    if (!inputVal || inputVal === '') {
        alert('You need to choose a name for your character!')
        return
    }
    const pos = window.location.href.lastIndexOf('?')
    let obj = {}
    if (pos < 0) {
        obj['body'] = 'light'
        sendJSON(newCharacterRoute, {Name: inputVal, Props: JSON.stringify(obj)})
        return
    }
    let params = window.location.href.substring(pos + 1).split('&')
    params = params.filter((elt) => {
        const splitted = elt.split('=')
        return splitted[0] && splitted[0] !== ''
    })
    .map((elt) => {
        const splitted = elt.split('=')
        obj[splitted[0]] = splitted[1]
    })

    sendJSON(newCharacterRoute, {Name: inputVal, Props: JSON.stringify(obj)})
}

// New gamemaps
function handleMapInputs() {
    let mapName = document.getElementById('mapname').value
    if (!mapName || mapName === '') {
        alert('You need to choose a name for your map!')
        return
    }

    loadFile(mapName)
}

// Send JSON message to the server
async function sendJSON(url, object) {
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(object),
    })
    .then((response) => {
        if (!response.status) {
            alert ('The server encountered an error!')
            return
        }
        if (response.status === 200) {
            alert ('It worked! You can play now.')
            return
        }
        if (response.status === 208) {
            alert ('This name is already taken!')
            return
        }
        alert ('The server encountered an error!')
    })
}

// Load the JSON gamemap file selected by the user, and send it to the server as JSON
function loadFile(mapName) {
    const input = document.getElementById('mapjson')
    if (!input) {
        alert('Um, couldn\'t find the fileinput element.')
        return
    }
    if (!input.files) {
        alert('This browser doesn\'t seem to support the `files` property of file inputs.')
        return
    }
    if (!input.files[0]) {
        alert('Please select a file')
        return
    }

    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = function(e) {
        const arrayBuffer = new Uint8Array(reader.result)
        const strJson = new TextDecoder('utf-8').decode(arrayBuffer)
        sendJSON(newMapRoute, {Name: mapName, Props: strJson})
    }
    reader.readAsArrayBuffer(file)
}