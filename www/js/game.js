if (!localStorage.getItem("profiles")) window.location.assign("menu.html");
const profiles = JSON.parse(localStorage.getItem("profiles"));
const currentProfile = structuredClone(profiles[`profile${profiles.current}`]);
if (!currentProfile) window.location.assign("menu.html");
const userPreferences = currentProfile.userPreferences ? currentProfile.userPreferences : null;
const gamePreferences = currentProfile.gamePreferences ? currentProfile.gamePreferences : null;
if (!userPreferences || !gamePreferences) window.location.assign("menu.html");
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
    gameEnvironment.generatePlayers();
    gameEnvironment.generateDistribution();
    gameEnvironment.gameMenuEvents();
    eventsListeners.create();
    sounds.generateSounds();
    setTimeout(() => { gameMechanics.runningTurn(); }, 7500);
}