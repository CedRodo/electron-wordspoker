class GameStatus {
    round = 1;
    playerTurnNumber;
    yourTurnNumber;
    lastPlayerTurnNumber;
    startingCash;
    smallBlind;
    bigBlind;
    bigBlindPlayerNumber;
    cashToPut;
    potAmount;
    previousBetAmount = 0;
    orderedPlayersTurns = [];
    orderedPlayersTurnsIndex = 0;
    showdownStatuses = ["", "flop", "turn", "river"];
    showdownStatusesIndex = 0;
    eliminatedPlayers = [];
    bestWordValue = 0;
    winners = [];
    disableActions = false;
    isEliminated = false;
    constructor(gamePreferences) {
        this.startingCash = gamePreferences.buyIn;
        this.bigBlind = gamePreferences.bigBlind;
        this.smallBlind = gamePreferences.bigBlind / 2;
        this.cashToPut = gamePreferences.bigBlind;
        this.potAmount = gamePreferences.bigBlind + gamePreferences.bigBlind / 2;
    }
}