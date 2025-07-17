// if (!localStorage.getItem("profiles")) window.location.assign("menu.html");
if (!localStorage.getItem("profiles")) window.location.assign("/menu");
const profiles = JSON.parse(localStorage.getItem("profiles"));
const currentProfile = structuredClone(profiles[`profile${profiles.current}`]);
// if (!currentProfile) window.location.assign("menu.html");
if (!currentProfile) window.location.assign("/menu");
const userPreferences = currentProfile.userPreferences ? currentProfile.userPreferences : null;
const gamePreferences = currentProfile.gamePreferences ? currentProfile.gamePreferences : null;
if (!userPreferences || !gamePreferences) {
    // window.location.assign("menu.html");
    window.location.assign("/menu");
} else {
    socket.emit('new-user', currentProfile);
}
let room;
let roomRef;

initialization();

async function initialization() {
    async function getRoom() {
        return new Promise((resolve, reject) => {
            if (localStorage.getItem("room")) {
                console.log("getItem room");
                roomRef = localStorage.getItem("room");
                console.log("getItem room roomRef:", roomRef);
                socket.emit('get-room', roomRef);
            } else {
                console.log("!getItem room");
            }
            socket.on('game-multi-room', r => {
                console.log("game-multi-room");
                console.log("game-multi-room room:", r);
                if (r.ref) {
                    console.log("it's there!");                    
                    room = r;
                } else {
                    console.log(":(");     
                    reject();
                }
                console.log("game-multi-room other room:", room);
                resolve();
            });
        });
    }

    async function setData() {
        const initData = new InitData(gamePreferences.numberOfPlayers);
        const gameStatus = new GameStatus(gamePreferences);
        const soundsList = [
            "bvglettinggo",
            "bvgmermories",
            "bvgmoonlake",
            "delaydexanybodyyblue",
            "dryhopefocus",
            "engelwoodjacuzzijam",
            "moarandthebadlibscosmicsea",
            "moarandthebadlibslastdance",
            "moodsletitslide",
            "otisubakatakingiteasy",
            "phoniksasimpleanswer",
            "sinitustemporeplenishyoursoul",
            "sleepyfishvelocities",
            "thefieldtapesazulastanforebeeandfrancisharbor",
            "towerzsandscape",
            "wysxsweetmedicinespanishcastle",
            "xanderalittlelonely"
        ];
        const sounds = new Sounds(soundsList, "ingame", userPreferences);
        const gameEnvironment = new GameEnvironment(initData, userPreferences, gamePreferences, gameStatus, sounds);
        const gameMechanics = new GameMechanics(initData, gameEnvironment, gameStatus);
        const eventsListeners = new EventsListeners(gameEnvironment, gameMechanics, gameStatus);

        generateAll();

        async function generateAll() {
            await initData.getData();
            gameEnvironment.setBackground();
            if (room) {
                gameEnvironment.generateVsPlayers();
            } else {
                gameEnvironment.generatePlayers();
            }
            console.log("currentProfile.username:", currentProfile.username);
            console.log("room.hostName:", room.hostName);

            ///////////////// SOCKETS ///////////////////

            /*/ INIT /*/
            
            socket.emit('player-set-ready', { roomId: room.roomId, type: "init" });
            socket.on('init-update-players-status', data => {
                console.log("init-update-players-status:", data);
                socket.emit('players-check-status', data);
            });

            let isAlreadyInitialized = false;

            socket.on('init-players-status', players => {
                console.log("init-players-status players:", players);
                let countNbOfPlyersReady = 0;                
                players.forEach(p => {
                    for (const ref in p) {
                        console.log("p[ref]:", p[ref]);
                        if (p[ref].ready === true) {
                            countNbOfPlyersReady++;
                        }
                    }
                });                
                if (countNbOfPlyersReady === room.gamePreferences.numberOfVsPlayers && !isAlreadyInitialized) {
                    console.log("everyPlayersAreReady");
                    isAlreadyInitialized = true;
                    if (currentProfile.username === room.hostName) gameEnvironment.generateDistribution();
                    gameEnvironment.gameMenuEvents();
                    eventsListeners.create();
                    sounds.generateSounds();
                    setTimeout(() => { gameMechanics.runningTurn(); }, 7500);
                    return;
                }
            });

            /*/ GAME /*/

            socket.on('game-distribution', data => {
                console.log("game-distribution data:", data);
                let showdown = data.showdown;
                let colorsToSet = data.colorsToSet;
                document.querySelectorAll(".holder_letter").forEach(letter => letter.remove());
                document.querySelector(".player_letters_holder").dataset.word = "";
                document.querySelector(".player_letters_holder").dataset.wordvalue = "";

                document.querySelectorAll(".player_card").forEach((card) => {
                    // if (!(card.closest(`.player_deck[data-player="you"]`) && gameStatus.isEliminated)) {
                    const letterDetails = showdown.shift();
                    const color = colorsToSet.shift();
                    // console.log("letterDetails:", letterDetails);
                    card.querySelector(".card_details").setAttribute("data-letter", letterDetails[0]);
                    card.querySelector(".card_details").setAttribute("data-value", letterDetails[1]);
                    card.querySelector(".card_details").setAttribute("data-color", color);
                    card.querySelector(".card_details .card_letter").textContent = letterDetails[0];

                    const playerNumber = card.closest(".player_deck").dataset.playernumber;
                    console.log("game-distribution playerNumber:", playerNumber);
                    if (gameEnvironment.players[`player${playerNumber}`]["cardsList"].length >= 2) gameEnvironment.players[`player${playerNumber}`]["cardsList"].length = 0;
                    gameEnvironment.players[`player${playerNumber}`]["cardsList"].push({ letter: letterDetails[0], value: letterDetails[1], color: color });
                    if (gameEnvironment.players[`player${playerNumber}`]["lettersList"].length >= 2) gameEnvironment.players[`player${playerNumber}`]["lettersList"].length = 0;
                    gameEnvironment.players[`player${playerNumber}`]["lettersList"].push(letterDetails[0]);

                    if (card.closest(`.player_deck[data-player="you"]`)) {
                        const holderLetter = document.createElement("div");
                        holderLetter.classList.add("holder_letter");
                        holderLetter.setAttribute("data-letter", letterDetails[0]);
                        holderLetter.setAttribute("data-value", letterDetails[1]);
                        holderLetter.setAttribute("data-color", color);
                        holderLetter.textContent = letterDetails[0];
                        gameEnvironment.holderBottomRack.appendChild(holderLetter);
                    }
                });

                gameEnvironment.showdownCards.forEach((card) => {
                    card.dataset.status = "concealed";
                    const letterDetails = showdown.shift();
                    const color = colorsToSet.shift();
                    // console.log("letterDetails:", letterDetails);
                    card.querySelector(".card_details").setAttribute("data-letter", letterDetails[0]);
                    card.querySelector(".card_details").setAttribute("data-value", letterDetails[1]);
                    card.querySelector(".card_details").setAttribute("data-color", color);
                    card.querySelector(".card_details .card_letter").textContent = letterDetails[0];
                });
            });

            socket.on('get-player-infos', player => {
                console.log("get-player-infos");
                console.log("get-player-infos player:", player);
                const playerNumber = player.number;
                const props = ["cash", "cashPut", "playStatus", "wordCards", "wordToPlay"];
                for (const prop in player) {
                    if (props.includes(prop)) {
                        gameEnvironment.players[`player${playerNumber}`][prop] = player[prop];
                    }
                }
                console.log("get-player-infos gameEnvironment.players[`player${playerNumber}`]:", gameEnvironment.players[`player${playerNumber}`]);
            });

            socket.on('update-game-status', data => {
                console.log("update-game-status data:", data);
                let action = data.action;
                let playerNumber = data.playerNumber;
                let raise = data.raise;
                console.log("gameEnvironment.getPlayerDeck(playerNumber):", gameEnvironment.getPlayerDeck(playerNumber));
                console.log("gameEnvironment.players[`player${playerNumber}`]:", gameEnvironment.players[`player${playerNumber}`]);

                gameEnvironment.getPlayerDeck(playerNumber).setAttribute("data-playstatus", action);
                switch (action) {
                    case "call":
                        console.log("call");
                        gameEnvironment.getPlayerDeck(playerNumber).querySelector(".action_sign").textContent = "►";
                        gameEnvironment.getPlayerDeck(playerNumber).querySelector(".bet_amount").textContent = gameStatus.cashToPut;
                        gameEnvironment.getPlayerDeck(playerNumber).setAttribute("data-bet", gameStatus.cashToPut);
                        let callAmount = gameEnvironment.players[`player${playerNumber}`]["cash"] > gameStatus.cashToPut - gameEnvironment.players[`player${playerNumber}`]["cashPut"] ? gameStatus.cashToPut - gameEnvironment.players[`player${playerNumber}`]["cashPut"] : gameEnvironment.players[`player${playerNumber}`]["cash"];
                        gameStatus.potAmount += callAmount;
                        gameEnvironment.players[`player${playerNumber}`]["cash"] -= callAmount;
                        gameEnvironment.players[`player${playerNumber}`]["cashPut"] += callAmount;
                        break;
                    case "raise":
                        console.log("raise");
                        console.log("user raise gameStatus.cashToPut before:", gameStatus.cashToPut);
                        console.log("gameEnvironment.betAmountRange.valueAsNumber:", raise);
                        gameStatus.cashToPut += raise;
                        console.log("user raise gameStatus.cashToPut final:", gameStatus.cashToPut);
                        gameEnvironment.getPlayerDeck(playerNumber).querySelector(".action_sign").textContent = "▲";
                        gameEnvironment.getPlayerDeck(playerNumber).querySelector(".bet_amount").textContent = gameStatus.cashToPut;
                        gameEnvironment.getPlayerDeck(playerNumber).setAttribute("data-bet", raise);
                        gameStatus.potAmount += gameStatus.cashToPut;
                        gameEnvironment.players[`player${playerNumber}`]["cash"] -= gameStatus.cashToPut - gameEnvironment.players[`player${playerNumber}`]["cashPut"];
                        gameEnvironment.players[`player${playerNumber}`]["cashPut"] = gameStatus.cashToPut;
                        break;
                    case "fold":
                        console.log("fold");
                        gameEnvironment.getPlayerDeck(playerNumber).querySelector(".action_sign").textContent = "";
                        gameEnvironment.getPlayerDeck(playerNumber).querySelector(".bet_amount").textContent = "";
                        gameStatus.orderedPlayersTurns.splice(gameStatus.orderedPlayersTurnsIndex, 1);
                        gameStatus.orderedPlayersTurnsIndex - 1 >= -1 ? gameStatus.orderedPlayersTurnsIndex-- : gameStatus.orderedPlayersTurnsIndex = -1;
                        break;
                }
                console.log("gameMechanics.thinkingCountdown:", gameMechanics.thinkingCountdown);
                gameMechanics.stopCoundown = true;
                gameMechanics.countdownPercent = 100;
                gameEnvironment.getPlayerDeck(playerNumber).style.setProperty("--time", gameMechanics.countdownPercent);
                gameEnvironment.getPlayerDeck(playerNumber).querySelector(".cash_amount").textContent = gameEnvironment.players[`player${playerNumber}`]["cash"];
                gameEnvironment.players[`player${playerNumber}`]["playStatus"] = action;

                gameEnvironment.players[`player${playerNumber}`].checkIfAllIn();
                gameEnvironment.playerActions.forEach(action => action.disabled = true);
                gameMechanics.updatePotAndBetRange();
                gameMechanics.endingTurn();
            });

            socket.on('player-word-to-play', data => {
                console.log("player-word-to-play data:", data);
                let wordToPlay = data.wordToPlay;
                let playerNumber = data.playerNumber;
                console.log("gameEnvironment.players[`player${playerNumber}`]:", gameEnvironment.players[`player${playerNumber}`]);
                for (const prop in gameEnvironment.players[`player${playerNumber}`]["wordToPlay"]) {
                    gameEnvironment.players[`player${playerNumber}`]["wordToPlay"][prop] = wordToPlay[prop];
                }
                console.log("gameEnvironment.players[`player${playerNumber}`]['wordToPlay']:", gameEnvironment.players[`player${playerNumber}`]["wordToPlay"]);
            });

            socket.on('player-reveal-word-suggested', playerNumber => {
                console.log("player-reveal-word-suggested");
                console.log("player-reveal-word-suggested playerNumber:", playerNumber);
                const player = gameEnvironment.players[`player${playerNumber}`];
                console.log("player-reveal-word-suggested player:", player);
                if (player.wordCards.length === 0) return;
                const playerWordSuggestedContainer = player.deck.querySelector(".player_word_suggested-container");
                const playerWordSuggestedValue = player.deck.querySelector(".player_word_suggested_value");
                player.wordCards.forEach((card) => {
                    console.log("player-reveal-word-suggested player.wordCards:", player.wordCards);
                    const playerWordSuggestedCard = document.createElement("div");
                    playerWordSuggestedCard.classList.add("player_word_suggested_card");
                    playerWordSuggestedCard.textContent = card.letter;
                    playerWordSuggestedCard.setAttribute("data-value", card.value);
                    playerWordSuggestedCard.setAttribute("data-color", card.color);
                    playerWordSuggestedContainer.appendChild(playerWordSuggestedCard);
                });
                playerWordSuggestedValue.textContent = player.wordToPlay.value;
                console.log("player-reveal-word-suggested player.wordToPlay.value:", player.wordToPlay.value);
            });

        }
    }

    await getRoom();
    setData();
}