class GameMechanics {
    gameEnvironment;
    initData;
    gameStatus;
    countdownPercent;
    thinkingCountdown;
    stopCoundown = false;
    overtime = false;
    timeout;
    constructor(initData, gameEnvironment, gameStatus) {
        this.initData = initData;
        this.gameEnvironment = gameEnvironment;
        this.gameStatus = gameStatus;
    }
    async runningTurn() {
        console.log("runningTurn");        
        // console.log("this.gameEnvironment.betAmountRange.value:", this.gameEnvironment.betAmountRange.value);
        // console.log("runningTurn this.gameStatus.orderedPlayersTurnsIndex:", this.gameStatus.orderedPlayersTurnsIndex);
        console.log("runningTurn this.gameStatus.orderedPlayersTurns:", this.gameStatus.orderedPlayersTurns);
        this.gameStatus.playerTurnNumber = this.gameStatus.orderedPlayersTurns[this.gameStatus.orderedPlayersTurnsIndex];
        this.gameStatus.lastPlayerTurnNumber = this.gameStatus.orderedPlayersTurns.at(-1);
        console.log("runningTurn this.gameStatus.playerTurnNumber:", this.gameStatus.playerTurnNumber);
        const turnPlayer = this.gameEnvironment.players[`player${this.gameStatus.playerTurnNumber}`];
        // console.log("runningTurn this.gameStatus.lastPlayerTurnNumber:", this.gameStatus.lastPlayerTurnNumber);

        // console.log("checkIfAllInFaceOffSituation:", this.checkIfAllInFaceOffSituation());       
        if (turnPlayer["playStatus"] === "allin" || this.checkIfAllInFaceOffSituation()) {
            this.endingTurn();
            return;
        }
        
        const playerDeck = this.gameEnvironment.getPlayerDeck(this.gameStatus.playerTurnNumber);
        console.log("runningTurn playerDeck:", playerDeck);
        this.gameEnvironment.playerActions.forEach((action) => {
            if (this.gameStatus.playerTurnNumber === this.gameStatus.yourTurnNumber) {
                action.disabled = false;
                if (turnPlayer["cashPut"] === this.gameStatus.cashToPut) {
                    if (action.dataset.action === "fold") action.disabled = true;
                }
                if (turnPlayer["playStatus"] === "allin") {
                    action.disabled = true;
                }
            } else {
                action.disabled = true;
            }
        });

        let type = turnPlayer["type"];
        this.stopCoundown = false;
        this.countdownPercent = 0;
        // let timeLimitMax = this.gameStatus.playerTurnNumber === this.gameStatus.yourTurnNumber ? 12000 : 3000;
        // let timeLimitMin = 2000;
        // let timeLimitMax = 200;
        let timeLimitMin = 1000;
        let timeLimitMax = type === "you" || type === "vs" ? 30000 : 15000;
        playerDeck.setAttribute("data-playstatus", "turn");
        playerDeck.style.setProperty("--time", this.countdownPercent);
        playerDeck.style.setProperty("--countdown_color", "#f0f003");

        let thinkingCountdownStart = performance.now();
        let thinkingCountdownEnd = thinkingCountdownStart + timeLimitMax;

        console.log("thinkingCountdownStart:", thinkingCountdownStart);
        
        const thinkingCountdownAnimation = async () => {
            let currentThinkingCountdown = performance.now();
            // console.log("thinkingCountdownAnimation this.countdownPercent:", this.countdownPercent);
            // console.log("currentThinkingCountdown:", currentThinkingCountdown);        
            this.countdownPercent = (((thinkingCountdownEnd - thinkingCountdownStart) - (thinkingCountdownEnd - currentThinkingCountdown)) / (thinkingCountdownEnd - thinkingCountdownStart)) * 100;
            // console.log("this.countdownPercent:", this.countdownPercent);  
            if (this.countdownPercent >= 25 && this.countdownPercent < 50) {
                playerDeck.style.setProperty("--countdown_color", "gold");
            }
            if (this.countdownPercent >= 50 && this.countdownPercent < 75) {
                playerDeck.style.setProperty("--countdown_color", "orange");
            }
            if (this.countdownPercent >= 75 && this.countdownPercent < 100) {
                playerDeck.style.setProperty("--countdown_color", "red");
            }
            if (this.countdownPercent >= 100 || this.stopCoundown) {
                console.log("this.countdownPercent >= 100 || this.stopCoundown");
                console.log("currentThinkingCountdown:", currentThinkingCountdown);
                this.countdownPercent = 100;
                cancelAnimationFrame(this.thinkingCountdown);
                // if ((type === "you" || type === "vs") && !this.stopCoundown) {
                //     console.log("overtime!!!!!!");                    
                //     this.gameEnvironment.playerActions.forEach((action) => action.disabled = true);
                //     if (turnPlayer.cashPut < this.gameStatus.cashToPut) {
                //         turnPlayer.playStatus = "fold";
                //         playerDeck.querySelector(".action_sign").textContent = "";
                //         playerDeck.querySelector(".bet_amount").textContent = "";
                //         this.gameStatus.orderedPlayersTurns.splice(this.gameStatus.orderedPlayersTurnsIndex, 1);
                //         this.gameStatus.orderedPlayersTurnsIndex - 1 >= -1 ? this.gameStatus.orderedPlayersTurnsIndex-- : this.gameStatus.orderedPlayersTurnsIndex = -1;
                //     }
                //     if (turnPlayer.cashPut === this.gameStatus.cashToPut) {
                //         turnPlayer.playStatus = "call";
                //         playerDeck.querySelector(".action_sign").textContent = "►";
                //         playerDeck.querySelector(".bet_amount").textContent = turnPlayer.cashPut;
                //     }
                //     console.log("overtime-play turnPlayer.playStatus:", turnPlayer.playStatus);
                //     playerDeck.setAttribute("data-playstatus", turnPlayer.playStatus);
                //     this.endingTurn();
                // }
                return;
            }
            playerDeck.style.setProperty("--time", this.countdownPercent);
            
            if (this.countdownPercent < 100 && !this.stopCoundown) {
                requestAnimationFrame(thinkingCountdownAnimation);
            } else {
                return;
            }
        }
        
        if (this.countdownPercent <= 100) this.thinkingCountdown = requestAnimationFrame(thinkingCountdownAnimation);

        if ((type === "you" || type === "vs") && !this.stopCoundown) {
            this.timeout = setTimeout(() => {
                console.log("overtime!!!!!!");                    
                let timeoutEndingTime = performance.now();
                console.log("timeoutEndingTime:", timeoutEndingTime);
                let timeoutTime = timeoutEndingTime - thinkingCountdownStart;
                console.log("timeoutTime => thinkingCountdownEnd:", timeoutTime, "/", thinkingCountdownEnd);
                this.countdownPercent = 100;
                cancelAnimationFrame(this.thinkingCountdown);
                clearTimeout(this.timeout);
                this.stopCoundown = true;
                this.gameEnvironment.playerActions.forEach((action) => action.disabled = true);
                if (turnPlayer.cashPut < this.gameStatus.cashToPut) {
                    turnPlayer.playStatus = "fold";
                    playerDeck.querySelector(".action_sign").textContent = "";
                    playerDeck.querySelector(".bet_amount").textContent = "";
                    this.gameStatus.orderedPlayersTurns.splice(this.gameStatus.orderedPlayersTurnsIndex, 1);
                    this.gameStatus.orderedPlayersTurnsIndex - 1 >= -1 ? this.gameStatus.orderedPlayersTurnsIndex-- : this.gameStatus.orderedPlayersTurnsIndex = -1;
                }
                if (turnPlayer.cashPut === this.gameStatus.cashToPut) {
                    turnPlayer.playStatus = "call";
                    playerDeck.querySelector(".action_sign").textContent = "►";
                    playerDeck.querySelector(".bet_amount").textContent = turnPlayer.cashPut;
                }
                console.log("overtime-play turnPlayer.playStatus:", turnPlayer.playStatus);
                playerDeck.setAttribute("data-playstatus", turnPlayer.playStatus);
                this.endingTurn();
            }, timeLimitMax);
        }

        if (type === "cpu") {
            this.AITurn(timeLimitMin, timeLimitMax);
        }

    }
    
