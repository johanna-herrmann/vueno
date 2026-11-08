// @ts-nocheck -- compatibility runtime; its cross-script state is being typed at the module boundary.
import { isValidToken } from '../utils/token'

let app: any = null

export function setLegacyApp(instance: any): void {
  app = instance
  ;(window as any).app = instance
}


// ---- migrated from toaster.js ----
/***********************************************

 "toaster.js"

 Created by Michael Cheng on 05/27/2015 14:24
 http://michaelcheng.us/
 michael@michaelcheng.us
 --All Rights Reserved--
 edited for vueno by me:
  * multiple toasters are positioned one above the other instead of stacked positioning
  * big toasts (with fully centered position)
  * variable colors (for dark and light theme)
 original version is here: https://github.com/mlcheng/js-toast

 ***********************************************/

"use strict";

/**
 * The iqwerty namespace
 */
var iqwerty = iqwerty || {};
var positionOffsets = [];

/**
 * my positioning settings
 */
const initialPosition = -5;
const firstPosition = 5;
const positionOffset = 35;


/**
 * Toasts are here
 */
iqwerty.toast = (function() {
    function Toast() {
        /**
         * The duration of the toast, in milliseconds
         * @type {Number}
         */
        var _duration = 3000;
        this.getDuration = function() {
            return _duration;
        };
        this.setDuration = function(time) {
            _duration = time;
            return this;
        };

        /**
         * The toast element
         * @type {Object}
         */
        var _toastStage = null;
        this.getToastStage = function() {
            return _toastStage;
        };
        this.setToastStage = function(toastStage) {
            _toastStage = toastStage;
            return this;
        };

        /**
         * The text inside the toast
         * @type {String}
         */
        var _text = null;
        this.getText = function() {
            return _text;
        };
        this.setText = function(text) {
            _text = text;
            return this;
        };

        /**
         * The text element inside the toast
         * @type {Object}
         */
        var _textStage = null;
        this.getTextStage = function() {
            return _textStage;
        };
        this.setTextStage = function(textStage) {
            _textStage = textStage;
            return this;
        };


        /**
         * Specifies whether or not the style is user defined. If stylize() is called by the user, the toast will not use default styles. Otherwise, default styles will be applied
         * @type {Boolean}
         */
        this.stylized = false;
    }

    /**
     * Specifies whether or not the stylesheet exists in the document head
     * @type {Boolean}
     */
    Toast.prototype.styleExists = false;

    /**
     * Initialize the animations for the toast, including fade/slide in, and fade/slide out. Add the styles to a style element in the head.
     * @return Returns nothing
     */
    Toast.prototype.initializeAnimations = function() {
        // don't do anything if styles/animations already exist inside document
        if(Toast.prototype.styleExists) return;



        var style = document.createElement("style");
        style.classList.add(iqwerty.toast.identifiers.CLASS_STYLESHEET);

        style.innerHTML = "." + iqwerty.toast.identifiers.CLASS_SLIDE_IN +
            "{opacity: 1; bottom: " + firstPosition + "px}" +

            "." + iqwerty.toast.identifiers.CLASS_SLIDE_OUT +
            "{opacity: 0; bottom: " + initialPosition + "px}" +

            "." + iqwerty.toast.identifiers.CLASS_ANIMATED +
            "{transition: opacity " + iqwerty.toast.style.TOAST_ANIMATION_SPEED + "ms, bottom " + iqwerty.toast.style.TOAST_ANIMATION_SPEED + "ms;}";


        // add the styles to the document head
        document.head.appendChild(style);

        // specify in the prototype that the style exists in the document already, to avoid creating styles again next time
        Toast.prototype.styleExists = true;
    };

    /**
     * Generate the toast and set the stages
     * @return {Object} Returns the Toast object
     */
    Toast.prototype.generate = function() {
        var toastStage = document.createElement("div");
        var textStage = document.createElement("span");
        textStage.innerHTML = this.getText();
        toastStage.appendChild(textStage);

        this.setToastStage(toastStage);
        this.setTextStage(textStage);

        // initialize animation styles for the toast
        this.initializeAnimations();

        return this;
    };

    /**
     * Show the toast
     * @return {Object} Returns the Toast object
     */
    Toast.prototype.show = function(large) {
        if(this.getToastStage() == null) {
            this.generate();
        }



        // stylize the toast if it isn't user defined
        if(!this.stylized) {
            this.stylize();
        }

        var body = document.getElementById('toasts');
        var before = body.firstChild;

        // use classes to animate the toast
        this.getToastStage().classList.add(iqwerty.toast.identifiers.CLASS_ANIMATED);
        this.getToastStage().classList.add(iqwerty.toast.identifiers.CLASS_SLIDE_OUT);

        // insert into the dom
        body.insertBefore(this.getToastStage(), before);

        // a hack to "redraw"; without this, the next class will get immediately applied without transitioning
        this.getToastStage().offsetHeight;

        // switch classes; slide the toast up
        this.getToastStage().classList.add(iqwerty.toast.identifiers.CLASS_SLIDE_IN);
        this.getToastStage().classList.remove(iqwerty.toast.identifiers.CLASS_SLIDE_OUT);



        //positioning
        this.getToastStage().style.bottom = large ? '50%' : getPositionOffset() + 'px';
        if(large){
            this.getToastStage().style.fontSize = '4rem';
            this.getToastStage().style.borderRadius = '18px';
            this.getToastStage().style.transform = 'translate(-50%, 50%)';
        }
        this.getToastStage().style.position = 'absolute';

        // hide the toast after the specified timeout
        setTimeout(this.hide.bind(this), this.getDuration());

        return this;
    };

    /**
     * Hide the toast
     * @return {Object} Returns the Toast object
     */
    Toast.prototype.hide = function() {

        var body = document.getElementById('toasts');

        if(this.getToastStage() == null) return;

        removePositionOffset(this.getToastStage());

        this.getToastStage().style.bottom = '';
        this.getToastStage().classList.remove(iqwerty.toast.identifiers.CLASS_SLIDE_IN);
        this.getToastStage().classList.add(iqwerty.toast.identifiers.CLASS_SLIDE_OUT);

        setTimeout(function() {
            body.removeChild(this.getToastStage());
            this.setToastStage(null);
            this.setText(null);
            this.setTextStage(null);
        }.bind(this), iqwerty.toast.style.TOAST_ANIMATION_SPEED);

        return this;
    };

    /**
     * Stylize the toast with defaults, or specify an object that contains the custom style
     * @param  {Object} style A literal object containing the custom style, e.g. toast.stylize({background: "pink", color: "#ff00ff"})
     * @return {Object}       Returns the Toast object
     */
    Toast.prototype.stylize = function(style) {
        if(this.getToastStage() == null) {
            this.generate();
        }

        var toastStage = this.getToastStage();
        toastStage.setAttribute("style", iqwerty.toast.style.defaultStyle);


        // apply custom styles if specified
        if(arguments.length == 1) {
            var s = Object.keys(style);
            s.forEach(function(value, index, array) {
                toastStage.style[value] = style[value];
            });
        }



        this.stylized = true;


        return this;
    };


    return {
        Toast: Toast,


        style: {
            /**
             * The default styles for the toast. Override these in Toast.stylize()
             * @type {String}
             */
            defaultStyle: ""+
            "background: var(--toaster-bgcolor);" +
            "box-shadow: 0 0 10px var(--toaster-shadow-color);" +
            "z-index: 99999;" +
            "border-radius: 3px;" +
            "color: var(--toaster-text-color);" +
            "padding: 5px;" +
            "font-size: 0.9rem;" +
            "word-break: keep-all;" +
            "white-space: nowrap;" +
            "margin: 0 auto;" +
            "text-align: center;" +
            "position: fixed;" +
            "left: 50%;" +
            "transform: translateX(-50%);",

            /**
             * The speed of the toast animation, i.e. how long it takes to fade in/out. Preferably not more than 500
             * @type {Number}
             */
            TOAST_ANIMATION_SPEED: 400
        },

        /**
         * A list of constants that define some identifiers for the Toast
         * @type {Object}
         */
        identifiers: {
            CLASS_STYLESHEET: "iqwerty_toast_stylesheet",
            CLASS_ANIMATED: "iqwerty_toast_animated",
            CLASS_SLIDE_IN: "iqwerty_toast_slide_in",
            CLASS_SLIDE_OUT: "iqwerty_toast_slide_out"
        }
    };
})();

/**
 * positioning
 */

function getPositionOffset(){
    const offset = getMaxPositionOffset() + positionOffset;
    positionOffsets.push(offset);
    return offset;
}

function getMaxPositionOffset(){
    let max = initialPosition;
    for(let i = 0; i < positionOffsets.length; i++){
        if(positionOffsets[i] > max){
            max = positionOffsets[i];
        }
    }
    return max;
}

