class GameEnvironment {
    initData;
    userPreferences;
    gamePreferences;
    gameStatus;
    sounds;
    roomBackground = document.querySelector(".room_background");
    gameMenu = document.querySelector(".game_menu");
    gameMenuItemsButtons = document.querySelectorAll(".game_menu_item_button");
    gameMenuButton = document.querySelector(".game_menu_button");
    potAmount = document.querySelector(".pot_amount");
    showdownCards = document.querySelectorAll(".showdown_card");
    playersDecks = null;
    yourDeck = null;
    yourCards = null;
    playerActions = document.querySelectorAll(".player_action");
    playerLettersHolder = document.querySelector(".player_letters_holder");
    holderTopRack = document.querySelector(".holder_top_rack");
    holderBottomRack = document.querySelector(".holder_bottom_rack");
    betAmountRange = document.querySelector("#bet_amount_range");
    betAmountRangeCurrentValueDisplay = document.querySelector(".bet_amount_range_current_value_display");
    betAmountRangeMaxValueDisplay = document.querySelector(".bet_amount_range_max_value_display");
    betAmountPreselections = document.querySelectorAll(".bet_amount_preselection");
    bgLastNb = 86;
    players = {};
    
    constructor(initData, userPreferences, gamePreferences, gameStatus, sounds) {
        this.initData = initData;
        this.userPreferences = userPreferences;
        this.gamePreferences = gamePreferences;
        this.gameStatus = gameStatus;
        this.sounds = sounds;
    }

    setBackground() {
        // this.gamePreferences.backgroundNumber = Math.floor(Math.random() * this.bgLastNb) + 1;
        this.roomBackground.style.setProperty("--url", `url(../assets/img/backgrounds/bg${this.gamePreferences.backgroundNumber}.jpg)`);
    }