    AITurn(timeLimitMin, timeLimitMax) {
        console.log("AITurn");
        if (currentProfile.username === room.hostName) {
            socket.emit('get-ai-thinking-time', { timeLimitMin: timeLimitMin, timeLimitMax: timeLimitMax }, room.roomId);
        }
    }

    waitAIPlay(thinkingTime) {
        console.log("waitAIPlay");
        console.log("waitAIPlay thinkingTime:", thinkingTime);
        const AIPlayer = this.gameEnvironment.players[`player${this.gameStatus.playerTurnNumber}`];
        console.log("waitAIPlay AIPlayer:", AIPlayer);
        setTimeout(async () => {
            console.log("timeout");
            cancelAnimationFrame(this.thinkingCountdown);
            this.stopCoundown = true;
            this.countdownPercent = 100;
            AIPlayer.deck.style.setProperty("--time", this.countdownPercent);
            if (currentProfile.username === room.hostName) {
                const betData = { cashToPut: this.gameStatus.cashToPut, previousBetAmount: this.gameStatus.previousBetAmount }
                await AIPlayer.betDecision(betData);
            }
            console.log("TEST!!!!!!!!!!!");
        }, thinkingTime);
    }

    async endingTurn() {     
        console.log("endingTurn");              
        const yourPlayer = this.gameEnvironment.players[`player${this.gameStatus.yourTurnNumber}`];
        if (this.gameStatus.orderedPlayersTurns.length <= 1 || (this.gameStatus.showdownStatuses[this.gameStatus.showdownStatusesIndex] === "river" && this.roundStatusQuo())) {
            if (this.gameStatus.orderedPlayersTurns.length > 1) {
                document.querySelector(".form_a_word-container").classList.add("show");
                setTimeout(async () => {
                    const formAWordCountdown = document.querySelector(".form_a_word_countdown");
                    let wordToFormCountdownPercent = 0;
                    formAWordCountdown.style.setProperty("--time_ratio", wordToFormCountdownPercent);

                    let wordToFormCountdownStart = performance.now();
                    let wordToFormCountdownEnd = wordToFormCountdownStart + 20000;

                    const wordToFormCountdownAnimation = async () => {
                        let currentWordToFormCountdown = performance.now();
                        // console.log("wordToFormCountdownAnimation wordToFormCountdownPercent:", wordToFormCountdownPercent);
                        // console.log("currentWordToFormCountdown:", currentWordToFormCountdown);
                        wordToFormCountdownPercent = (((wordToFormCountdownEnd - wordToFormCountdownStart) - (wordToFormCountdownEnd - currentWordToFormCountdown)) / (wordToFormCountdownEnd - wordToFormCountdownStart)) * 100;
                        // console.log("wordToFormCountdownPercent:", wordToFormCountdownPercent);
                        if (wordToFormCountdownPercent >= 100) {
                            wordToFormCountdownPercent = 100;
                            formAWordCountdown.style.setProperty("--time_ratio", wordToFormCountdownPercent);
                            this.gameStatus.disableActions = true;
                            await socket.emit('send-my-player-infos', yourPlayer, room.roomId);
                            setTimeout(() => {
                                document.querySelector(".form_a_word-container").classList.remove("show");
                                formAWordCountdown.style.setProperty("--time_ratio", 0);
                            }, 1000);
                            setTimeout(() => { this.showResult(); }, 2000);
                            cancelAnimationFrame(wordToFormCountdown);
                            return;
                        }
                        formAWordCountdown.style.setProperty("--time_ratio", wordToFormCountdownPercent);

                        if (wordToFormCountdownPercent < 100) requestAnimationFrame(wordToFormCountdownAnimation);
                    }

                    let wordToFormCountdown = requestAnimationFrame(wordToFormCountdownAnimation);

                }, 2000);
            } else {
                await socket.emit('send-my-player-infos', yourPlayer, room.roomId);
                this.showResult();
                return;
            }
        } else if (this.roundStatusQuo()) {
            console.log("this.roundStatusQuo");            
            this.gameStatus.orderedPlayersTurnsIndex = 0;
            this.gameStatus.showdownStatusesIndex++;
            setTimeout(() => { this.showdown(); }, 2000);
            return;
        } else {
            console.log("!this.roundStatusQuo");
            // if (turnPlayer["number"] === 4) return;
            this.gameStatus.orderedPlayersTurnsIndex + 1 < this.gameStatus.orderedPlayersTurns.length ? this.gameStatus.orderedPlayersTurnsIndex++ : this.gameStatus.orderedPlayersTurnsIndex = 0;
            setTimeout(() => { this.runningTurn(); }, yourPlayer["playStatus"] !== "allin" ? 2000 : 1000);
        }
    }

