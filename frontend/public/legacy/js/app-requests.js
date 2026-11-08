const noSuchGameMessage = config.noSuchGameMessage;
const noSuchPlayerMessage = config.noSuchPlayerMessage;
const invalidTokenMessage = features.invalidTokenMessage;
const fileReadErrorMessage = features.fileReadErrorMessage;

let rI;

function handleRequestSuccess(response, callback) {
    if(response.url.indexOf('say-uno') >= 0){
        sayUnoRequestRunning = false;
        localStorage.removeItem('sayUno');
    }
    callback(response.data);
    if(callback === setGameState || callback === setGameStateWithoutPlayer){
        stopProcessingAnimation();
    }
    clearInterval(rI);
}

function handleRequestError(response) {
    if(response.status === 502){
        app.currentView = 'backend-down';
        document.getElementById('vueno').style.display = 'block';
        rI = setInterval('self.location.reload()', 5000);
    }
    if(response.url.indexOf('say-uno') >= 0){
        setTimeout('sayUno()', 1000)
    } else {
        stopProcessingAnimation();
    }
    if(response.data.message !== undefined){
        console.error("Request-Error: " + response.data.message);
        if(response.data.message === noSuchGameMessage){
            reset();
        }
        if(response.data.message === noSuchPlayerMessage){
            localStorage.removeItem('playerUuid');
            self.location.reload();
        }
        if(response.data.message === invalidTokenMessage){
            localStorage.removeItem('token');
            app.btnCreateGameDisabled = false;
            app.tokenLockedGameCreate = true;
            showErrorDialog('Fehler: Ungültiger Token');
        }
        if(response.data.message === fileReadErrorMessage){
            showErrorDialog('Fehler: Token konnte nicht validiert werden, wegen eines Datei-Lesefehlers im Backend. ' +
                'Versuche es später erneut und/oder teile mir diesen Fehler mit.');
        }
    } else {
        console.error("Request-Error: responseObject: " + JSON.stringify(response));
    }
}

function doRequest(method, path, body, callback){
    startProcessingAnimation();
    const options = { method: method, headers: { 'Content-Type': 'application/json' } };
    if(body !== undefined){ options.body = body; }
    fetch(config.apiBase+path, options).then(async function (result) {
        const payload = await result.json().catch(function () { return {}; });
        const response = { url: result.url, status: result.status, data: payload };
        if(result.ok){ handleRequestSuccess(response, callback); }
        else { handleRequestError(response); }
    }).catch(function (error) {
        handleRequestError({ url: config.apiBase+path, status: 0, data: { error: error } });
    });
}

function doGetRequest(path, callback){ doRequest('GET', path, undefined, callback); }
function doPostRequest(path, data, callback){ doRequest('POST', path, JSON.stringify(data), callback); }
function doDeleteRequest(path, callback){ doRequest('DELETE', path, undefined, callback); }
