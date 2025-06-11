class GamePreferences {
    gameMode;
    roomType;
    numberOfPlayers;
    buyIn;
    bigBlind;
    backgroundNumber;
    constructor(gameMode, roomType, numberOfPlayers, buyIn, bigBlind, backgroundNumber, numberOfVsPlayers, playerId, roomId) {
        this.gameMode = gameMode ?? "solo";
        this.roomType = roomType ?? "public";
        this.numberOfPlayers = numberOfPlayers ?? 8;
        this.buyIn = buyIn ?? 1000;
        this.bigBlind = bigBlind ?? 20;
        this.backgroundNumber = backgroundNumber ?? 1;
        this.numberOfVsPlayers = numberOfVsPlayers ?? 0;
        this.playerId = playerId ?? null;
        this.roomId = roomId ?? null;
    }
}