    roundStatusQuo() {
        console.log("this.roundStatusQuo");        
        if (this.gameStatus.orderedPlayersTurns.length < 2) return;
        let statusQuo = true;
        const list = this.gameStatus.orderedPlayersTurns;
        list.forEach((number) => {
            const player = this.gameEnvironment.players[`player${number}`];
            this.countdownPercent = 100;
            player.deck.style.setProperty("--time", this.countdownPercent);
            // console.log("player number:", player.number);
            // console.log("player:", player.name);
            // console.log("player playStatus:", player.playStatus);
            // console.log("player cashPut:", player.cashPut);            
            if ((!(player.playStatus === "call" || player.playStatus === "raise" || player.playStatus === "allin") ||
                ((player.playStatus === "call" || player.playStatus === "raise") && player.cashPut < this.gameStatus.cashToPut)) && !this.checkIfAllInFaceOffSituation()) {
            // if (!(player.playStatus === "call" || player.playStatus === "raise") ||
            //     ((player.playStatus === "call" || player.playStatus === "raise") && player.cashPut < this.gameStatus.cashToPut)) {
                statusQuo = false;
                if (player.playStatus === "call" || player.playStatus === "raise") {
                    console.log("this.gameStatus.cashToPut:", this.gameStatus.cashToPut, " --> player cashPut:", player.cashPut);
                    const deck = this.gameEnvironment.getPlayerDeck(number);
                    deck.querySelector(".action_sign").textContent = "▼";
                }
            }
        });
        console.log("statusQuo:", statusQuo); 
        return statusQuo;
    }

