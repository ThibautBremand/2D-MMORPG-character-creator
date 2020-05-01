const serverURL = 'http://localhost:8080'
const newCharacterRoute = serverURL + '/newcharacter'

function getUrlParams() {
    let inputVal = document.getElementById('name').value
    if (!inputVal || inputVal === '') {
        alert('You need to choose a name for your character!')
        return
    }
    const pos = window.location.href.lastIndexOf('?')
    if (pos < 0) {
        sendJSON(newCharacterRoute, {Name: inputVal, Tiles: ""})
        return
    }
    let params = window.location.href.substring(pos + 1).split('&')
    let obj = {}
    params = params.filter((elt) => {
        const splitted = elt.split('=')
        return splitted[0] && splitted[0] !== ''
    })
    .map((elt) => {
        const splitted = elt.split('=')
        obj[splitted[0]] = splitted[1]
    })

    sendJSON(newCharacterRoute, {Name: inputVal, Tiles: JSON.stringify(obj)})
}

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
        if (response.status == 200) {
            alert ('It worked! You can play now.')
            return
        }
        if (response.status == 208) {
            alert ('This username is already taken!')
            return
        }
        alert ('The server encountered an error!')
    })
}