function removePositionOffset(toastStage){
    const offset = parseInt(toastStage.style.bottom.replace(/^.*?(\d+)px.*$/, '$1'));
    const index = positionOffsets.indexOf(offset);
    positionOffsets.splice(index, 1);
}

// ---- migrated from config.js ----
const config = {
    siteHostname: location.hostname,
    siteProtocol: location.protocol,

    //base url for the backend api
    apiBase: '/api',

    //enable (true) or disable (false) devTools for Vue.js in Browser-DevTools - false is recommended for production
    vueDevToolsEnabled: true,

    //error messages from backend for no such game and no such player (used to handle out dated localStorage Items)
    noSuchGameMessage: 'failure: de.johannaherrmann.vueno.exceptions.IllegalArgumentException: There is no such game.',
    noSuchPlayerMessage: 'failure: de.johannaherrmann.vueno.exceptions.IllegalArgumentException: There is no such player in this game.',
};

const features = {
    //tokenized-game-create: see README.md for feature-description.
    invalidTokenMessage: 'failure: de.johannaherrmann.vueno.exceptions.InvalidTokenException: Invalid Token provided.',
    fileReadErrorMessage: 'failure: de.johannaherrmann.vueno.exceptions.FileReadException: Could not read token file in backend. Please try again later or report this error to me.'
}

// ---- migrated from toast.js ----
function showToast(text){
    let toast = new iqwerty.toast.Toast();
    toast = toast.setText(sanitize(text)).setDuration(3000);
    toast.show(false);
}

function showLargeToast(text){
    let toast = new iqwerty.toast.Toast();
    toast = toast.setText(sanitize(text)).setDuration(3000);
    toast.show(true);
}