    showdown() {
        this.gameStatus.cashToPut = 0;
        this.gameStatus.previousBetAmount = this.gameStatus.cashToPut;
        this.updatePotAndBetRange();
        this.gameStatus.orderedPlayersTurns.forEach((number) => {
            if (this.gameEnvironment.players[`player${number}`]["playStatus"] !== "allin") {
                this.gameEnvironment.players[`player${number}`]["playStatus"] = "wait";
                this.gameEnvironment.players[`player${number}`]["cashPut"] = 0;
                document.querySelector(`.player_deck[data-playernumber="${number}"]`).dataset.playstatus = "wait";
                document.querySelector(`.player_deck[data-playernumber="${number}"] .action_sign`).textContent = "";
                document.querySelector(`.player_deck[data-playernumber="${number}"] .bet_amount`).textContent = "";
            }
            if (this.gameEnvironment.players[`player${number}`]["playStatus"] === "allin") {
                this.gameEnvironment.players[`player${number}`]["cashPut"] = 0;
                document.querySelector(`.player_deck[data-playernumber="${number}"]`).dataset.playstatus = "allin";
                document.querySelector(`.player_deck[data-playernumber="${number}"] .action_sign`).textContent = "";
                document.querySelector(`.player_deck[data-playernumber="${number}"] .bet_amount`).textContent = "";
            }
        });
        let numberOfCards;
        let index;
        switch (this.gameStatus.showdownStatuses[this.gameStatus.showdownStatusesIndex]) {
            case "flop":
                numberOfCards = 3;
                index = 0;
                break;
            case "turn":
                numberOfCards = 1;
                index = 3;
                break;
            case "river":
                numberOfCards = 1;
                index = 4;
        }
        for (let i = 1; i <= numberOfCards; i++) {
            setTimeout(() => { this.revealShowdownCard(index + (i - 1)); }, i * 1000);
        }
    }

