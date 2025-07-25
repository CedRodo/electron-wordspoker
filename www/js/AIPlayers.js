class AIPlayers extends Players {
    type = "cpu";

    async betDecision(betData) {
        console.log("betDecision aIPlayer:", this.name);
        console.log("betDecision betData:", betData);
        // return new Promise(function (resolve, reject) {
        console.log("betDecision from", this.name, "\ncashToPut:", betData.cashToPut, "\ncashPut:", this.cashPut, "\npreviousBetAmount:", betData.previousBetAmount, "\ncash:", this.cash);
        
        let playerChoices = ["fold", "fold", "fold", "call", "call", "call", "raise"];
        // let playerChoices = ["fold", "call"];
        let playerChoiceNumber;
        // if (this.cashPut === cashToPut) {
        //     playerChoiceNumber = Math.floor(Math.random() * (playerChoices.length - 1)) + 1;
        // } else {
        //     playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
        // }
        playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
        if (this.cashPut === betData.cashToPut) {
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
        if (betData.cashToPut - this.cashPut > this.cash + betData.previousBetAmount) {
            console.log("cashToPut - this.cashPut > this.cash + previousBetAmount");            
            while (playerChoices[playerChoiceNumber] === "raise") {
                playerChoiceNumber = Math.floor(Math.random() * playerChoices.length);
            }
        }
        // console.log("playerChoiceNumber:", playerChoiceNumber);
        const AIChoice =  playerChoices[playerChoiceNumber];

        // this.deck.setAttribute("data-playstatus", AIChoice);
        // this.playStatus = AIChoice;
        console.log("AIChoice:", AIChoice);
        let betAmount = 0;
        if (AIChoice === "raise") {
            let startingBetAmount = gameMechanics.gameStatus.cashToPut > gameMechanics.gameStatus.bigBlind ? gameMechanics.gameStatus.cashToPut : gameMechanics.gameStatus.bigBlind;
            betAmount = Math.floor(Math.random() * ((startingBetAmount * 1.2) - startingBetAmount + 1)) + startingBetAmount;
        }
        socket.emit('ai-play-decision', { AIPlayerNumber: this.number, choice: AIChoice, betAmount: betAmount }, room.roomId);
        // });
    }

    async decisionPlay(choice, betAmount) {
        console.log("decisionPlay");
        console.log("decisionPlay this.type:", this.type);
        console.log("decisionPlay this.number:", this.number);
        console.log("decisionPlay this.deck:", this.deck);
        
        this.deck.setAttribute("data-playstatus", choice);
        this.playStatus = choice;
        switch (choice) {
            case "call":
                this.deck.querySelector(".action_sign").textContent = "►";
                this.deck.querySelector(".bet_amount").textContent = gameMechanics.gameStatus.cashToPut;
                this.deck.setAttribute("data-bet", gameMechanics.gameStatus.cashToPut);
                let callAmount = this.cash > gameMechanics.gameStatus.cashToPut - this.cashPut ? gameMechanics.gameStatus.cashToPut - this.cashPut : this.cash;
                gameMechanics.gameStatus.potAmount += callAmount;
                this.cash -= callAmount;
                this.cashPut += callAmount;
                break;
            case "raise":
                console.log("raise gameMechanics.gameStatus.cashToPut before:", gameMechanics.gameStatus.cashToPut);
                if (this.cash < gameMechanics.gameStatus.cashToPut + betAmount) betAmount = this.cash - gameMechanics.gameStatus.cashToPut;
                gameMechanics.gameStatus.cashToPut += betAmount;
                console.log("raise gameMechanics.gameStatus.cashToPut final:", gameMechanics.gameStatus.cashToPut);
                this.deck.querySelector(".action_sign").textContent = "▲";
                this.deck.querySelector(".bet_amount").textContent = gameMechanics.gameStatus.cashToPut;
                this.deck.setAttribute("data-bet", betAmount);
                gameMechanics.gameStatus.potAmount += gameMechanics.gameStatus.cashToPut;
                this.cash -= gameMechanics.gameStatus.cashToPut - this.cashPut;
                this.cashPut = gameMechanics.gameStatus.cashToPut;
                break;
            case "fold":
                this.deck.querySelector(".action_sign").textContent = "";
                this.deck.querySelector(".bet_amount").textContent = "";
                gameMechanics.gameStatus.orderedPlayersTurns.splice(gameMechanics.gameStatus.orderedPlayersTurnsIndex, 1);
                gameMechanics.gameStatus.orderedPlayersTurnsIndex - 1 >= -1 ? gameMechanics.gameStatus.orderedPlayersTurnsIndex-- : gameMechanics.gameStatus.orderedPlayersTurnsIndex = -1;
                break;
        }
        this.deck.querySelector(".cash_amount").textContent = this.cash;
        this.checkIfAllIn();
    }

    wordDecision() {
        if (this.possibleWordsToPlay.length === 0) return;
        // this.wordCards = this.possibleWordsToPlay[0].cards;
        // this.wordToPlay.word = this.possibleWordsToPlay[0].word;
        // this.wordToPlay.value = this.possibleWordsToPlay[0].value;
        // const lastValuedWordIndex = this.possibleWordsToPlay.length - 1;
        // this.wordCards = this.possibleWordsToPlay[lastValuedWordIndex].cards;
        // this.wordToPlay.word = this.possibleWordsToPlay[lastValuedWordIndex].word;
        // this.wordToPlay.value = this.possibleWordsToPlay[lastValuedWordIndex].value;
        const randomValuedWordIndex = Math.floor(Math.random() * this.possibleWordsToPlay.length);
        console.log("randomValuedWordIndex:", randomValuedWordIndex);        
        this.wordCards = this.possibleWordsToPlay[randomValuedWordIndex].cards;
        this.wordToPlay.word = this.possibleWordsToPlay[randomValuedWordIndex].word;
        this.wordToPlay.value = this.possibleWordsToPlay[randomValuedWordIndex].value;
    }

    revealWordSuggested() {
        console.log("revealWordSuggested!");
        if (this.wordCards.length === 0) return;
        const playerWordSuggestedContainer = this.deck.querySelector(".player_word_suggested-container");
        const playerWordSuggestedValue = this.deck.querySelector(".player_word_suggested_value");
        this.wordCards.forEach((card, index) => {
            const letterValueColor = { letter: "", value: 0, color: "" };
            const playerWordSuggestedCard = document.createElement("div");
            playerWordSuggestedCard.classList.add("player_word_suggested_card");
            // playerWordSuggestedCard.textContent = card.letter;
            // playerWordSuggestedCard.setAttribute("data-value", card.value);
            if (card.letter === " ") {
                letterValueColor.color = card.color;
                letterValueColor.letter = this.wordToPlay.word.charAt(index);
                initData.letters.some(el => {
                    if (el.letter === letterValueColor.letter){
                        letterValueColor.value = el.value;
                        return true;
                    }
                });      
            } else {
                for (const prop in letterValueColor) { letterValueColor[prop] = card[prop]; } 
            }
            console.log("letterValueColor:", letterValueColor);                
            playerWordSuggestedCard.textContent = letterValueColor.letter;
            playerWordSuggestedCard.setAttribute("data-value", letterValueColor.value);
            playerWordSuggestedCard.setAttribute("data-color", letterValueColor.color);
            playerWordSuggestedContainer.appendChild(playerWordSuggestedCard);
        });
        playerWordSuggestedValue.textContent = this.wordToPlay.value;
    }
}