function sanitize(text){
    return text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

// ---- migrated from qr/qr.js ----
function genQr(data){
    const typeNumber = 0;
    const errorCorrectionLevel = 'L';
    const qr = (window as any).qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(data);
    qr.make();
    return qr.createDataURL(8, 32, '');
}

function handleQrScanResult(result){
    if(result.indexOf(app.protocol+'://'+app.hostname+'/') >= 0){
        self.location.href = result;
    } else {
        console.log('skipped redirection to qr code target. target is cross-site');
    }
}

function scanQr(){
    document.getElementById('qrScanBtn').click();
}

// ---- migrated from countdown.js ----
let aC = null;
let start;

function animateCountdown(){
    const now = new Date().getTime();
    let diff = now-start;

    if(diff > 3000){
        diff = 3000;
    }

    app.timeLeftPercent = 100 - 100/3000*diff;

    if(app.timeLeftPercent <= 0){
        next();
    }
}

function startCountdownAnimation() {
    start = new Date().getTime();
    aC = setInterval(animateCountdown, 10);
}


function stopCountdownAnimation(){
    if(aC !== null){
        clearInterval(aC);
        aC = null;
    }
    app.timeLeftPercent = 100;
}

// ---- migrated from app.js ----
const gameState = {
    success: true,
    message: 'success',
    game: null,
    players: [],
    cards: [],
    myIndex: -1
};

const data = {
    winner: -1,
    showInvitationQr: false,
    showSwitchOutQr: false,
    showSwitchInQr: false,
    qr: '',
    gameUuid: '',
    playerUuid: '',
    invitation: false,
    currentView: '',
    previousView: '',
    name: '',
    botName: '',
    gameState: gameState,
    timeLeftPercent: 100,
    btnCreateGameDisabled: false,
    btnJoinGameDisabled: false,
    processing: false,
    processingEnd: false,
    enableTokenizedGameCreate: false,
    token: 'empty',
    tokenLockedGameCreate: false,
    hostname: config.siteHostname,
    protocol: config.siteProtocol,
    hasCamera: false,
    pendingRemoveAfterSwitch: false,
    pendingSwitch: false,
    pendingPlayerIndex: -1,
    pushUuid: '',
    dialog: null,
    refreshPageOnDialogClose: false,
    stopPartyRequested: false,
    botifyPlayerPending: false,
    playerToBotify: null,
    message: '',
    readMessages: 0,
    gameLoadedWithPlayer: false,
    darkMode: false,
    actionLock: false,
    putCardIndex: -1,
    drawnCards: 1,
    drawReason: 'regular',
    finished: false,
    playerWasInUnoState: false
};

const methods = {
    createGame: function(){createGame()},
    joinGame: function () {joinGame()},
    leaveGame: function () {leaveGame()},
    addBot: function () {addBot()},
    removeBot: function (player) {removeBot(player)},
    removeBotInGame: function (player){removeBotInGame(player)},
    reset: function (){reset()},
    loadGame: function (){loadGame()},
    loadGameWithoutPlayer: function (){loadGameWithoutPlayer()},
    startGame: function (){startGame()},
    getPlayerName: function(name, index){ return getPlayerName(name, index)},
    copyLink: function(){copyLink()},
    shareLink: function(){shareLink()},
    showInvitationQrCode: function () {showInvitationQrCode()},
    getCardImage: function(card) { return getCardImage(card) },
    put: function(card, index) { put(card, index) },
    putDrawn: function() { putDrawn() },
    draw: function() { draw() },
    keep: function() { keep() },
    selectColor: function(color) { selectColor(color) },
    sayUno: function() { sayUno() },
    isPutAllowed: function(card, index) { return isPutAllowed(card, index) },
    isDrawAllowed: function() { return isDrawAllowed() },
    isSayUnoAllowed: function() { return isSayUnoAllowed() },
    isMyTurn: function() { return isMyTurn() },
    isPlayersTurn: function(index) { return isPlayersTurn(index) },
    isMe: function(index) { return isMe(index) },
    isNotMe: function(index) { return isNotMe(index) },
    isPlayerInRow: function(index, row) { return isPlayerInRow(index, row) },
    scanQr: function() { scanQr() },
    prepareSwitchDevice: function (){ prepareSwitchDevice() },
    abortSwitchDevice: function (){ abortSwitchDevice() },
    prepareSwitchOut: function (){ prepareSwitchOut() },
    abortSwitchOut: function (){ abortSwitchOut() },
    prepareSwitchIn: function (){ prepareSwitchIn() },
    abortSwitchIn: function (){ abortSwitchIn() },
    copySwitchLink: function(){copySwitchLink()},
    confirmLeaveRunningGame: function(){confirmLeaveRunningGame();},
    confirmRequestStopParty: function(){confirmRequestStopParty()},
    revokeRequestStopParty: function(){revokeRequestStopParty()},
    getPlayerClasses: function (player){ return getPlayerClasses(player)},
    confirmRequestBotifyPlayer: function(player){confirmRequestBotifyPlayer(player)},
    showChat: function(){showChat()},
    hideChat: function(){hideChat()},
    sendMessage: function(){sendMessage()},
    getMessageDirection: function(playerPublicUuid){ return getMessageDirection(playerPublicUuid)},
    getSenderName: function(playerPublicUuid){ return getSenderName(playerPublicUuid)},
    getMessageClock: function(time) {return getMessageClock(time)},
    getMessageLines: function (message) {return getMessageLines(message)},
    hideDialog : function(){hideDialog()},
    toggleTheme: function(){toggleTheme()},
    ownCardsBeforeEnter: function(element){ownCardsBeforeEnter(element)},
    ownCardsEnter: function(element, done){ownCardsEnter(element, done)},
    ownCardsLeave: function(element, done){ownCardsLeave(element, done)},
    topCardBeforeEnter: function(element){topCardBeforeEnter(element)},
    topCardEnter: function(element, done){topCardEnter(element, done)},
    cardCountBeforeEnter: function(element){cardCountBeforeEnter(element)},
    cardCountEnter: function(element, done){cardCountEnter(element, done)},
    cardCountLeave: function (element, done){cardCountLeave(element, done)},
    playerInSingleList: function (player){return playerInSingleList(player)}
};

const computed = {
    getPlayersListInOrder: function(){return getPlayersListInOrder()},
    topCardInSingleList: function (){return topCardInSingleList()}
}

const legacyRootOptions = { data: function () { return data; }, methods: methods, computed: computed };

function hasTouch() {
    return 'ontouchstart' in document.documentElement
        || navigator.maxTouchPoints > 0
        || navigator.msMaxTouchPoints > 0;
}

if(!hasTouch()){
    document.querySelector('body').setAttribute('class', 'hover');
    document.querySelector('html').setAttribute('class', 'custom-scrollbars');
}

function showErrorDialog(text){
    app.dialog = {
        classes: 'error',
        confirm: false,
        timedCancel: false,
        secondsLeft: 0,
        confirmCallback: null,
        cancelCallback: null,
        text: text
    }
}

function showInformationDialog(text){
    app.dialog = {
        classes: '',
        confirm: false,
        timedCancel: false,
        secondsLeft: 0,
        confirmCallback: null,
        cancelCallback: null,
        text: text
    }
}

function showConfirmationDialog(text, confirmCallback){
    app.dialog = {
        classes: '',
        confirm: true,
        timedCancel: false,
        secondsLeft: 0,
        confirmCallback: confirmCallback,
        cancelCallback: null,
        text: text
    }
}
let rTCDSL;

function showTimedCancelDialog(text, cancelCallback, time){
    app.dialog = {
        classes: '',
        confirm: false,
        timedCancel: true,
        secondsLeft: time,
        confirmCallback: null,
        cancelCallback: cancelCallback,
        text: text
    }
    rTCDSL = setInterval(reduceTimedConfirmationDialogSecondsLeft, 1000);
}

function reduceTimedConfirmationDialogSecondsLeft(){
    if(--app.dialog.secondsLeft <= 0){
        clearInterval(rTCDSL);
    }
}

function hideDialog(){
    app.dialog = null;
    if(app.refreshPageOnDialogClose){
        self.location.replace('/');
    }
}

function copy(text){
    const textarea = document.createElement('textarea');
    document.querySelector('body').appendChild(textarea);
    textarea.value = text;
    textarea.select();
    textarea.setSelectionRange(0, 500); /*For mobile devices*/
    document.execCommand("copy");
    document.querySelector('body').removeChild(textarea);
}

function sleep(){
    return new Promise(resolve => setTimeout(resolve, 50));
}

// ---- migrated from app-processing.js ----
let countDownToProcessingFalse;
let countDownToProcessingEndFalse;

function startProcessingAnimation(){
    clearTimeout(countDownToProcessingFalse);
    clearTimeout(countDownToProcessingEndFalse);
    app.processingEnd = false;
    app.processing = true;
}

function stopProcessingAnimation(){
    app.processingEnd = true;
    countDownToProcessingFalse = setTimeout(function () {app.processing = false}, 500);
    countDownToProcessingEndFalse = setTimeout(function () {app.processingEnd = false}, 2000);
}

// ---- migrated from app-requests.js ----
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
        rI = setInterval(() => self.location.reload(), 5000);
    }
    if(response.url.indexOf('say-uno') >= 0){
        setTimeout(sayUno, 1000)
    } else {
        stopProcessingAnimation();
    }
    if(response.status === 404 && response.url.includes('/gameState/get/')){
        if(response.data.message !== undefined && response.data.message.includes('There is no such player in this game.')){
            localStorage.removeItem('playerUuid');
            self.location.reload();
        } else {
            reset();
        }
        return;
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

// ---- migrated from app-game.js ----
function setGame(data){
    app.gameUuid = data.gameUuid;
    localStorage.setItem('gameUuid', app.gameUuid);
    self.location.replace('/');
}

function setGameState(data){
    setTimeout(setReadMessages, 200);
    if(app.finished){
        setTimeout(function(){
            app.finished = false;
            app.currentView = 'set_players';
            app.winner = data.game.currentPlayerIndex;
            setGameState(data);
        }, 1200);
        return;
    }
    app.gameState = data;
    app.stopPartyRequested = app.gameState.players[app.gameState.myIndex].stopPartyRequested;
    app.currentView = data.game.gameLifecycle.toLowerCase();
    joinGameRunning = false;
    if(app.gameState.game.turnState === 'FINAL_COUNTDOWN' && app.gameState.game.gameLifecycle === 'RUNNING' && aC === null){
        if(localStorage.getItem('sayUno') !== null && localStorage.getItem('sayUno') === '1'){
            sayUno();
        }
        setTimeout(startCountdownAnimation, 200);
    }
    if(isMyTurn() && app.gameState.game.turnState === 'DRAW_PENALTIES' && app.gameState.players[app.gameState.game.currentPlayerIndex].drawPenalties === 2){
        showToast(app.gameState.ownCards.length > 1 ? 'Du hast zu früh „Uno“ gesagt.' : 'Du hast vergessen „Uno“ zu sagen.');
    }
    app.gameLoadedWithPlayer = true;
}

function setGameStateWithoutPlayer(data){
    app.gameState = data;
    app.currentView = 'join';
}

function loadGame(){
    const path = '/gameState/get/' + app.gameUuid + '/' + app.playerUuid;
    doGetRequest(path, setGameState);
}

function loadGameWithoutPlayer(){
    const path = '/gameState/get/' + app.gameUuid;
    doGetRequest(path, setGameStateWithoutPlayer);
}

function createGame() {
    if(app.tokenLockedGameCreate){
        return;
    }
    app.btnCreateGameDisabled = true;
    doPostRequest('/game/create/'+app.token, {}, setGame);
}

function startGame(){
    app.timeLeftPercent = 100;
    localStorage.setItem('gameUuid', app.gameUuid);
    localStorage.setItem('playerUuid', app.playerUuid);
    doPostRequest('/game/start/' + app.gameUuid, {}, loadGame);
}

function reset(){
    localStorage.removeItem('gameUuid');
    localStorage.removeItem('playerUuid');
    localStorage.removeItem('invitation');
    localStorage.removeItem('sayUno');
    localStorage.removeItem('readMessages');
    if(window.location.pathname === '/' && window.location.search === '' && window.location.hash === ''){
        self.location.reload();
    } else {
        self.location.replace('/');
    }
}

function handleInvitation(){
    if(location.hash.startsWith("#game:")){
        const gameUuid = location.hash.replace(/^#game:/, '');
        localStorage.setItem('gameUuid', gameUuid);
        localStorage.setItem('invitation', '1');
        location.replace('/');
    }
}

function handleTokenLink(){
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if(token === null){
        return false;
    }
    if(isTokenPatternValid(token)){
        localStorage.setItem('token', token);
    }
    self.location.replace('/');
    return true;
}

function setHandleTokenAndEnableView(data){
    setHandleToken(data)
    document.getElementById('vueno').style.display = 'block';
}

function setHandleToken(data){
    stopProcessingAnimation();
    const enabled = data.message === 'on';
    if(!enabled){
        return;
    }
    app.enableTokenizedGameCreate = true;
    const token = localStorage.getItem('token');
    app.tokenValidPattern = isTokenPatternValid(token);
    if(!app.tokenValidPattern){
        localStorage.removeItem('token');
        app.tokenLockedGameCreate = true;
        return;
    }
    app.token = token;
}

function handleToken(){
    doGetRequest('/game/tokenized-game-create-enabled', setHandleTokenAndEnableView)
}

function isTokenPatternValid(token){
    return isValidToken(token);
}

function setRequestStopParty(){
    stopProcessingAnimation();
    if(app.currentView === 'running'){
        app.stopPartyRequested = true;
    }
}

function confirmRequestStopParty(){
    showConfirmationDialog('Bist du sicher, dass das laufende Spiel beendet werden soll? ' +
        'Die anderen müssen diesen Wunsch ebenfalls äußern.', requestStopParty, null);
}

function requestStopParty(){
    app.dialog = null;
    let path = '/player/request-stop-party/' + app.gameUuid + '/' + app.playerUuid;
    doPostRequest(path, {}, setRequestStopParty);
}

function setRevokeRequestStopParty(){
    stopProcessingAnimation();
    app.stopPartyRequested = false;
}

function revokeRequestStopParty(){
    let path = '/player/revoke-request-stop-party/' + app.gameUuid + '/' + app.playerUuid;
    doPostRequest(path, {}, setRevokeRequestStopParty);
}

function getPlayersListInOrder(){
    app.gameState.players.forEach(e => e.index = app.gameState.players.indexOf(e));
    if(app.gameState.game.reversed){
        return app.gameState.players.slice().reverse();
    }
    return app.gameState.players;
}

function topCardInSingleList(){
    const topCard = app.gameState.game.topCard;
    topCard.desiredColor = app.gameState.game.desiredColor !== null ? app.gameState.game.desiredColor.toLowerCase() : '';
    return [topCard];
}

function playerInSingleList(player){
    return [player];
}

function init(){
    const invitation = localStorage.getItem('invitation');
    if(invitation != null && invitation === '1'){
        app.invitation = true;
    }
    const gameUuid = localStorage.getItem('gameUuid');
    if(gameUuid == null){
        app.currentView = 'start';
        handleToken();
        return false;
    }
    getReadMessages();
    app.gameUuid = gameUuid;
    connectPush(gameUuid, null, null);
    const playerUuid = localStorage.getItem('playerUuid');
    if(playerUuid != null){
        app.playerUuid = playerUuid;
        app.loadGame();
    } else {
        app.loadGameWithoutPlayer();
    }
    return true;
}

function startVueno() {
    loadTheme();
    if(handleSwitchDevice()){
        return;
    }
    if(handleTokenLink()){
        return;
    }
    handleInvitation();
    if(init()){
        document.getElementById('vueno').style.display = 'block';
    }
}


document.addEventListener('click', function() {
    if(document.activeElement.toString() !== '[object HTMLInputElement]' && document.activeElement.toString() !== '[object HTMLTextAreaElement]'){
        document.activeElement.blur();
        setTimeout(() => document.activeElement.blur(), 100);
    }
});

function loadTheme(){
    let theme = localStorage.getItem('theme');
    if(theme !== 'dark'){
        theme = 'light';
    } else {
        app.darkMode = true;
    }
    setTheme(theme);
}

function toggleTheme(){
    app.darkMode = !app.darkMode;
    const theme = app.darkMode ? 'dark' : 'light';
    setTheme(theme);
}

function setTheme(theme){
    document.querySelector('html').setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// ---- migrated from app-switch.js ----
const localeStorageEntriesToTransport = ['sayUno', 'readMessages'];

function prepareSwitchDevice(){
    app.previousView = app.currentView;
    app.currentView = 'switch-device';
    app.pendingRemoveAfterSwitch = false;
}

function abortSwitchDevice(){
    app.currentView = app.previousView;
    app.previousView = '';
}

function prepareSwitchOut(){
    const url = getSwitchOutUrl();
    app.qr = genQr(url);
    app.showSwitchOutQr = true;
    app.pendingRemoveAfterSwitch = true;
}

function abortSwitchOut(){
    app.qr = null;
    app.showSwitchOutQr = false;
    app.pendingRemoveAfterSwitch = false;
}

function setPreparedSwitchIn(pushUuid){
    app.qr = genQr(`${app.protocol}://${app.hostname}/?switch=in&pushUuid=${pushUuid}`);
    app.showSwitchInQr = true;
    app.pendingSwitch = true;
    app.pendingRemoveAfterSwitch = true;
}

function prepareSwitchIn(){
    const pushUuid = generateUUID();
    app.pushUuid = pushUuid;
    connectPush(pushUuid, setPreparedSwitchIn, pushUuid);
}

function abortSwitchIn(){
    app.qr = null;
    app.showSwitchInQr = false;
    disconnectPush();
    app.pendingSwitch = false;
    app.pendingRemoveAfterSwitch = false;
}

function handleSwitchDevice(){
    const urlParams = new URLSearchParams(window.location.search);
    const switchParam = urlParams.get('switch');
    if(switchParam != null && switchParam === 'out'){
        return switchOut(urlParams);
    }
    if(switchParam != null && switchParam === 'in'){
        return switchIn(urlParams);
    }
}

function setSwitchFinished(){
    self.location.replace('/');
}

function switchOut(urlParams){
    let gameUuid = localStorage.getItem('gameUuid');
    let playerUuid = localStorage.getItem('playerUuid');
    if((gameUuid != null && gameUuid !== '') || (playerUuid != null && playerUuid !== '')){
        app.refreshPageOnDialogClose = true;
        showErrorDialog('Hier ist bereits ein Spiel. Wechsel kann nicht erfolgen.');
        return false;
    }
    gameUuid = urlParams.get('gameUuid');
    playerUuid = urlParams.get('playerUuid');
    if(gameUuid != null && gameUuid !== '' && playerUuid != null && playerUuid !== ''){
        for(let i = 0; i < localeStorageEntriesToTransport.length; i++) {
            const entry = localeStorageEntriesToTransport[i];
            const value = urlParams.get(entry);
            if(value !== null && value !== ''){
                localStorage.setItem(entry, value);
            }
        }
        localStorage.setItem('gameUuid', gameUuid);
        localStorage.setItem('playerUuid', playerUuid);
        doPostRequest(`/switch/finished/${gameUuid}/${playerUuid}`, {}, setSwitchFinished);
        return true;
    }
}

function setSwitchIn(pushUuid){
    let path = `/switch/in/${pushUuid}/${app.gameUuid}/${app.playerUuid}`;
    for(let i = 0; i < localeStorageEntriesToTransport.length; i++){
        const entry = localeStorageEntriesToTransport[i];
        const value = localStorage.getItem(entry);
        const empty = value === null || value === '';
        const toAdd = empty ? 'empty' : value;
        path += `/${toAdd}`;
    }
    doPostRequest(path, {}, nullCallback);
}

function switchIn(urlParams){
    const pushUuid = urlParams.get('pushUuid');
    const gameUuid = localStorage.getItem('gameUuid');
    const playerUuid = localStorage.getItem('playerUuid');
    app.pendingRemoveAfterSwitch = true;
    app.gameUuid = gameUuid;
    app.playerUuid = playerUuid;
    if(pushUuid !== null && pushUuid !== '' && gameUuid !== null && gameUuid !== '' && playerUuid !== null && playerUuid !== ''){
        connectPush(gameUuid, setSwitchIn, pushUuid);
        return true;
    } else {
        app.refreshPageOnDialogClose = true;
        showErrorDialog('Hier ist kein Spiel. Wechsel kann nicht erfolgen.');
        return false;
    }
}

function removeSwitchedGameFromHere(data){
    const myIndex = data.myIndex;
    const pendingPlayerIndex = app.pendingPlayerIndex;
    if(myIndex === pendingPlayerIndex && app.pendingRemoveAfterSwitch){
        reset();
    }
}

function handlePushSwitchIn(message){
    const values = [];
    const gameUuid = message.body.replace(/switch-in:([^:]+):([^:]+):([^:]+):([^:]+)$/, '$1');
    const playerUuid = message.body.replace(/switch-in:([^:]+):([^:]+):([^:]+):([^:]+)$/, '$2');
    values[0] = message.body.replace(/switch-in:([^:]+):([^:]+):([^:]+):([^:]+)$/, '$3');
    values[1] = message.body.replace(/switch-in:([^:]+):([^:]+):([^:]+):([^:]+)$/, '$4');
    if(app.pendingSwitch){
        localStorage.setItem('gameUuid', gameUuid);
        localStorage.setItem('playerUuid', playerUuid);
        for(let i = 0; i < localeStorageEntriesToTransport.length; i++) {
            const entry = localeStorageEntriesToTransport[i];
            const value = values[i];
            if(value !== null && value !== 'empty'){
                localStorage.setItem(entry, value);
            }
        }
        doPostRequest(`/switch/finished/${gameUuid}/${playerUuid}`, {}, function(){self.location.replace('/')});
    }
}

function handlePushSwitchFinished(message){
    app.pendingPlayerIndex = parseInt(message.body.replace(/switch-finished:/, ''));
    const path = `/gameState/get/${app.gameUuid}/${app.playerUuid}`;
    doGetRequest(path, removeSwitchedGameFromHere);
}

function copySwitchLink(){
    const url = getSwitchOutUrl();
    copy(url);
    app.currentView = app.previousView;
    app.previousView = '';
    showInformationDialog('Link wurde kopiert. Rufe die Adresse nun auf dem Ziel-Gerät im Ziel-Browser auf.');
}

function generateUUID() {
    let d = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
}

function getSwitchOutUrl(){
    let url = `${app.protocol}://${app.hostname}/?switch=out&gameUuid=${app.gameUuid}&playerUuid=${app.playerUuid}`;
    for(let i = 0; i < localeStorageEntriesToTransport.length; i++){
        const entry = localeStorageEntriesToTransport[i];
        const value = localStorage.getItem(entry);
        if(value !== null && value !== ''){
            url += `&${entry}=${value}`;
        }
    }
    return url;
}

// ---- migrated from app-chat.js ----
function showChat(){
    app.previousView = app.currentView;
    app.currentView = 'chat';
    setReadMessages();
    setTimeout(enableChatScrolling, 200);
}

function hideChat(){
    resetInputHeight();
    app.currentView = app.previousView;
    app.previousView = '';
    updateView();
}

function setSendMessage(){
    stopProcessingAnimation();
    app.message = '';
    setTimeout(setInputHeight, 200);
}

function sendMessage(){
    const path = `/game/chat/send-message`;
    const data = {
        content: app.message,
        gameUuid: app.gameUuid,
        playerUuid: app.playerUuid
    }
    doPostRequest(path, data, setSendMessage);
    document.querySelector('#chat-view textarea').focus();
}

function setReadMessages(){
    app.readMessages = app.gameState.game.messages.length;
    localStorage.setItem("readMessages", app.readMessages);
}

function getReadMessages(){
    let readMessages = localStorage.getItem('readMessages');
    if(readMessages === null){
        readMessages = '0';
    }
    app.readMessages = parseInt(readMessages);
    localStorage.setItem("readMessages", app.readMessages);
}

function enableChatScrolling(){
    setTimeout(setInputHeight, 100);
    setTimeout(scrollToChatEnd, 200);
    document.querySelector('#chat-view textarea').addEventListener('click', waitAndScrollToChatEnd);
    document.querySelector('#chat-view textarea').addEventListener('input', waitAndScrollToChatEnd);
    document.querySelector('#chat-view textarea').addEventListener('input', setInputHeight);
}

function waitAndScrollToChatEnd(){
    setTimeout(scrollToChatEnd, 200);
}

function scrollToChatEnd(){
    const element = document.querySelector("html");
    element.scrollTo(0,element.scrollHeight);
}

function getMessageDirection(playerPublicUuid){
    const myPublicUuid = app.gameState.players[app.gameState.myIndex].publicUuid;
    return (playerPublicUuid === myPublicUuid) ? 'out' : 'in';
}

function getSenderName(playerPublicUuid){
    const myPublicUuid = app.gameState.players[app.gameState.myIndex].publicUuid;
    return (playerPublicUuid === myPublicUuid) ? 'Du' : getPlayerNameByPublicUuid(playerPublicUuid);
}

function getPlayerNameByPublicUuid(publicUuid) {
    const players = app.gameState.players;
    for(let i = 0; i < players.length; i++){
        const player = players[i];
        if(player.publicUuid === publicUuid){
            const name = player.name;
            return getPlayerName(name, i);
        }
    }
    return "[Entfernter Spieler]";
}

function getMessageClock(time){
    const date = new Date(time);
    const hours = "0" + date.getHours();
    const minutes = "0" + date.getMinutes();
    return `${hours.substr(-2)}:${minutes.substr(-2)}`;
}

function handlePushActionChatMessage(message){
    const playerPublicUuid = message.body.replace(/chat-message:([^:]+):([^:]+):(.+)$/ms, '$1');
    const time = parseInt(message.body.replace(/chat-message:([^:]+):([^:]+):(.+)$/ms, '$2'));
    const content = message.body.replace(/chat-message:([^:]+):([^:]+):(.+)$/ms, '$3');
    const messageData = {
        playerPublicUuid: playerPublicUuid,
        content: content,
        time: time
    }
    app.gameState.game.messages.push(messageData);
    if(app.gameState.players[app.gameState.myIndex].publicUuid !== playerPublicUuid){
        const name = getPlayerNameByPublicUuid(playerPublicUuid);
        showToast(`${name} schreibt: ${content}`);
    }
    if(app.currentView === 'chat'){
        setReadMessages();
        setTimeout(scrollToChatEnd, 250);
    }
}

function setInputHeight(){
    const textarea = document.querySelector('#chat-view textarea');
    textarea.style.height = 'auto';
    const height = textarea.scrollHeight;
    textarea.style.height = `${height}px`;
    document.querySelector('#chat-view button').style.height = `${height}px`;
    const threshold = textarea.clientWidth > 780 ? 140 : 100;
    textarea.style.overflow = height > threshold ? 'hidden scroll' : 'hidden';
    document.querySelector('#chat-view #chatPlaceholder').style.height = `${height+9}px`;
}

function resetInputHeight(){
    const textarea = document.querySelector('#chat-view textarea');
    textarea.style.height = '';
    textarea.style.overflow = '';
    document.querySelector('#chat-view #chatPlaceholder').style.height = '';
    document.querySelector('#chat-view button').style.height = '';
}

function getMessageLines(message){
    return message.content.split('\n');
}

// ---- migrated from app-player.js ----
let joinGameRunning = false;

function joinGame(){
    app.btnJoinGameDisabled = true;
    joinGameRunning = true;
    const data = {
        bot: false,
        gameUuid: app.gameUuid,
        name: sanitizePlayerName(app.name)
    };
    doPostRequest('/player/add', data, setPlayer);
}

function setPlayer(data){
    app.playerUuid = data.playerUuid;
    localStorage.setItem('playerUuid', app.playerUuid);
    localStorage.removeItem('invitation');
    app.loadGame();
}

function addBot(){
    const data = {
        bot: true,
        gameUuid: app.gameUuid,
        name: sanitizePlayerName(app.botName)
    };
    app.botName = '';
    localStorage.setItem('gameUuid', app.gameUuid);
    localStorage.setItem('playerUuid', app.playerUuid);
    doPostRequest('/player/add', data, loadGame);
}

function removeBot(player){
    let path = '/player/removeBot/' + app.gameUuid + '/' + player.publicUuid;
    localStorage.setItem('gameUuid', app.gameUuid);
    localStorage.setItem('playerUuid', app.playerUuid);
    doDeleteRequest(path, loadGame);
}

function removeBotInGame(player){
    let path = '/player/removeBotInGame/' + app.gameUuid + '/' + player.publicUuid;
    localStorage.setItem('gameUuid', app.gameUuid);
    localStorage.setItem('playerUuid', app.playerUuid);
    doDeleteRequest(path, loadGame);
}

function leaveGame(){
    let path = '/player/remove/' + app.gameUuid + '/' + app.playerUuid;
    doDeleteRequest(path, reset);
}

function getPlayerName(name, index) {
    const indexedPlayerName = 'Spieler ' + (index+1) + '';
    if(name.trim() === '' || new RegExp('^Spieler\\s+\\d+').test(name.trim())){
        return indexedPlayerName;
    }
    return name.trim().replace(/(<.*?>|&.*?;)/g, '');
}

function sanitizePlayerName(name){
    name = name.replace(/[<>'"]/g, '');
    return name.trim();
}

function copyLink(){
    const url = app.protocol+'://' + app.hostname + '/invitation.html#game:' + app.gameUuid;
    copy(url);
    showToast('Erfolgreich kopiert!');
}

function shareLink(){
    let url = app.protocol+'://' + app.hostname + '/invitation.html#game:' + app.gameUuid;
    let title = 'vueno - Einladung zum mitspielen';
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url,
            text: ''
        }).then(() => {
            console.log('sharing successful');
        })
            .catch(console.error);
    } else {
        showToast('Teilen fehlgeschlagen. Kein Smartphone?');
    }
}

function showInvitationQrCode(){
    app.qr = genQr(app.protocol+'://' + app.hostname + '/invitation.html#game:' + app.gameUuid);
    app.showInvitationQr = true;
}

function confirmLeaveRunningGame(){
    showConfirmationDialog('Bist du sicher, dass du während des laufenden Spiels den Spielspaß beenden möchtest? ' +
        'Du wirst dadurch in einen Bot umgewandelt.', leaveRunningGame, null)
}

function leaveRunningGame(){
    app.dialog = null;
    let path = '/player/botify/' + app.gameUuid + '/' + app.playerUuid;
    doPostRequest(path, {}, reset);
}

function confirmRequestBotifyPlayer(player){
    app.playerToBotify = player;
    showConfirmationDialog('Bist du sicher, dass du diesen Spieler entfernen möchtest?', requestBotifyPlayer, null);
}

function requestBotifyPlayer(){
    app.dialog = null;
    let path = '/player/request-botify/' + app.gameUuid + '/' + app.playerToBotify.publicUuid;
    doPostRequest(path, {}, setRequestBotifyPlayer);
}

function setRequestBotifyPlayer(){
    showInformationDialog('Der Spieler wird zum Bot, wenn er dies nicht innerhalb 10 Sekunden abbricht. Danach kannst du den Spieler (Bot) entfernen.');
    app.botifyPlayerPending = true;
}

function cancelBotify(){
    clearInterval(rTCDSL);
    app.dialog = null;
    let path = '/player/cancel-botify/' + app.gameUuid + '/' + app.playerUuid;
    doPostRequest(path, {}, setCancelBotifyPlayer);
}

function setCancelBotifyPlayer(){
    showInformationDialog(`Der Prozess wurde efolgreich abgebrochen.${isMyTurn()? ' Bitte mache nun deinen Spielzug.' : ''}`);
}

function getPlayerClasses(player){
    let classes = `player _${player.publicUuid}`;
    if(player.stopPartyRequested){
        classes = `${classes} stopPartyRequested`;
    }
    if(player.botifyPending){
        classes = `${classes} botifyPending`;
    }
    if(player.bot){
        classes = `${classes} bot`;
    }
    return classes;
}

function isPlayerInRow(index, row){
    const players = app.gameState.players.length;
    const reversed = app.gameState.game.reversed;
    const threshold = reversed && players === 7 ? 3 : 4;
    if(players <= 6){
        return true;
    }
    if(row === 1){
        return index < threshold;
    }
    return index >= threshold;
}

// ---- migrated from app-turn.js ----
let sayUnoRequestRunning = false;
let alreadySaidUno = false;

function getCardImage(card) {
    switch(card.cardType){
        case 'NUMBER':
            return getNumberCardImage(card);
        case 'SKIP':
        case 'REVERSE':
        case 'DRAW_2':
            return getActionCardImage(card);
        case 'JOKER':
        case 'DRAW_4':
            return getJokerCardImage(card);
    }
}

function getNumberCardImage(card){
    const color = card.color.toLowerCase();
    const number = card.value;
    return `${color}${number}`;
}

function getActionCardImage(card){
    const color = card.color.toLowerCase();
    const action = card.cardType.toLowerCase().replace('_', '');
    return `${color}${action}`;
}

function getJokerCardImage(card){
    return  card.cardType.toLowerCase().replace('draw_4', 'jokerdraw4');
}

function put(card, index){
    if(isPutAllowed(card, index)){
        app.actionLock = true;
        app.putCardIndex = index;
        const data = {
            card: card,
            cardIndex: index,
            gameUuid: app.gameUuid,
            playerUuid: app.playerUuid
        };
        localStorage.setItem('gameUuid', app.gameUuid);
        localStorage.setItem('playerUuid', app.playerUuid);
        doPostRequest('/turn/put', data, putCallback);
    }
}

function putDrawn(){
    const index = app.gameState.ownCards.length - 1;
    const card = app.gameState.ownCards[index];
    put(card, index);
}

function draw(){
    if(isDrawAllowed()){
        app.actionLock = true;
        const path = prepareAction(app.gameState.game.turnState.startsWith('DRAW_') ? 'draw-multiple' : 'draw');
        doPostRequest(path, {}, drawCallback);
    }
}

function keep(){
    const path = prepareAction('keep');
    doPostRequest(path, {}, loadGame);
}

function selectColor(color){
    const path = '/turn/select-color/' + app.gameUuid + '/' + app.playerUuid + '/' + color;
    doPostRequest(path, {}, loadGame);
}

function sayUno(){
    sayUnoRequestRunning = true;
    alreadySaidUno = true;
    localStorage.setItem('sayUno', '1');
    const path = prepareAction('say-uno');
    doPostRequest(path, {}, loadGame);
}

function next() {
    if(!isMyTurn()){
        return;
    }
    if(!sayUnoRequestRunning){
        app.gameState.game.currentPlayerIndex = -1;
        app.gameState.game.turnState = '';
        const path = '/turn/next/' + app.gameUuid + '/' + app.playerUuid;
        doPostRequest(path, {}, nullCallback);
    } else {
        setTimeout(next, 1000);
    }
}

function isPutAllowed(card, index){
    if(app.actionLock){
        return false;
    }
    if(!isMyTurn()){
        return false;
    }
    if(!isPlayable(card)){
        return false;
    }
    if(app.gameState.game.turnState === 'PUT_DRAWN'){
        return index === (app.gameState.ownCards.length-1);
    }
    return app.gameState.game.turnState === 'PUT_OR_DRAW' || app.gameState.game.turnState === 'DRAW_DUTIES_OR_CUMULATIVE';
}

function isDrawAllowed() {
    if(app.actionLock){
        return false;
    }
    if(!isMyTurn()){
        return false;
    }
    if(app.gameState.game.turnState === 'PUT_DRAWN'){
        return false;
    }
    if(app.gameState.game.turnState === 'SELECT_COLOR'){
        return false;
    }
    return app.gameState.game.turnState !== 'FINAL_COUNTDOWN';
}

function isSayUnoAllowed() {
    if(!isMyTurn() || alreadySaidUno){
        return false;
    }
    return app.gameState.game.turnState === 'SELECT_COLOR' || app.gameState.game.turnState === 'FINAL_COUNTDOWN';
}

function isMyTurn(){
    return isPlayersTurn(app.gameState.myIndex);
}

function isMe(index){
    return index === app.gameState.myIndex && app.gameState.myIndex >= 0;
}

function isNotMe(index){
    return index !== app.gameState.myIndex && app.gameState.myIndex >= 0;
}

function isPlayersTurn(index){
    return app.gameState.game.currentPlayerIndex === index && app.gameState.myIndex >= 0;
}

function prepareAction(action){
    localStorage.setItem('gameUuid', app.gameUuid);
    localStorage.setItem('playerUuid', app.playerUuid);
    return '/turn/' + action + '/' + app.gameUuid + '/' + app.playerUuid;
}

function drawCallback(){
    modificationTransitionWrapper(loadGame, null);
    setTimeout(function(){app.actionLock = false}, 1000);
}

function putCallback(data){
    modificationTransitionWrapper(loadGame, data.card);
    setTimeout(function(){app.actionLock = false}, 1000);
}

function isPlayable(card){
    if(app.gameState.game.turnState === 'DRAW_DUTIES_OR_CUMULATIVE' && !isCumulative(app.gameState.game.topCard, card)){
        return false;
    }
    return isMatch(app.gameState.game.topCard, card);
}

function isCumulative(topCard, card){
    return topCard.drawValue === card.drawValue;
}

function isMatch(topCard, card){
    if(card.jokerCard){
        return true;
    }
    switch(topCard.cardType){
        case 'NUMBER':
            return card.value === topCard.value || card.color === topCard.color;
        case 'SKIP':
        case 'REVERSE':
        case 'DRAW_2':
            return card.cardType === topCard.cardType || card.color === topCard.color;
        case 'JOKER':
        case 'DRAW_4':
            return card.color === app.gameState.game.desiredColor;
    }
    return false;
}

function nullCallback(data){
    data = null;
}

// ---- migrated from app-transitions.js ----
function ownCardsBeforeEnter(element){
    document.querySelector('#own-cards-container').appendChild(element);
    const elementRectangle = element.children[0].getBoundingClientRect();
    const drawPileRectangle = document.querySelector('#drawPile').getBoundingClientRect();
    const leftDifference = drawPileRectangle.left - elementRectangle.left;
    const topDifference = drawPileRectangle.top - elementRectangle.top;
    document.querySelector('#own-cards-container').removeChild(element);
    element.style.width='';
    element.children[0].style.cssText = `transform:translate(${leftDifference}px,${topDifference}px) rotateY(180deg);`;
}

function ownCardsEnter(element, done){
    setTimeout(function (){doOwnCardsEnter(element, done)}, 50);
}

function doOwnCardsEnter(element, done){
    element.children[0].style.cssText = `transform: translate(0,0) rotateY(0deg)`;
    setTimeout(function (){
        done();
        resetCardStyle(element.children[0]);
    }, 500);
}

function ownCardsLeave(element, done){
    const elementRectangle = element.children[0].getBoundingClientRect();
    const topCardRectangle = document.querySelector('#topCard').getBoundingClientRect();
    const leftDifference = topCardRectangle.left - elementRectangle.left;
    const topDifference = topCardRectangle.top - elementRectangle.top;
    element.children[0].style.cssText = `transform: translate(${leftDifference}px,${topDifference}px);`;
    element.children[0].children[0].style.cssText = 'filter:brightness(var(--primary-brightness-filter));';
    element.style.cssText = 'width:0.1px;margin:0;';
    setTimeout(done, 500);
}

function topCardBeforeEnter(element){
    if(isMyTurn()){
        element.style.display = 'none';
        return;
    }
    const player = app.gameState.players[app.gameState.game.currentPlayerIndex];
    const uuid = player.publicUuid;
    const playersPile = document.querySelector(`#players .player._${uuid} .cards`);
    document.querySelector('#topCard').appendChild(element);
    const elementRectangle = element.getBoundingClientRect();
    const playersPileRectangle = playersPile.getBoundingClientRect();
    const leftDifference = playersPileRectangle.left - elementRectangle.left;
    const topDifference = playersPileRectangle.top - elementRectangle.top;
    element.style.cssText = `transform:translate(${leftDifference}px,${topDifference}px) rotateY(180deg);`;
    document.querySelector('#topCard').removeChild(element);
    const wrapper = document.querySelector(`#players .player._${uuid} .cards .floating-wrapper-cards`);
    const clone = wrapper.cloneNode(true);
    enableFloating(wrapper, clone, false);
}

function topCardEnter(element, done){
    removeBack();
    if(!isMyTurn()){
        setTimeout(function (){doTopCardEnter(element, done)}, 50);
        return;
    }
    setTimeout(function (){
        element.style.display = '';
        done();
    }, 500);
}

function doTopCardEnter(element, done){
    element.style.cssText = `transform: translate(0,0) rotateY(0deg)`;
    setTimeout(function(){
        done();
        const uuid = app.gameState.players[app.gameState.game.currentPlayerIndex].publicUuid;
        const wrapper = document.querySelector(`#players .player._${uuid} .cards .floating-wrapper-cards`);
        const clone = document.querySelector('.floating-wrapper-cards.float');
        disableFloating(wrapper, clone);
    }, 500);
}

function cardCountBeforeEnter(element){
    const uuid = app.gameState.players[app.gameState.game.currentPlayerIndex].publicUuid;
    if(isMyTurn()){
        document.querySelector(`#players .player._${uuid} .cards-count-wrapper`).appendChild(element);
        element.parentElement.querySelectorAll(`.cards`).forEach(e => e.style.position='absolute');
        document.querySelector(`#players .player._${uuid} .cards-count-wrapper`).removeChild(element);
        element.style.cssText = 'position:absolute;z-index:-1';
        return;
    }
    document.querySelector(`#players .player._${uuid} .cards-count-wrapper`).appendChild(element);
    element.parentElement.querySelectorAll(`.cards`).forEach(e => e.style.position='absolute');
    const elementRectangle = element.getBoundingClientRect();
    const drawPileRectangle = document.querySelector(`#drawPile`).getBoundingClientRect();
    let leftDifference = drawPileRectangle.left - elementRectangle.left;
    let topDifference = drawPileRectangle.top - elementRectangle.top;
    element.style.cssText = `position:absolute;transform:translate(${leftDifference}px,${topDifference}px);`;
    const wrapper = element.querySelector('.floating-wrapper-cards');
    const clone = createFloatingClone(wrapper)
    document.querySelector(`#topCard`).style.cssText = 'z-index:-1;';
    document.querySelector(`#drawPile`).style.cssText = 'position:relative;z-index:-1;';
    document.querySelectorAll(`#players .player:not(._${uuid})`).forEach(e => e.style.cssText='position:relative;z-index:-1');
    element.parentElement.children[0].querySelectorAll('.floating-wrapper-cards *').forEach(e => e.style.display='none');
    enableFloating(wrapper, clone, true);
    enableDrawCount(element);
    document.querySelector(`#players .player._${uuid} .cards-count-wrapper`).removeChild(element);
}

function cardCountEnter(element, done){
    if(!isMyTurn()){
        setTimeout(function (){doCardCountEnter(element, done)}, 50);
        return;
    }
    setTimeout(function (){
        setTimeout(function(){
            element.style.cssText = '';
        }, 50);
        done();
    }, 500);
}

function doCardCountEnter(element, done){
    element.style.cssText = 'position:absolute;transform:translate(0,0)';
    setTimeout(function(){
        setTimeout(done, 200);
        element.style.cssText = '';
        document.querySelector(`#topCard`).style.cssText = '';
        document.querySelector(`#drawPile`).style.cssText = '';
        document.querySelectorAll('#players .player').forEach(e => e.style.cssText='');
        const wrapper = element.querySelector('.floating-wrapper-cards');
        const clone = document.querySelector('.floating-wrapper-cards.float');
        disableFloating(wrapper, clone);
        disableDrawCount(element);
    }, 500);
}

function cardCountLeave(element, done){
    setTimeout(done, 500);
}

function resetCardStyle(element){
    element.style.cssText = 'transition: none';
    setTimeout(function(){element.style.cssText=''}, 50);
}

function enableFloating(wrapper, clone, draw){
    clone.querySelector('.count').classList.remove('red');
    if(draw && app.playerWasInUnoState){
        console.debug('setting red again');
        clone.querySelector('.count').classList.add('red');
    }
    app.playerWasInUnoState = false;
    const wrapperRectangle = wrapper.getBoundingClientRect();
    const top = wrapperRectangle.top;
    const left = wrapperRectangle.left;
    const width = wrapperRectangle.right - left;
    const height = wrapperRectangle.bottom - top;
    wrapper.querySelector('button').style.display = 'none';
    clone.style.cssText = `position:fixed;top:${top}px;left:${left}px;width:${width}px;height:${height}px;`;
    clone.classList.add('float');
    document.querySelector('body').appendChild(clone);
}

function disableFloating(wrapper, clone){
    document.querySelector('body').removeChild(clone);
    wrapper.querySelector('button').style.display = '';
}

function fixRemainingFloatingClonesAfterStopParty(){
    document.querySelectorAll('.floating-wrapper-draw.float,.floating-wrapper-cards.float')
        .forEach(e=>document.querySelector('body').removeChild(e));
}

function enableDrawCount(element){
    const drawCount = document.createElement('div');
    drawCount.classList.remove('red');
    drawCount.classList.add('draw', 'count', app.drawReason);
    drawCount.textContent = app.drawnCards > 1 ? ''+app.drawnCards : '';
    element.querySelector('.count').style.visibility = 'hidden';
    if(app.drawnCards > 9){
        drawCount.classList.add('more');
    }
    element.querySelector('.count').parentElement.appendChild(drawCount);
}

function disableDrawCount(element){
    const drawCount = element.querySelector('.draw.count')
    element.querySelector('.count').parentElement.removeChild(drawCount);
    element.querySelector('.count').style.visibility = '';
    app.drawnCards = 1;
    app.drawReason = 'regular';
}

function createFloatingClone(wrapper){
    const clone = wrapper.cloneNode(true);
    const countElement = clone.querySelector('.count');
    let count = parseInt(countElement.textContent) - app.drawnCards;
    countElement.textContent = ''+count;
    if(count > 9){
        countElement.classList.add('more');
    } else {
        countElement.classList.remove('more');
    }
    return clone;
}

function removeBack(){
    const player = app.gameState.players[app.gameState.game.currentPlayerIndex];
    const uuid = player.publicUuid;
    const playersPile = document.querySelector(`#players .player._${uuid} .cards`);
    if(player.cardCount === 0){
        const remove = function(){playersPile.classList.add('none', isMyTurn() ? 'animated' : 'instantly')};
        setTimeout(remove, isMyTurn() ? 0 : 50);
        removeCount(playersPile);
        if(!isMyTurn()){
            removeCount(document.querySelector('.floating-wrapper-cards.float'));
        }
    }
}

function removeCount(element){
    const countElement = element.querySelector('.count');
    countElement.textContent = '';
}

function modificationTransitionWrapper(callback, topCard){
    if(topCard != null){
        doPutCardModification(topCard);
        setTimeout(callback, 400);
        return;
    }
    const currentPlayer = app.gameState.players[app.gameState.game.currentPlayerIndex];
    if(currentPlayer.cardCount === 1 && currentPlayer.unoSaid && !isMyTurn()){
        app.playerWasInUnoState = true;
    }
    callback();
}

function doPutCardModification(topCard){
    app.gameState.game.topCard = topCard;
    app.gameState.players[app.gameState.game.currentPlayerIndex].cardCount -= 1;
    if(isMyTurn() && app.putCardIndex >= 0){
        app.gameState.ownCards.splice(app.putCardIndex, 1);
        app.putCardIndex = -1;
    }
    if(topCard.jokerCard){
        app.gameState.game.desiredColor = null;
    }
}

// ---- migrated from push.js ----
let stompClient = null;
let wasConnected = false;
let cC;

function checkConnected(){
    const connected = stompClient !== null && stompClient.connected !== undefined && stompClient.connected;
    if(connected){
        wasConnected = connected;
    } else {
        if(wasConnected){
            clearInterval(cC);
            self.location.reload();
        }
    }
}

cC = setInterval(checkConnected, 1000);

function connectPush(pushUuid, callback, callBackArgument) {
    if(stompClient != null){
        console.log('refuse to connect push. already connected.');
        return;
    }
    const socket = new (window as any).SockJS('/api/ws');
    stompClient = (window as any).Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/api/push/'+pushUuid, async function (message) {
            await handleMessage(message);
        });
        if(callback != null){
            callback(callBackArgument);
        }
    });
}