    revealShowdownCard(index) {
        // console.log("index:", index);        
        this.gameEnvironment.showdownCards[index].setAttribute("data-status", "revealed");
        const cardDetails = this.gameEnvironment.showdownCards[index].querySelector(".card_details");
        // this.gameEnvironment.showdownCards[index].title = `${cardDetails.dataset.letter.toUpperCase()} : ${cardDetails.dataset.value}`;
        if (!this.gameStatus.isEliminated) {
            const holderLetter = document.createElement("div");
            holderLetter.classList.add("holder_letter");
            holderLetter.setAttribute("data-letter", cardDetails.dataset.letter);
            holderLetter.setAttribute("data-value", cardDetails.dataset.value);
            holderLetter.setAttribute("data-color", cardDetails.dataset.color);
            holderLetter.textContent = cardDetails.dataset.letter;
            holderLetter.title = `${cardDetails.dataset.letter.toUpperCase()} : ${cardDetails.dataset.value}`;
            this.gameEnvironment.holderBottomRack.appendChild(holderLetter);
        }
        this.gameStatus.bestWordValue = 0;
        // console.log("this.lettersList:", this.lettersList);
        // console.log("this.gameEnvironment.players:", this.gameEnvironment.players);                    
        for (const player in this.gameEnvironment.players) {
            if (!(this.gameEnvironment.players[player]["type"] === "you" && this.gameStatus.isEliminated)) {
                this.gameEnvironment.players[player]["cardsList"].push({ letter: cardDetails.dataset.letter, value: parseInt(cardDetails.dataset.value), color: cardDetails.dataset.color });
                this.gameEnvironment.players[player]["lettersList"].push(cardDetails.dataset.letter);
                if (index >= 2 && this.gameEnvironment.players[player]["playStatus"] !== "fold" && this.gameEnvironment.players[player]["playStatus"] !== "eliminated") {
                    this.gameEnvironment.players[player].getPossibleWords(this.initData.wordsList);
                    this.gameEnvironment.players[player].setWordsCards();
                    this.gameEnvironment.players[player].setWordsAndValues();
                    if (this.gameEnvironment.players[player]["type"] === "cpu") this.gameEnvironment.players[player].wordDecision();
                    if (this.gameEnvironment.players[player]["wordToPlay"]["value"] > this.gameStatus.bestWordValue)
                        this.gameStatus.bestWordValue = this.gameEnvironment.players[player]["wordToPlay"]["value"];
                    console.log("this.gameEnvironment.players[player]:", this.gameEnvironment.players[player]);
                    // console.log("player possibleWords:", this.gameEnvironment.players[player]["possibleWords"]);
                }
            }
        }
        if (index >= 2) {
            console.log("end of showdown turn");            
            setTimeout(() => { this.runningTurn(); }, 3000);
        }
    }

