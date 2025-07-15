class EventsListeners {
    gameEnvironment;
    gameMechanics;
    gameStatus;
    betAmountRangeCurrentValueDisplay = document.querySelector(".bet_amount_range_current_value_display");
    yourPlayer;

    constructor(gameEnvironment, gameMechanics, gameStatus) {
        this.gameEnvironment = gameEnvironment;
        this.gameMechanics = gameMechanics;
        this.gameStatus = gameStatus;
        
    }

    create() {
        this.yourPlayer = this.gameEnvironment.players[`player${this.gameStatus.yourTurnNumber}`];
        this.gameEnvironment.yourDeck.addEventListener("pointerup", (event) => {
            // console.log("contains:", this.gameEnvironment.yourDeck.classList.contains("show_cards"));
            if (this.gameEnvironment.yourDeck.classList.contains("show_cards")) {
                if (!event.target.closest(".player_card")) {
                    this.gameEnvironment.yourCards.forEach(card => card.classList.remove("selected"));
                    this.gameEnvironment.yourDeck.classList.remove("show_cards");
                }
            } else {
                this.gameEnvironment.yourDeck.classList.add("show_cards");
            }
        });

        this.gameEnvironment.yourCards.forEach((card) => {
            card.addEventListener("pointerup", () => {
                if (this.gameEnvironment.yourDeck.classList.contains("show_cards")) {
                    if (card.classList.contains("selected")) {
                        this.gameEnvironment.yourCards.forEach(card => card.classList.remove("selected"));
                    } else {
                        this.gameEnvironment.yourCards.forEach(card => card.classList.remove("selected"));
                        card.classList.add("selected");
                    }
                }
            });
        });

        // this.gameEnvironment.showdownCards.forEach((card) => {
        //     card.addEventListener("pointerup", () => {
        //         // console.log("card.dataset.status:", card.dataset.status);
        //         if (card.dataset.status !== "revealed") card.setAttribute("data-status", "revealed");
        //     });
        // });

        // console.log("this.gameEnvironment.playerLettersHolder:", this.gameEnvironment.playerLettersHolder);
        

        this.gameEnvironment.playerLettersHolder.addEventListener("pointerup", (event) => {
            // console.log("event.target:", event.target);
            if (this.gameStatus.disableActions) return;

            if (event.target.classList.contains("holder_letter")) {
                if (event.button === 0) {
                    const fragment = document.createDocumentFragment();
                    // console.log("event.target.parentNode:", event.target.parentNode);
                    if (event.target.parentNode.classList.contains("holder_bottom_rack")) {
                        fragment.appendChild(event.target);
                        document.querySelector(".holder_top_rack").appendChild(fragment);
                    }
                    else {
                        fragment.appendChild(event.target);
                        document.querySelector(".holder_bottom_rack").appendChild(fragment);
                    }
                }
                if (event.button === 2) {
                    document.querySelectorAll(".holder_top_rack .holder_letter").forEach((letter) => {
                        const fragment = document.createDocumentFragment();
                        fragment.appendChild(letter);
                        document.querySelector(".holder_bottom_rack").appendChild(fragment);
                    });
                }

                let word = "";
                const holderLetters = document.querySelector(".holder_top_rack").querySelectorAll(".holder_letter");
                if (holderLetters.length > 0) {
                    this.yourPlayer["wordCards"].length = 0;
                    holderLetters.forEach((letter) => {
                        word += letter.textContent;
                        this.yourPlayer["wordCards"].push({
                            letter: letter.dataset.letter,
                            value: letter.dataset.value,
                            color: letter.dataset.color
                        });
                    });
                }
                // console.log("wordCards:", this.yourPlayer["wordCards"]);
                this.gameEnvironment.playerLettersHolder.dataset.word = word;
                // console.log("word to check:", word);
                let isValid = false;
                isValid = this.gameMechanics.checkWord(word, this.gameMechanics.initData.wordsList);
                if (isValid) {
                    // console.log("this.gameEnvironment.players:", this.gameEnvironment.players);
                    // console.log("this.gameStatus.yourTurnNumber:", this.gameStatus.yourTurnNumber);
                    // console.log("yourPlayer:", this.yourPlayer);
                    this.yourPlayer.wordToPlay.word = word;
                    // this.gameEnvironment.playerLettersHolder.dataset.wordvalue = wordLettersValue.value;
                    this.yourPlayer.wordToPlay.value = this.yourPlayer.getWordTotalValue(word);
                    this.gameEnvironment.playerLettersHolder.dataset.wordvalue = this.yourPlayer.wordToPlay.value;
                } else {
                    this.gameEnvironment.playerLettersHolder.dataset.wordvalue = "0";
                }
                if (this.yourPlayer.wordToPlay.value > this.gameStatus.bestWordValue)
                    this.gameStatus.bestWordValue = this.yourPlayer.wordToPlay.value;
            }

        });

        this.gameEnvironment.playerActions.forEach((action) => {
            action.addEventListener("pointerup", (event) => {
                if (event.currentTarget.disabled || this.gameStatus.disableActions || this.yourPlayer.playStatus === "allin") return;
                console.log("event.currentTarget.dataset.action:", event.currentTarget.dataset.action);
                // this.gameEnvironment.yourDeck.setAttribute("data-playstatus", event.currentTarget.dataset.action);
                // switch (event.currentTarget.dataset.action) {
                //     case "call":
                //         console.log("call");                  
                //         this.gameEnvironment.yourDeck.querySelector(".action_sign").textContent = "►";
                //         this.gameEnvironment.yourDeck.querySelector(".bet_amount").textContent = this.gameStatus.cashToPut;
                //         this.gameEnvironment.yourDeck.setAttribute("data-bet", this.gameStatus.cashToPut);
                //         let callAmount = this.yourPlayer.cash > this.gameStatus.cashToPut - this.yourPlayer.cashPut ? this.gameStatus.cashToPut - this.yourPlayer.cashPut : this.yourPlayer.cash;
                //         this.gameStatus.potAmount += callAmount;
                //         this.yourPlayer.cash -= callAmount;
                //         this.yourPlayer.cashPut += callAmount;
                //         break;
                //     case "raise":
                //         console.log("raise");
                //         console.log("user raise this.gameStatus.cashToPut before:", this.gameStatus.cashToPut);
                //         console.log("this.gameEnvironment.betAmountRange.valueAsNumber:", this.gameEnvironment.betAmountRange.valueAsNumber);
                //         this.gameStatus.cashToPut += this.gameEnvironment.betAmountRange.valueAsNumber;
                //         console.log("user raise this.gameStatus.cashToPut final:", this.gameStatus.cashToPut);
                //         this.gameEnvironment.yourDeck.querySelector(".action_sign").textContent = "▲";
                //         this.gameEnvironment.yourDeck.querySelector(".bet_amount").textContent = this.gameStatus.cashToPut;
                //         this.gameEnvironment.yourDeck.setAttribute("data-bet", this.gameEnvironment.betAmountRange.valueAsNumber);
                //         this.gameStatus.potAmount += this.gameStatus.cashToPut;
                //         this.yourPlayer.cash -= this.gameStatus.cashToPut - this.yourPlayer.cashPut;
                //         this.yourPlayer.cashPut = this.gameStatus.cashToPut;
                //         break;
                //     case "fold":
                //         console.log("fold");    
                //         this.gameEnvironment.yourDeck.querySelector(".action_sign").textContent = "";
                //         this.gameEnvironment.yourDeck.querySelector(".bet_amount").textContent = "";
                //         this.gameStatus.orderedPlayersTurns.splice(this.gameStatus.orderedPlayersTurnsIndex, 1);
                //         this.gameStatus.orderedPlayersTurnsIndex - 1 >= -1 ? this.gameStatus.orderedPlayersTurnsIndex-- : this.gameStatus.orderedPlayersTurnsIndex = -1;
                //         break;
                // }
                // // console.log("this.gameMechanics:", this.gameMechanics);
                // clearInterval(this.gameMechanics.thinkingCountdown);
                // this.gameMechanics.countdownPercent = 100;
                // this.gameEnvironment.yourDeck.style.setProperty("--time", this.gameMechanics.countdownPercent);
                // this.gameEnvironment.yourDeck.querySelector(".cash_amount").textContent = this.yourPlayer.cash;
                // this.yourPlayer.playStatus = event.currentTarget.dataset.action;
                // // this.gameMechanics.turnNumberIndex + 1 < this.gameStatus.orderedPlayersTurns.length ? this.gameMechanics.turnNumberIndex++ : this.gameMechanics.turnNumberIndex = 0;
                // this.yourPlayer.checkIfAllIn();
                // this.gameEnvironment.playerActions.forEach(action => action.disabled = true);
                // this.gameMechanics.updatePotAndBetRange();
                // this.gameMechanics.endingTurn();
                socket.emit('player-action', {
                    playerNumber: this.yourPlayer.number,
                    action: event.currentTarget.dataset.action,
                    raise: this.gameEnvironment.betAmountRange.valueAsNumber
                }, room.roomId);
                this.gameEnvironment.playerActions.forEach(action => action.disabled = true);
            });
        });

        this.gameEnvironment.betAmountRange.addEventListener("input", (event) => {
            // console.log("event.currentTarget value:", event.currentTarget.value);
            if (this.gameStatus.disableActions || this.yourPlayer.playStatus === "allin") return;
            event.currentTarget.dataset.amount = event.currentTarget.value;
        });

        this.gameEnvironment.betAmountPreselections.forEach((button) => {
            button.addEventListener("pointerup", (event) => {
                if (this.gameStatus.disableActions) return;
                console.log("event.currentTarget data-amount:", event.currentTarget.dataset.amount);
                switch (event.currentTarget.dataset.amount) {
                    case "min":
                        this.gameEnvironment.betAmountRange.value = this.gameEnvironment.betAmountRange.min;
                        break;
                    case "half":
                        this.gameEnvironment.betAmountRange.value = this.gameEnvironment.betAmountRange.max / 2;
                        break;
                    case "pot":
                        this.gameEnvironment.betAmountRange.value = this.gameStatus.potAmount;
                        break;
                    case "max":
                        this.gameEnvironment.betAmountRange.value = this.gameEnvironment.betAmountRange.max;
                        break;
                }
                this.gameEnvironment.betAmountRange.dataset.amount = this.gameEnvironment.betAmountRange.value;
            });
        })


        document.addEventListener("keydown", (event) => {
            if (event.code === "PageUp" || event.code === "PageDown") {
                if (event.code === "PageUp") {
                    this.gameEnvironment.gamePreferences.backgroundNumber--;
                    if (this.gameEnvironment.gamePreferences.backgroundNumber < 1)
                        this.gameEnvironment.gamePreferences.backgroundNumber = this.gameEnvironment.bgLastNb;
                }
                if (event.code === "PageDown") {
                    this.gameEnvironment.gamePreferences.backgroundNumber++;
                    if (this.gameEnvironment.gamePreferences.backgroundNumber > this.gameEnvironment.bgLastNb)
                        this.gameEnvironment.gamePreferences.backgroundNumber = 1;
                }
                this.gameEnvironment.roomBackground.style.setProperty("--url", `url(../assets/img/backgrounds/bg${this.gameEnvironment.gamePreferences.backgroundNumber}.jpg)`);
            }            
        });

        window.oncontextmenu = function () { return false; };

        ////////////////////////////////

        socket.on('update-game-status', data => {
            console.log("update-game-status data:", data);            
            let action = data.action;
            let playerNumber = data.playerNumber;
            let raise = data.raise;
            console.log("this.gameEnvironment.getPlayerDeck(playerNumber):", this.gameEnvironment.getPlayerDeck(playerNumber));
            console.log("this.gameEnvironment.players[`player${playerNumber}`]:", this.gameEnvironment.players[`player${playerNumber}`]);
            
            this.gameEnvironment.getPlayerDeck(playerNumber).setAttribute("data-playstatus", action);
            switch (action) {
                case "call":
                    console.log("call");
                    this.gameEnvironment.getPlayerDeck(playerNumber).querySelector(".action_sign").textContent = "►";
                    this.gameEnvironment.getPlayerDeck(playerNumber).querySelector(".bet_amount").textContent = this.gameStatus.cashToPut;
                    this.gameEnvironment.getPlayerDeck(playerNumber).setAttribute("data-bet", this.gameStatus.cashToPut);
                    let callAmount = this.gameEnvironment.players[`player${playerNumber}`]["cash"] > this.gameStatus.cashToPut - this.gameEnvironment.players[`player${playerNumber}`]["cashPut"] ? this.gameStatus.cashToPut - this.gameEnvironment.players[`player${playerNumber}`]["cashPut"] : this.gameEnvironment.players[`player${playerNumber}`]["cash"];
                    this.gameStatus.potAmount += callAmount;
                    this.gameEnvironment.players[`player${playerNumber}`]["cash"] -= callAmount;
                    this.gameEnvironment.players[`player${playerNumber}`]["cashPut"] += callAmount;
                    break;
                case "raise":
                    console.log("raise");
                    console.log("user raise this.gameStatus.cashToPut before:", this.gameStatus.cashToPut);
                    console.log("this.gameEnvironment.betAmountRange.valueAsNumber:", raise);
                    this.gameStatus.cashToPut += raise;
                    console.log("user raise this.gameStatus.cashToPut final:", this.gameStatus.cashToPut);
                    this.gameEnvironment.getPlayerDeck(playerNumber).querySelector(".action_sign").textContent = "▲";
                    this.gameEnvironment.getPlayerDeck(playerNumber).querySelector(".bet_amount").textContent = this.gameStatus.cashToPut;
                    this.gameEnvironment.getPlayerDeck(playerNumber).setAttribute("data-bet", raise);
                    this.gameStatus.potAmount += this.gameStatus.cashToPut;
                    this.gameEnvironment.players[`player${playerNumber}`]["cash"] -= this.gameStatus.cashToPut - this.gameEnvironment.players[`player${playerNumber}`]["cashPut"];
                    this.gameEnvironment.players[`player${playerNumber}`]["cashPut"] = this.gameStatus.cashToPut;
                    break;
                case "fold":
                    console.log("fold");
                    this.gameEnvironment.getPlayerDeck(playerNumber).querySelector(".action_sign").textContent = "";
                    this.gameEnvironment.getPlayerDeck(playerNumber).querySelector(".bet_amount").textContent = "";
                    this.gameStatus.orderedPlayersTurns.splice(this.gameStatus.orderedPlayersTurnsIndex, 1);
                    this.gameStatus.orderedPlayersTurnsIndex - 1 >= -1 ? this.gameStatus.orderedPlayersTurnsIndex-- : this.gameStatus.orderedPlayersTurnsIndex = -1;
                    break;
            }
            // console.log("this.gameMechanics:", this.gameMechanics);
            // clearInterval(this.gameMechanics.thinkingCountdown);
            console.log("this.gameMechanics.thinkingCountdown:", this.gameMechanics.thinkingCountdown);            
            // cancelAnimationFrame(this.gameMechanics.thinkingCountdown);
            this.gameMechanics.stopCoundown = true;
            this.gameMechanics.countdownPercent = 100;
            this.gameEnvironment.getPlayerDeck(playerNumber).style.setProperty("--time", this.gameMechanics.countdownPercent);
            this.gameEnvironment.getPlayerDeck(playerNumber).querySelector(".cash_amount").textContent = this.gameEnvironment.players[`player${playerNumber}`]["cash"];
            this.gameEnvironment.players[`player${playerNumber}`]["playStatus"] = action;

            this.gameEnvironment.players[`player${playerNumber}`].checkIfAllIn();
            this.gameEnvironment.playerActions.forEach(action => action.disabled = true);
            this.gameMechanics.updatePotAndBetRange();
            this.gameMechanics.endingTurn();
        });


    }
}