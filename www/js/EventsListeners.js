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
            event.stopPropagation();
            event.preventDefault();
            // console.log("event.target:", event.target);
            if (this.gameStatus.disableActions) return;

            if (event.target.classList.contains("holder_letter") && event.target.dataset.letter !== "*") {
                if (event.button === 0) {
                    const fragment = document.createDocumentFragment();
                    // console.log("event.target.parentNode:", event.target.parentNode);
                    if (event.target.parentNode.classList.contains("holder_bottom_rack")) {
                        fragment.appendChild(event.target);
                        document.querySelector(".holder_top_rack").appendChild(fragment);
                    }
                    else {
                        if (event.target.dataset.value === "?") {
                            event.target.textContent = "*";
                            event.target.dataset.letter = "*";
                            event.target.title = "* : 0";
                        }
                        fragment.appendChild(event.target);
                        document.querySelector(".holder_bottom_rack").appendChild(fragment);
                    }
                }
                if (event.button === 2) {
                    document.querySelectorAll(".holder_top_rack .holder_letter").forEach((letter) => {
                        if (letter.dataset.value === "?") {
                            letter.textContent = "*";
                            letter.dataset.letter = "*";
                            letter.title = "* : 0";
                        }
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
                console.log("isValid:", isValid);
                this.yourPlayer.wordToPlay.word = word;
                console.log("this.yourPlayer.wordToPlay.word:", this.yourPlayer.wordToPlay.word);
                if (isValid) {
                    this.yourPlayer.wordToPlay.value = this.yourPlayer.getWordTotalValue(word);
                    this.gameEnvironment.playerLettersHolder.dataset.wordvalue = this.yourPlayer.wordToPlay.value;
                } else {
                    this.gameEnvironment.playerLettersHolder.dataset.wordvalue = "0";
                }
                if (this.yourPlayer.wordToPlay.value > this.gameStatus.bestWordValue)
                    this.gameStatus.bestWordValue = this.yourPlayer.wordToPlay.value;
            } else if (event.target.classList.contains("holder_letter") && event.target.dataset.letter === "*") {
                console.log("event.target.dataset.letter === *");
                event.target.classList.add("selected");
                document.querySelector(".wildcard_letters_choice-container").classList.add("show");
            }

        });

        document.querySelectorAll(".wildcard_letter").forEach((letter) => {
            letter.addEventListener("pointerup", (event) => {
                const newLetter = event.currentTarget.dataset.letter;
                console.log("newLetter:", newLetter);
                const selectedWildcard = document.querySelector(".holder_letter.selected");
                console.log("selectedWildcard:", selectedWildcard);
                selectedWildcard.textContent = newLetter;
                selectedWildcard.dataset.letter = newLetter;
                selectedWildcard.title = `${newLetter.toUpperCase()} : ?`;
                selectedWildcard.classList.remove("selected");
                document.querySelector(".wildcard_letters_choice-container").classList.remove("show");
            });
        });

        this.gameEnvironment.playerActions.forEach((action) => {
            action.addEventListener("pointerup", (event) => {
                if (event.currentTarget.disabled || this.gameStatus.disableActions || this.yourPlayer.playStatus === "allin") return;
                console.log("event.currentTarget.dataset.action:", event.currentTarget.dataset.action);
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

        function handleVisibilityChange() {
            console.log("handleVisibilityChange");            
            if (document.hidden) {
                socket.emit('page-not-visible');
            } else {
                socket.emit('page-visible');
            }
        }
        document.addEventListener("visibilitychange", handleVisibilityChange, false);

        window.oncontextmenu = function () { return false; };

        window.addEventListener("pointerup", (event) => {
            if (!(event.target.classList.contains("wildcard_letters_choice-container.show") || event.target.closest(".wildcard_letters_choice-container.show"))) {
                console.log("click away!!!!");                
                if (document.querySelector(".wildcard_letters_choice-container").classList.contains("show"))
                    document.querySelector(".wildcard_letters_choice-container").classList.remove("show");
            }
        })

    }
}