    showResult() {
        console.log("showResult");
        let potAmount = this.gameStatus.potAmount;
        let belowCashToPutPlayers = [];
        this.bestWord();
        console.log("this.gameStatus.bestWordValue:", this.gameStatus.bestWordValue);
        for (const player in this.gameEnvironment.players) {
            const p = this.gameEnvironment.players[player];
            if (p.playStatus !== "fold") {
                p.deck.classList.add("result");
                // p.revealWordSuggested();
                if (p.type === "you") socket.emit('player-number', {
                    playerNumber: p.number,
                    eventName: 'player-reveal-word-suggested'
                }, room.roomId);
                if (p.type === "cpu") p.revealWordSuggested();
                console.log("player:", p.name, "/ p.wordToPlay.value:", p.wordToPlay.value);
                if (p.wordToPlay.value === this.gameStatus.bestWordValue || this.gameStatus.orderedPlayersTurns.length === 1) {
                    console.log("win!");                    
                    p.deck.classList.add("winner");
                    if (this.gameStatus.orderedPlayersTurns.length === 1) {
                        console.log("undisputed!!!!");                        
                        p.deck.classList.add("undisputed");
                    }
                    p.deck.animate([
                        { filter: "brightness(150%)", offset: 0.33 },
                        { filter: "brightness(150%)", offset: 0.66 }
                    ], { duration: 750 });
                    this.gameStatus.winners.push(p.number);
                    if (p.cashPut < this.gameStatus.cashToPut)
                        belowCashToPutPlayers.push({ playerNumber: p.number, cashDifferencial: this.gameStatus.cashToPut - p.cashPut });
                } else {
                    console.log("lose!");
                    if (p.playStatus === "allin") {
                        console.log("allin:\ncashPut:", p.cashPut, " / cashToPut:", this.gameStatus.cashToPut);
                        console.log("eliminated");
                        this.gameStatus.eliminatedPlayers.push(p.number);
                        p.deck.animate([
                            { opacity: 0, filter: "brightness(0%)", offset: 1}
                        ], { duration: 1500, fill: "forwards" });
                        setTimeout(() => {
                            p.deck.dataset.playstatus = "eliminated";
                            p.playStatus = "eliminated";
                            p.deck.classList.remove("result");
                        }, 1750);
                        this.gameStatus.orderedPlayersTurns.splice(this.gameStatus.orderedPlayersTurnsIndex, 1);
                        this.gameStatus.orderedPlayersTurnsIndex - 1 >= -1 ? this.gameStatus.orderedPlayersTurnsIndex-- : this.gameStatus.orderedPlayersTurnsIndex = -1;
                    }
                }
                console.log("result de p:", p);                
            }
        }
        let eachPlayersGain = potAmount / this.gameStatus.winners.length;
        if (belowCashToPutPlayers.length > 0) {
            belowCashToPutPlayers.forEach((player) => {
                console.log("belowCashToPutPlayers:", player);                
                let cashGain = eachPlayersGain - player.cashDifferencial;
                this.gameEnvironment.players[`player${player.playerNumber}`]["cash"] += cashGain;
                potAmount -= cashGain;
                let index = this.gameStatus.winners.indexOf(player.playerNumber);
                this.gameStatus.winners.splice(index, 1);
            });
        }
        eachPlayersGain = potAmount / this.gameStatus.winners.length;
        this.gameStatus.winners.forEach((number) => {
            this.gameEnvironment.players[`player${number}`]["cash"] += Math.floor(eachPlayersGain);
        });
        setTimeout(() => {
            console.log("checkIfLastWiningRound:", this.checkIfLastWiningRound());
            if (this.checkIfLastWiningRound()) {
                this.showWinner();
                return;
            }
            this.resetPlay();
            setTimeout(() => {
                this.runningTurn();
            }, 2000);
        }, 12000);

    }    

    checkWord(word, wordsList) {
        console.log("word:", word);
        // console.log("wordsList:", wordsList);
        if (word.length < 5) return;
        let wordIsValid = false;
        if (wordsList.includes(word)) {
            wordIsValid = true;
        }
        console.log("wordIsValid:", wordIsValid);
        return wordIsValid;
    }

    bestWord() {
        this.gameStatus.bestWordValue = 0;
        this.gameStatus.orderedPlayersTurns.forEach((playerNumber) => {
            const p = this.gameEnvironment.players[`player${playerNumber}`];
            console.log("bestWord p:", p);
            console.log("bestWord p.wordToPlay:", p.wordToPlay);
            
            if (p.playStatus !== "eliminated") {
                if (p.wordToPlay.value > this.gameStatus.bestWordValue) this.gameStatus.bestWordValue = p.wordToPlay.value;
            }
        });
    }