    generatePlayers() {
        const numberOfPlayers = this.initData.numberOfPlayers;
        console.log("numberOfPlayers:", numberOfPlayers);
        document.querySelector(".game_table-container").dataset.nbplayers = numberOfPlayers;
        let playersNumber = [];
        let alreadyUsedNames = [];
        let alreadyUsedAvatars = [];
        const avatars = this.initData.avatarsList;
        const playerNames = this.initData.playerNamesList;
        // console.log("playerNames:", playerNames);
        // console.log("avatars:", avatars);
        for (let i = 1; i <= numberOfPlayers; i++) {
            let playerName;
            let avatarNumber;
            let gender;
            if (i === 1) {
                playerName = this.userPreferences.playerName;
                avatarNumber = this.userPreferences.avatarNumber;
                
            } else {
                // console.log("playerNameIndex:", playerNameIndex);
                // console.log("playerNames[playerNameIndex]:", playerNames[playerNameIndex]);
                let playerNamesIndex = Math.floor(Math.random() * playerNames.length);
                playerName = playerNames[playerNamesIndex].prenoms;
                while (alreadyUsedNames.includes(playerName)) {
                    playerNamesIndex = Math.floor(Math.random() * playerNames.length);
                    playerName = playerNames[playerNamesIndex].prenoms;
                }
                alreadyUsedNames.push(playerName);
                // console.log("playerName:", playerName);
                // console.log("playerName[0].sexe:", playerName[0].sexe);
                gender = playerNames[playerNamesIndex].sexe === "M" ? "male" : "female";
                // console.log("avatars[avatarsGenderProperty]:", avatars[avatarsGenderProperty]);
                avatarNumber = avatars[gender][Math.floor(Math.random() * avatars[gender].length)];
                while (alreadyUsedAvatars.includes(avatarNumber)) {
                    avatarNumber = avatars[gender][Math.floor(Math.random() * avatars[gender].length)];
                }
                alreadyUsedAvatars.push(avatarNumber);
                // console.log(`playerName[0]: ${playerName[0]} | avatarNumber: ${avatarNumber}`);
            }
            let playerNumber = Math.floor(Math.random() * numberOfPlayers) + 1;
            while (playersNumber.includes(playerNumber)) {
                playerNumber = Math.floor(Math.random() * numberOfPlayers) + 1;
            }         
            if (i === 1) this.gameStatus.yourTurnNumber = playerNumber;
            playersNumber.push(playerNumber);
            // const playerCash = Math.floor(Math.random() * (1000 - 300 + 1)) + 300;
            const playerCash = this.gameStatus.startingCash;
            this.players[`player${playerNumber}`] = i === 1 ? new UserPlayers(playerNumber, playerName, avatarNumber, userPreferences.gender, playerCash) : new AIPlayers(playerNumber, playerName, avatarNumber, gender, playerCash);
        }
        // console.log("this.players:", this.players);
        // console.log("playersCash:", playersCash);
        // console.log("playersNumber:", playersNumber);
        for (let i = 1; i <= numberOfPlayers; i++) {
            // Player deck
            const playerDeck = document.createElement("div");
            playerDeck.classList.add("player_deck");
            playerDeck.setAttribute("data-player", this.players[`player${i}`]["type"]);
            playerDeck.setAttribute("data-playstatus", "wait");
            playerDeck.setAttribute("data-playernumber", this.players[`player${i}`]["number"]);
            playerDeck.setAttribute("data-bet", "");
            if (this.players[`player${i}`]["type"] === "you") this.yourDeck = playerDeck;
            // Player avatar
            const playerAvatarContainer = document.createElement("div");
            playerAvatarContainer.classList.add("player_avatar-container");
            const playerAvatar = document.createElement("img");
            playerAvatar.classList.add("player_avatar");
            const avatarNumber = this.players[`player${i}`]["avatar"];
            playerAvatar.src = `./assets/img/avatars/avatar${avatarNumber}.png`;
            playerAvatarContainer.appendChild(playerAvatar);
            // Player word suggested
            const playerWordSuggestedContainer = document.createElement("div");
            playerWordSuggestedContainer.classList.add("player_word_suggested-container");
            // for (let i = 1; i <= 7; i++) {
            //     const playerWordSuggestedCard = document.createElement("div");
            //     playerWordSuggestedCard.classList.add("player_word_suggested_card");
            //     playerWordSuggestedContainer.appendChild(playerWordSuggestedCard);
            // }
            // Player cards
            const playerCardsContainer = document.createElement("div");
            playerCardsContainer.classList.add("player_cards-container");
            for (let j = 1; j <= 2; j++) {
                const playerCard = document.createElement("div");
                playerCard.classList.add("player_card", "card");
                playerCard.setAttribute("data-status", i === this.gameStatus.yourTurnNumber ? "revealed" : "concealed");
                playerCard.setAttribute("data-number", j);
                const cardDetails = document.createElement("div");
                cardDetails.classList.add("card_details");
                cardDetails.setAttribute("data-letter", "");
                cardDetails.setAttribute("data-value", "");
                cardDetails.setAttribute("data-color", "");
                const cardLetter = document.createElement("span");
                cardLetter.classList.add("card_letter");
                cardDetails.appendChild(cardLetter);
                playerCard.appendChild(cardDetails);
                playerCardsContainer.appendChild(playerCard);
            }

            if (i === this.gameStatus.yourTurnNumber) this.yourCards = playerCardsContainer.querySelectorAll(".player_card");
            // Player infos
            const playerInfos = document.createElement("div");
            playerInfos.classList.add("player_infos");
            const playerName = document.createElement("div");
            playerName.classList.add("player_name");
            playerName.textContent = this.players[`player${i}`]["name"];
            const playerCash = document.createElement("div");
            playerCash.classList.add("player_cash");
            const cashAmount = document.createElement("span");
            cashAmount.classList.add("cash_amount");
            if (i === numberOfPlayers - 1) {
                this.players[`player${i}`]["cashPut"] = this.gameStatus.smallBlind;
                this.players[`player${i}`]["cash"] -= this.gameStatus.smallBlind;
                playerDeck.setAttribute("data-bet", this.gameStatus.smallBlind);
            }
            if (i === numberOfPlayers) {
                this.players[`player${i}`]["cashPut"] = this.gameStatus.bigBlind;
                this.players[`player${i}`]["cash"] -= this.gameStatus.bigBlind;
                playerDeck.setAttribute("data-bet", this.gameStatus.bigBlind);
                this.gameStatus.bigBlindPlayerNumber = this.players[`player${i}`]["number"];
            }
            cashAmount.textContent = this.players[`player${i}`]["cash"];
            const actionSign = document.createElement("span");
            actionSign.classList.add("action_sign");
            actionSign.textContent = "";
            const betAmount = document.createElement("span");
            betAmount.classList.add("bet_amount");
            betAmount.textContent = "";
            playerCash.append(cashAmount, actionSign, betAmount);
            const playerWordSuggestedValueContainer = document.createElement("div");
            playerWordSuggestedValueContainer.classList.add("player_word_suggested_value-container");
            const playerWordSuggestedValue = document.createElement("span");
            playerWordSuggestedValue.classList.add("player_word_suggested_value");
            playerWordSuggestedValue.textContent = 0;
            const playerWordSuggestedValuePtsText = document.createElement("span");
            playerWordSuggestedValuePtsText.classList.add("player_word_suggested_value_pts_text");
            playerWordSuggestedValuePtsText.textContent = "pts";
            playerWordSuggestedValueContainer.append(playerWordSuggestedValue, playerWordSuggestedValuePtsText);
            playerInfos.append(playerName, playerCash, playerWordSuggestedValueContainer);
            playerDeck.append(playerAvatarContainer, playerCardsContainer, playerWordSuggestedContainer, playerInfos);
            document.querySelector(".players_decks").appendChild(playerDeck);
            
            this.players[`player${i}`]["deck"] = playerDeck;
            this.players[`player${i}`]["playStatus"] = "wait";

            this.gameStatus.orderedPlayersTurns.push(i);
        }
        this.playersDecks = document.querySelectorAll(".player_deck");

        // this.gameStatus.playerTurnNumber = playersNumber[0] === numberOfPlayers ? 1 : playersNumber[0] + 1;
        this.gameStatus.playerTurnNumber = Math.floor(Math.random() * numberOfPlayers) + 1;
        this.gameStatus.lastPlayerTurnNumber = this.gameStatus.playerTurnNumber;
        
        this.betAmountRange.max = this.players[`player${this.gameStatus.yourTurnNumber}`]["cash"] - this.gameStatus.bigBlind;
        this.betAmountRange.min = this.gameStatus.bigBlind;
        this.betAmountRange.value = this.betAmountRange.min;
        this.betAmountRange.dataset.amount = this.betAmountRange.value;
        this.potAmount.textContent = this.gameStatus.potAmount;
        this.gameStatus.previousBetAmount = 0;
    }