function disconnectPush(){
    clearInterval(cC);
    stompClient.disconnect();
    stompClient = null;
}

async function handleMessage(message){
    let waitFor = 0;
    while(joinGameRunning){
        waitFor++;
        await sleep();
    }
    console.log('Wait for joinGame to be finished for ' + waitFor + ' times');
    doPushActions(message);
}

function doPushActions(message){
    const messageType = message.body.replace(/:.*$/ms, '');
    pushActions[messageType](message);
}

const doPushActionStartedGame = function(message){
    const index = parseInt(message.body.replace(/^started-game:(\d)$/, '$1'));
    app.gameState.game.gameLifecycle = 'RUNNING';
    app.gameState.game.currentPlayerIndex = index;
    app.timeLeftPercent = 100;
    app.winner = -1;
    showTurnToast(app.gameState.game.currentPlayerIndex);
    showToast('Es geht los');
    updateView();
};

const doPushActionAddedPlayer = function(message){
    app.winner = -1;
    if(message.body.startsWith('added-player')){
        const index = parseInt(message.body.replace(/^added-player:(\d).*$/, '$1'));
        if(isNotMe(index)){
            let name = message.body.replace(/^added-player:\d:(.*)$/, '$1');
            name = getPlayerName(name, index);
            showToast(name + ' macht mit');
        }
    }
    updateView();
};