    updatePotAndBetRange() {     
        const yourPlayer = this.gameEnvironment.players[`player${this.gameStatus.yourTurnNumber}`];
        console.log("this.gameStatus.previousBetAmount:", this.gameStatus.previousBetAmount);
        let max = this.gameStatus.previousBetAmount < yourPlayer["cash"] ? yourPlayer["cash"] - this.gameStatus.previousBetAmount : yourPlayer["cash"];
        this.gameEnvironment.betAmountRange.max = max;
        let min = this.gameStatus.previousBetAmount < this.gameStatus.bigBlind ? this.gameStatus.bigBlind : (this.gameStatus.previousBetAmount > yourPlayer["cash"] ? yourPlayer["cash"] : this.gameStatus.previousBetAmount);
        this.gameEnvironment.betAmountRange.min = min > max ? max : min;
        this.gameEnvironment.betAmountRange.value = this.gameEnvironment.betAmountRange.min;
        this.gameEnvironment.betAmountRange.dataset.amount = this.gameEnvironment.betAmountRange.value;
        this.gameEnvironment.potAmount.textContent = this.gameStatus.potAmount;
    }

    checkIfAllInFaceOffSituation() {
        let atLeastOneAllIn = false;
        let allInFaceOffSituation = true;
        this.gameStatus.orderedPlayersTurns.forEach((playerNumber) => {
            const p = this.gameEnvironment.players[`player${playerNumber}`];         
            if (p.playStatus === "allin") {
                atLeastOneAllIn = true;
            }
        });
        // console.log("atLeastOneAllIn:", atLeastOneAllIn);  
        this.gameStatus.orderedPlayersTurns.forEach((playerNumber) => {
            const p = this.gameEnvironment.players[`player${playerNumber}`];
            // console.log("p.playStatus:", p.playStatus, "/ p.cashPut:", p.cashPut, "/ this.gameStatus.cashToPut:", this.gameStatus.cashToPut);            
            if (!
                    (
                        (
                            (
                                (p.playStatus === "call" || p.playStatus === "raise" || p.playStatus === "wait") && p.cashPut === this.gameStatus.cashToPut
                            ) ||
                            (
                                p.playStatus === "allin"
                            )
                        ) &&
                    atLeastOneAllIn)
                ) {
                allInFaceOffSituation = false;
            }
        });
        return allInFaceOffSituation;
    }

    checkIfLastWiningRound() {
        if (this.gameStatus.eliminatedPlayers.length === this.initData.numberOfPlayers - 1) {
            return true;
        } else {
            return false;
        };
    }

    showWinner() {
        const player = this.gameEnvironment.players[`player${this.gameStatus.winners[0]}`]
        document.querySelector(".game_table-container").classList.add("game_winner");
        const winnerContainer = document.createElement("div");
        winnerContainer.classList.add("winner-container");
        const winnerText = document.createElement("div");
        winnerText.classList.add("winner_text");
        winnerText.textContent = `GAGNANT${player.gender === "female" ? "E" : ""}!`;
        const winnerAvatarContainer = document.createElement("div");
        winnerAvatarContainer.classList.add("winner_avatar-container");
        const winnerAvatar = document.createElement("img");
        winnerAvatar.classList.add("winner_avatar");
        winnerAvatar.src = `./assets/img/avatars/avatar${player.avatar}.png`
        winnerAvatarContainer.appendChild(winnerAvatar);
        const winnerName = document.createElement("div");
        winnerName.classList.add("winner_name");
        winnerName.textContent = player.name;
        winnerName.setAttribute("player", player.name);
        const winnerCash = document.createElement("div");
        winnerCash.classList.add("winner_cash");
        winnerCash.textContent = player.cash + "€";
        winnerCash.setAttribute("cash", player.cash);
        winnerContainer.append(winnerText, winnerName, winnerAvatarContainer, winnerCash);
        document.querySelector(".game_table").appendChild(winnerContainer);

    }