    generateVsPlayers() {
        const numberOfVsPlayers = room.gamePreferences.numberOfVsPlayers;
        console.log("numberOfVsPlayers:", numberOfVsPlayers);
        document.querySelector(".game_table-container").dataset.nbplayers = numberOfVsPlayers;
        room.usersList.forEach((user, index) => {
            let playerName = user.userPreferences.playerName;
            let avatarNumber = user.userPreferences.avatarNumber;
            let gender = user.userPreferences.gender;
            let playerNumber = index + 1;
            if (user.ref === currentProfile.ref) this.gameStatus.yourTurnNumber = playerNumber;
            const playerCash = this.gameStatus.startingCash;
            this.players[`player${playerNumber}`] = user.ref === currentProfile.ref ? new UserPlayers(playerNumber, playerName, avatarNumber, gender, playerCash) : new VsPlayers(playerNumber, playerName, avatarNumber, gender, playerCash);
            console.log("this.players:", this.players);
            
            // Player deck
            const playerDeck = document.createElement("div");
            playerDeck.classList.add("player_deck");
            playerDeck.setAttribute("data-player", this.players[`player${playerNumber}`]["type"]);
            playerDeck.setAttribute("data-playstatus", "wait");
            playerDeck.setAttribute("data-playernumber", this.players[`player${playerNumber}`]["number"]);
            playerDeck.setAttribute("data-bet", "");
            if (this.players[`player${playerNumber}`]["type"] === "you") this.yourDeck = playerDeck;
            // Player avatar
            const playerAvatarContainer = document.createElement("div");
            playerAvatarContainer.classList.add("player_avatar-container");
            const playerAvatar = document.createElement("img");
            playerAvatar.classList.add("player_avatar");
            playerAvatar.src = `./assets/img/avatars/avatar${avatarNumber}.png`;
            playerAvatarContainer.appendChild(playerAvatar);
            // Player word suggested
            const playerWordSuggestedContainer = document.createElement("div");
            playerWordSuggestedContainer.classList.add("player_word_suggested-container");
            // Player cards
            const playerCardsContainer = document.createElement("div");
            playerCardsContainer.classList.add("player_cards-container");
            for (let j = 1; j <= 2; j++) {
                const playerCard = document.createElement("div");
                playerCard.classList.add("player_card", "card");
                playerCard.setAttribute("data-status", user.ref === currentProfile.ref ? "revealed" : "concealed");
                playerCard.setAttribute("data-number", j);
                const cardDetails = document.createElement("div");
                cardDetails.classList.add("card_details");
                cardDetails.setAttribute("data-letter", "");
                cardDetails.setAttribute("data-value", "");
                cardDetails.setAttribute("data-color", "");
                const cardLetter = document.createElement("span");
                cardLetter.classList.add("card_letter");
                cardDetails.appendChild(cardLetter);
                playerCard.appendChild(cardDetails);
                playerCardsContainer.appendChild(playerCard);
            }

            if (user.ref === currentProfile.ref) this.yourCards = playerCardsContainer.querySelectorAll(".player_card");
            // Player infos
            const playerInfos = document.createElement("div");
            playerInfos.classList.add("player_infos");
            const playerNameDisplay = document.createElement("div");
            playerNameDisplay.classList.add("player_name");
            playerNameDisplay.textContent = playerName;
            const playerCashDisplay = document.createElement("div");
            playerCashDisplay.classList.add("player_cash");
            const cashAmount = document.createElement("span");
            cashAmount.classList.add("cash_amount");
            if (playerNumber === numberOfVsPlayers - 1) {
                this.players[`player${playerNumber}`]["cashPut"] = this.gameStatus.smallBlind;
                this.players[`player${playerNumber}`]["cash"] -= this.gameStatus.smallBlind;
                playerDeck.setAttribute("data-bet", this.gameStatus.smallBlind);
            }
            if (playerNumber === numberOfVsPlayers) {
                this.players[`player${playerNumber}`]["cashPut"] = this.gameStatus.bigBlind;
                this.players[`player${playerNumber}`]["cash"] -= this.gameStatus.bigBlind;
                playerDeck.setAttribute("data-bet", this.gameStatus.bigBlind);
                this.gameStatus.bigBlindPlayerNumber = this.players[`player${playerNumber}`]["number"];
            }
            cashAmount.textContent = this.players[`player${playerNumber}`]["cash"];
            const actionSign = document.createElement("span");
            actionSign.classList.add("action_sign");
            actionSign.textContent = "";
            const betAmount = document.createElement("span");
            betAmount.classList.add("bet_amount");
            betAmount.textContent = "";
            playerCashDisplay.append(cashAmount, actionSign, betAmount);
            const playerWordSuggestedValueContainer = document.createElement("div");
            playerWordSuggestedValueContainer.classList.add("player_word_suggested_value-container");
            const playerWordSuggestedValue = document.createElement("span");
            playerWordSuggestedValue.classList.add("player_word_suggested_value");
            playerWordSuggestedValue.textContent = 0;
            const playerWordSuggestedValuePtsText = document.createElement("span");
            playerWordSuggestedValuePtsText.classList.add("player_word_suggested_value_pts_text");
            playerWordSuggestedValuePtsText.textContent = "pts";
            playerWordSuggestedValueContainer.append(playerWordSuggestedValue, playerWordSuggestedValuePtsText);
            playerInfos.append(playerNameDisplay, playerCashDisplay, playerWordSuggestedValueContainer);
            playerDeck.append(playerAvatarContainer, playerCardsContainer, playerWordSuggestedContainer, playerInfos);
            document.querySelector(".players_decks").appendChild(playerDeck);

            this.players[`player${playerNumber}`]["deck"] = playerDeck;
            this.players[`player${playerNumber}`]["playStatus"] = "wait";

            this.gameStatus.orderedPlayersTurns.push(playerNumber);
        });

        this.playersDecks = document.querySelectorAll(".player_deck");

        this.gameStatus.playerTurnNumber = 1;
        this.gameStatus.lastPlayerTurnNumber = this.gameStatus.playerTurnNumber;

        this.betAmountRange.max = this.players[`player${this.gameStatus.yourTurnNumber}`]["cash"] - this.gameStatus.bigBlind;
        this.betAmountRange.min = this.gameStatus.bigBlind;
        this.betAmountRange.value = this.betAmountRange.min;
        this.betAmountRange.dataset.amount = this.betAmountRange.value;
        this.potAmount.textContent = this.gameStatus.potAmount;
        this.gameStatus.previousBetAmount = 0;
    }