const  doPushActionRemovedPlayer = function(message){
    app.winner = -1;
    if(message.body.startsWith('removed-player')){
        const index = parseInt(message.body.replace(/removed-player:/, ''));
        if(isNotMe(index)){
            let name = app.gameState.players[index].name;
            name = getPlayerName(name, index).replace(/^Spieler\s+(\d+)$/, 'Der ehemalige Spieler $1');
            showToast(name + ' ist gegangen oder wurde entfernt');
        }
        if(isNotMe(index)){
            app.gameState.players.splice(index, 1);
        } else {
            reset();
        }
    }
};

const doPushActionBotifiedPlayer = function(message){
    const index = parseInt(message.body.replace(/^botified-player:(.*?)$/, '$1'));
    app.botifyPlayerPending = false;
    if(isMe(index)){
        reset();
    } else {
        let name = app.gameState.players[index].name;
        name = name !== '' ? name : `Spieler ${index+1}`;
        app.gameState.players[index].bot = true;
        app.gameState.players[index].botifyPending = false;
        showInformationDialog(`${name} hat das Spiel verlassen und wurde zu einem Bot.`);
    }
};

const doPushActionPutCard = function(message){
    const topCardJson = message.body.replace(/^put-card:(\{.*}).*$/, '$1');
    const topCard = JSON.parse(topCardJson);
    if(app.gameState.game.gameLifecycle === 'RUNNING') {
        const cardCount = app.gameState.players[app.gameState.game.currentPlayerIndex].cardCount - 1;
        if(!topCard.jokerCard && cardCount > 0){
            startCountdown();
        }
    }
    if(app.currentView === 'running' && !isMyTurn()){
        modificationTransitionWrapper(updateView, topCard);
    }
};

