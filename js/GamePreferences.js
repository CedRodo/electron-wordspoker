class GamePreferences {
    gameMode;
    roomRef;
    roomVisibility;
    numberOfPlayers;
    numberOfVsPlayers;
    buyIn;
    bigBlind;
    backgroundNumber;
    constructor(gameMode, numberOfPlayers, buyIn, bigBlind, backgroundNumber, numberOfVsPlayers, playerId, roomRef, roomVisibility) {
        this.gameMode = gameMode ?? "solo";
        this.numberOfPlayers = numberOfPlayers ?? 8;
        this.buyIn = buyIn ?? 1000;
        this.bigBlind = bigBlind ?? 20;
        this.backgroundNumber = backgroundNumber ?? 1;
        this.numberOfVsPlayers = numberOfVsPlayers ?? 1;
        this.playerId = playerId ?? null;
        this.roomRef = roomRef ?? null;
        this.roomVisibility = roomVisibility ?? "public";
    }

    getRoomPreferences() {
        return {
            numberOfPlayers : this.numberOfPlayers,
            numberOfVsPlayers : this.numberOfVsPlayers,
            buyIn: this.buyIn,
            bigBlind: this.bigBlind,
            backgroundNumber: this.backgroundNumber
        }
    }
}