    generateDistribution() {
        let showdown = this.initData.cardsShowdown();
        let colorsToSet = this.initData.generateColorsList();
        // console.log("showdown:", showdown);
        // console.log("colorsToSet:", colorsToSet);
        document.querySelectorAll(".holder_letter").forEach(letter => letter.remove());
        this.playerLettersHolder.dataset.word = "";
        this.playerLettersHolder.dataset.wordvalue = "";
        
        document.querySelectorAll(".player_card").forEach((card) => {
            if (!(card.closest(`.player_deck[data-player="you"]`) && this.gameStatus.isEliminated)) {
                const letterDetails = showdown.shift();
                const color = colorsToSet.shift();
                // console.log("letterDetails:", letterDetails);
                card.querySelector(".card_details").setAttribute("data-letter", letterDetails[0]);
                card.querySelector(".card_details").setAttribute("data-value", letterDetails[1]);
                card.querySelector(".card_details").setAttribute("data-color", color);
                card.querySelector(".card_details .card_letter").textContent = letterDetails[0];

                const playerNumber = card.closest(".player_deck").dataset.playernumber;
                if (this.players[`player${playerNumber}`]["cardsList"].length >= 2) this.players[`player${playerNumber}`]["cardsList"].length = 0;
                this.players[`player${playerNumber}`]["cardsList"].push({ letter: letterDetails[0], value: letterDetails[1], color: color });
                if (this.players[`player${playerNumber}`]["lettersList"].length >= 2) this.players[`player${playerNumber}`]["lettersList"].length = 0;
                this.players[`player${playerNumber}`]["lettersList"].push(letterDetails[0]);

                if (card.closest(`.player_deck[data-player="you"]`)) {
                    const holderLetter = document.createElement("div");
                    holderLetter.classList.add("holder_letter");
                    holderLetter.setAttribute("data-letter", letterDetails[0]);
                    holderLetter.setAttribute("data-value", letterDetails[1]);
                    holderLetter.setAttribute("data-color", color);
                    holderLetter.textContent = letterDetails[0];
                    this.holderBottomRack.appendChild(holderLetter);
                }
            }
        });
        // console.log("generateDistribution showdown:", showdown);
        // console.log("this.players before:", this.players);

        this.showdownCards.forEach((card) => {
            card.dataset.status = "concealed";
            const letterDetails = showdown.shift();
            const color = colorsToSet.shift();
            // console.log("letterDetails:", letterDetails);
            card.querySelector(".card_details").setAttribute("data-letter", letterDetails[0]);
            card.querySelector(".card_details").setAttribute("data-value", letterDetails[1]);
            card.querySelector(".card_details").setAttribute("data-color", color);
            card.querySelector(".card_details .card_letter").textContent = letterDetails[0];
        });
        console.log("this.players after:", this.players);
        
    }