const doPushActionDrawnCard = function(message){
    app.drawnCards = 1;
    if(app.currentView === 'running') {
        if(message.body.endsWith(':countdown')){
            startCountdown();
        }
        if(!isMyTurn()){
            modificationTransitionWrapper(updateView, null);
        }
    }
};

const doPushActionDrawnCards = function(message){
    app.drawnCards = parseInt(message.body.replace(/^drawn-cards:([^:]*?):([^:]*?)$/, '$1'));
    app.drawReason = message.body.replace(/^drawn-cards:([^:]*?):([^:]*?)$/, '$2');
    if(app.currentView === 'running') {
        if(!isMyTurn()){
            modificationTransitionWrapper(updateView, null);
        }
    }
};

const doPushActionKeptCard = function(){
    if(app.currentView === 'running') {
        startCountdown();
    }
};

const doPushActionSelectedColor = function(message){
    if(app.currentView === 'running') {
        if(!isMyTurn()){
            app.gameState.game.desiredColor = message.body.replace(/selected-color:/, '');
        }
        startCountdown();
    }
};

const doPushActionSaidUno = function(message){
    const cardCount = parseInt(message.body.replace(/^said-uno:(.*?)$/, '$1'));
    console.log('cardCount: ' + cardCount);
    console.log('message: ' + message.body);
    if(app.currentView === 'running' || app.previousView === 'running'){
        const index = app.gameState.game.currentPlayerIndex;
        if(cardCount === 1){
            showLargeToast('Uno');
        } else {
            showToast('Uno (Lüge)');
        }
        app.gameState.players[index].unoSaid = true;
    }
};

