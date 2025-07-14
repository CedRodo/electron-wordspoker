if (!localStorage.getItem("profiles")) window.location.assign("menu.html");
const profiles = JSON.parse(localStorage.getItem("profiles"));
const currentProfile = structuredClone(profiles[`profile${profiles.current}`]);
if (!currentProfile) window.location.assign("menu.html");
const userPreferences = currentProfile.userPreferences ? currentProfile.userPreferences : null;
const gamePreferences = currentProfile.gamePreferences ? currentProfile.gamePreferences : null;
if (!userPreferences || !gamePreferences) {
    window.location.assign("menu.html");
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
            gameEnvironment.generateDistribution();
            gameEnvironment.gameMenuEvents();
            eventsListeners.create();
            sounds.generateSounds();
            setTimeout(() => { gameMechanics.runningTurn(); }, 7500);
        }
    }

    await getRoom();
    setData();
}