    getPlayerDeck(playerNumber) {
        // console.log("playerNumber:", playerNumber);
        // console.log("this.playersDecks:", this.playersDecks);        
        const playerDeck = Array.from(this.playersDecks).find(deck => deck.dataset.playernumber == playerNumber);
        // console.log("playerDeck:", playerDeck);        
        return playerDeck;        
    }

    gameMenuEvents() {
        this.gameMenuButton.addEventListener("pointerup", () => {
            this.gameMenu.classList.toggle("show");
        });

        this.gameMenuItemsButtons.forEach((button) => {
            button.addEventListener("pointerup", (event) => {
                switch (event.currentTarget.dataset.item) {
                    case "backtogame":
                        this.backToGame();
                        break;
                    case "soundactivation":
                        this.toggleSoundState(event.currentTarget);
                        break;
                    case "fullscreenactivation":
                        this.toggleFullscreenState(event.currentTarget);
                        break;
                    case "gotohome":
                        this.goToHome();
                        break;
                }
            });
        });

    }

    backToGame() {
        this.gameMenu.classList.remove("show");
    }

    goToHome() {
        document.querySelector("main").classList.add("hide");
        setTimeout(() => { window.location.assign("menu.html"); })
    }

    toggleSoundState(button) {
        console.log("button.dataset.state:", button.dataset.state);        
        if (button.dataset.state === "on") {
            button.querySelector("span").textContent = "désactivé";
            button.dataset.state = "off";
            this.sounds.audioThemeTag.pause();
            return;
        }
        if (button.dataset.state === "off") {
            button.querySelector("span").textContent = "activé";
            button.dataset.state = "on";
            this.sounds.audioThemeTag.play();
            return;
        }
    }

    toggleFullscreenState(button) {        
        if (button.dataset.state === "on") {
            button.querySelector("span").textContent = "désactivé";
            button.dataset.state = "off";
            document.exitFullscreen();
            return;
        }
        if (button.dataset.state === "off") {
            button.querySelector("span").textContent = "activé";
            button.dataset.state = "on";
            document.documentElement.requestFullscreen().catch((err) => {
                alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
            });
            return;
        }
    }
}