const doPushActionNextTurn = function(message){
    if(app.currentView === 'running' || app.previousView === 'running'){
        app.gameState.game.turnState = '';
        alreadySaidUno = false;
        stopCountdownAnimation();
        const index = parseInt(message.body.replace(/next-turn:/, ''));
        app.gameState.game.currentPlayerIndex = index;
        showTurnToast(index);
    }
    updateView();
};

const  doPushActionFinishedGame = function(message) {
    clearTimeout(aC);
    aC = null;
    const party = parseInt(message.body.replace(/finished-game:/, ''));
    if((app.currentView === 'running' || app.currentView === 'set_players' ) && party === app.gameState.game.party){
        app.finished = true;
        fixRemainingFloatingClonesAfterStopParty();
        updateView();
    }
    app.stopPartyRequested = false;

};

const  doPushActionEnd = function() {
    showToast('Spiel beendet. Danke für\'s Spielen');
    reset();
};

const  doPushActionSwitchIn = function(message) {
    handlePushSwitchIn(message);
};

const  doPushActionSwitchFinished = function(message) {
    handlePushSwitchFinished(message);
};

const doPushActionRequestStopParty = function(message){
    const index = parseInt(message.body.replace(/^request-stop-party:(.*?)$/, '$1'));
    app.gameState.players[index].stopPartyRequested = true;
    let name = app.gameState.players[index].name;
    name = getPlayerName(name, index);
    if(isNotMe(index)){
        showToast(`${name} hat angefragt, diese Runde zu beenden.`);
    }
};

