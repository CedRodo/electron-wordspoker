class AIPlayers extends Players {
    type = "cpu";

    betDecision(cashToPut, previousBetAmount) {
        console.log("betDecision from", this.name, "\ncashToPut:", cashToPut, "\ncashPut:", this.cashPut, "\npreviousBetAmount:", previousBetAmount, "\ncash:", this.cash);
        
        let playerChoices = ["fold", "fold", "fold", "call", "call", "call", "raise"];
        // let playerChoices = ["fold", "call"];
        let playerChoiceNumber;
        // if (this.cashPut === cashToPut) {
        //     playerChoiceNumber = Math.floor(Math.random() * (playerChoices.length - 1)) + 1;
        // } else {
        //     playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
        // }
        playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
        if (this.cashPut === cashToPut) {
            console.log("this.cashPut === cashToPut");            
            while (playerChoices[playerChoiceNumber] === "fold") {
                playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
            }
        }
        // if (cashToPut - this.cashPut > this.cash) {
        //     while (playerChoices[playerChoiceNumber] === "fold") {
        //         playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
        //     }
        // }
        if (cashToPut - this.cashPut > this.cash + previousBetAmount) {
            console.log("cashToPut - this.cashPut > this.cash + previousBetAmount");            
            while (playerChoices[playerChoiceNumber] === "raise") {
                playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
            }
        }
        // console.log("playerChoiceNumber:", playerChoiceNumber);
        return playerChoices[playerChoiceNumber];
    }

    wordDecision() {
        if (this.possibleWordsToPlay.length === 0) return;
        this.wordCards = this.possibleWordsToPlay[0].cards;
        this.wordToPlay.word = this.possibleWordsToPlay[0].word;
        this.wordToPlay.value = this.possibleWordsToPlay[0].value;
    }
}