    resetPlay() {
        this.gameStatus.disableActions = false;
        this.gameStatus.round++;
        this.gameStatus.orderedPlayersTurnsIndex = 0;
        this.gameStatus.showdownStatusesIndex = 0;
        console.log("this.gameStatus.bigBlindPlayerNumber before:", this.gameStatus.bigBlindPlayerNumber);        
        this.gameStatus.bigBlindPlayerNumber > 1 ? this.gameStatus.bigBlindPlayerNumber-- : this.gameStatus.bigBlindPlayerNumber = this.initData.numberOfPlayers;
        console.log("this.gameStatus.bigBlindPlayerNumber after:", this.gameStatus.bigBlindPlayerNumber);        
        this.gameStatus.orderedPlayersTurns.length = 0;
        this.gameStatus.winners.length = 0;
        if (this.gameStatus.round % 5 === 0) this.gameStatus.bigBlind *= 2;
        this.gameStatus.smallBlind = this.gameStatus.bigBlind / 2;
        for (let i = 1; i <= this.initData.numberOfPlayers; i++) {
            this.gameStatus.orderedPlayersTurns.unshift(
                i === 1 ? this.gameStatus.bigBlindPlayerNumber :
                    (this.gameStatus.bigBlindPlayerNumber - (i - 1) > 0 ? this.gameStatus.bigBlindPlayerNumber - (i - 1) : this.initData.numberOfPlayers + (this.gameStatus.bigBlindPlayerNumber - (i - 1)))
            );
        }
        for (let i = this.gameStatus.orderedPlayersTurns.length - 1; i >= 0; i--) {
            if (this.gameStatus.eliminatedPlayers.includes(this.gameStatus.orderedPlayersTurns[i])) {
                this.gameStatus.orderedPlayersTurns.splice(i, 1);
            } else {
                this.gameEnvironment.players[`player${this.gameStatus.orderedPlayersTurns[i]}`].clear();
            }
        }
        console.log("this.gameStatus.orderedPlayersTurns:", this.gameStatus.orderedPlayersTurns);
        if (this.gameStatus.orderedPlayersTurns.length === 1) return;
        let smallBlindPlayer = this.gameEnvironment.players[`player${this.gameStatus.orderedPlayersTurns.at(-2)}`];
        let bigBlindPlayer = this.gameEnvironment.players[`player${this.gameStatus.orderedPlayersTurns.at(-1)}`];
        smallBlindPlayer.cashPut = this.gameStatus.smallBlind < smallBlindPlayer.cash ? this.gameStatus.smallBlind : smallBlindPlayer.cash;
        smallBlindPlayer.cash -= smallBlindPlayer.cashPut;
        smallBlindPlayer.deck.dataset.bet = smallBlindPlayer.cashPut;
        smallBlindPlayer.deck.querySelector(".cash_amount").textContent = smallBlindPlayer.cash;
        smallBlindPlayer.checkIfAllIn();
        bigBlindPlayer.cashPut = this.gameStatus.bigBlind < bigBlindPlayer.cash ? this.gameStatus.bigBlind : bigBlindPlayer.cash;
        bigBlindPlayer.cash -= bigBlindPlayer.cashPut;
        bigBlindPlayer.deck.dataset.bet = bigBlindPlayer.cashPut;
        bigBlindPlayer.deck.querySelector(".cash_amount").textContent = bigBlindPlayer.cash;
        bigBlindPlayer.checkIfAllIn();
        this.gameStatus.cashToPut = this.gameStatus.bigBlind;
        this.gameStatus.potAmount = smallBlindPlayer.cashPut + bigBlindPlayer.cashPut;
        this.gameStatus.previousBetAmount = 0;
        console.log("currentProfile.username:", currentProfile.username);
        console.log("room.hostName:", room.hostName);        
        if (currentProfile.username === room.hostName) this.gameEnvironment.generateDistribution();
    }
}