const doPushActionRevokeRequestStopParty = function(message){
    const index = parseInt(message.body.replace(/^revoke-request-stop-party:(.*?)$/, '$1'));
    app.gameState.players[index].stopPartyRequested = false;
    let name = app.gameState.players[index].name;
    name = getPlayerName(name, index);
    if(isNotMe(index)) {
        showToast(`${name} hat die Anfrage zurück genommen, diese Runde zu beenden.`);
    }
};

const doPushActionStopParty = function(message){
    clearTimeout(aC);
    aC = null;
    const party = parseInt(message.body.replace(/stop-party:/, ''));
    if(app.currentView === 'running' && party === app.gameState.game.party){
        app.currentView = 'set-players';
        fixRemainingFloatingClonesAfterStopParty();
        app.previousView = '';
        updateView();
    }
    if(app.previousView === 'running' && party === app.gameState.game.party){
        app.previousView = 'set-players';
    }
    app.stopPartyRequested = false;
};

const doPushActionRequestBotifyPlayer = function (message){
    const uuid = message.body.replace(/request-botify-player:/, '');
    if(app.playerUuid === uuid){
        showTimedCancelDialog(`Jemand möchte dich aus dem Spiel entfernen. 
        Ist das für dich ok? Du hast 10 Sekunden Zeit, diesen Vorgang abzubrechen.`, cancelBotify, 10);
    }
    updateView();
};

const doPushActionCancelBotifyPlayer = function (message){
    const uuid = message.body.replace(/cancel-botify-player:/, '');
    const pendingUuid = app.playerToBotify != null ? app.playerToBotify.publicUuid : '';
    if(pendingUuid === uuid){
        app.botifyPlayerPending = false;
        app.playerToBotify = null;
        showInformationDialog('Der Spieler hat den Prozess abgebrochen.');
    }
    updateView();
};

const doPushActionChatMessage = function (message){
    handlePushActionChatMessage(message);
};

function showTurnToast(index){
    let name = app.gameState.players[index].name;
    name = getPlayerName(name, index);
    if(isMyTurn()){
        showToast('Du bist dran, ' + name);
    } else {
        showToast(name + ' ist dran');
    }
}

function startCountdown(){
    if(app.currentView === 'running' && aC === null){
        app.gameState.game.turnState = 'FINAL_COUNTDOWN';
        startCountdownAnimation();
    }
}

function updateView(){
    if(app.currentView === 'chat' || app.currentView === 'switch-device'){
        stopProcessingAnimation();
        return;
    }
    if(app.playerUuid !== ''){
        loadGame();
    } else {
        loadGameWithoutPlayer();
    }
}

const pushActions = {
    'started-game': doPushActionStartedGame,
    'added-player': doPushActionAddedPlayer,
    'removed-player': doPushActionRemovedPlayer,
    'botified-player': doPushActionBotifiedPlayer,
    'put-card': doPushActionPutCard,
    'drawn-card': doPushActionDrawnCard,
    'drawn-cards': doPushActionDrawnCards,
    'kept-card': doPushActionKeptCard,
    'selected-color': doPushActionSelectedColor,
    'said-uno': doPushActionSaidUno,
    'next-turn': doPushActionNextTurn,
    'finished-game': doPushActionFinishedGame,
    'end': doPushActionEnd,
    'switch-in': doPushActionSwitchIn,
    'switch-finished': doPushActionSwitchFinished,
    'request-stop-party': doPushActionRequestStopParty,
    'revoke-request-stop-party': doPushActionRevokeRequestStopParty,
    'stop-party': doPushActionStopParty,
    'request-botify-player': doPushActionRequestBotifyPlayer,
    'cancel-botify-player': doPushActionCancelBotifyPlayer,
    'chat-message': doPushActionChatMessage
};


export { legacyRootOptions, startVueno, handleQrScanResult }
