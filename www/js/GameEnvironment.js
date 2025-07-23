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
    AIPlayersList = [];
    
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

    async generateAIPlayers(numberOfAIPlayers) {
            const avatars = this.initData.avatarsList;
            const playerNames = this.initData.playerNamesList;
            for (let i = 1; i <= numberOfAIPlayers; i++) {
                let playerName;
                let avatarNumber;
                let gender;
                let playerNamesIndex = Math.floor(Math.random() * playerNames.length);
                playerName = playerNames[playerNamesIndex].prenoms;
                // console.log("playerName:", playerName);
                gender = playerNames[playerNamesIndex].sexe === "M" ? "male" : "female";
                // console.log("avatars[gender]:", avatars[gender]);
                avatarNumber = avatars[gender][Math.floor(Math.random() * avatars[gender].length)];
                this.AIPlayersList.push({
                    ref: "0",
                    userPreferences: {
                        playerName: playerName,
                        avatarNumber: avatarNumber,
                        gender: gender
                    }
                });
            }
            console.log("generateAIPlayers this.AIPlayersList:", this.AIPlayersList);
            await socket.emit('send-AI-players-list', this.AIPlayersList, roomId);
    }

    generatePlayers(data) {
        console.log("generatePlayers");
        const NB_VS_PLAYERS = room.gamePreferences.numberOfVsPlayers;
        const NB_PLAYERS = room.gamePreferences.numberOfPlayers;
        console.log("generatePlayers NB_VS_PLAYERS:", NB_VS_PLAYERS);
        console.log("generatePlayers NB_PLAYERS:", NB_PLAYERS);
        document.querySelector(".game_table-container").dataset.nbplayers = NB_PLAYERS;
        const totalPlayersList = room.usersList.concat(this.AIPlayersList);
        console.log("totalPlayersList:", totalPlayersList);
        let playersTurnOrder = data.playersTurnOrder;
        let playersNumbers = data.playersNumbers;
        totalPlayersList.forEach((user, index) => {
            console.log("totalPlayersList user:", user);          
            console.log("totalPlayersList playersNumbers[index]:", playersNumbers[index]);          
            const playerData = {
                // playerNumber: index + 1,
                playerNumber: playersNumbers[index],
                playerName: user.userPreferences.playerName,
                avatarNumber: user.userPreferences.avatarNumber,
                gender: user.userPreferences.gender,
                playerCash: this.gameStatus.startingCash
            }
            if (user.ref === currentProfile.ref) this.gameStatus.yourTurnNumber = playerData.playerNumber;

            if (user.ref === currentProfile.ref) {
                this.players[`player${playerData.playerNumber}`] = new UserPlayers(playerData);
            } else if (user.ref === "0") {
                this.players[`player${playerData.playerNumber}`] = new AIPlayers(playerData);
            } else {
                this.players[`player${playerData.playerNumber}`] = new VsPlayers(playerData);
            }
            console.log("this.players[`player${playerData.playerNumber}`]:", this.players[`player${playerData.playerNumber}`]);
            
            // Player deck
            const playerDeck = document.createElement("div");
            playerDeck.classList.add("player_deck");
            playerDeck.setAttribute("data-player", this.players[`player${playerData.playerNumber}`]["type"]);
            playerDeck.setAttribute("data-playstatus", "wait");
            playerDeck.setAttribute("data-playernumber", this.players[`player${playerData.playerNumber}`]["number"]);
            playerDeck.setAttribute("data-bet", "");
            if (this.players[`player${playerData.playerNumber}`]["type"] === "you") this.yourDeck = playerDeck;
            console.log("this.yourDeck:", this.yourDeck);            
            // Player avatar
            const playerAvatarContainer = document.createElement("div");
            playerAvatarContainer.classList.add("player_avatar-container");
            const playerAvatar = document.createElement("img");
            playerAvatar.classList.add("player_avatar");
            playerAvatar.src = `./assets/img/avatars/avatar${playerData.avatarNumber}.png`;
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
            playerNameDisplay.textContent = playerData.playerName;
            const playerCashDisplay = document.createElement("div");
            playerCashDisplay.classList.add("player_cash");
            const cashAmount = document.createElement("span");
            cashAmount.classList.add("cash_amount");
            
            if (playerData.playerNumber === playersTurnOrder.at(-2)) {
                this.players[`player${playerData.playerNumber}`]["cashPut"] = this.gameStatus.smallBlind;
                this.players[`player${playerData.playerNumber}`]["cash"] -= this.gameStatus.smallBlind;
                playerDeck.setAttribute("data-bet", this.gameStatus.smallBlind);
            }
            if (playerData.playerNumber === playersTurnOrder.at(-1)) {
                this.players[`player${playerData.playerNumber}`]["cashPut"] = this.gameStatus.bigBlind;
                this.players[`player${playerData.playerNumber}`]["cash"] -= this.gameStatus.bigBlind;
                playerDeck.setAttribute("data-bet", this.gameStatus.bigBlind);
                this.gameStatus.bigBlindPlayerNumber = this.players[`player${playerData.playerNumber}`]["number"];
            }
            cashAmount.textContent = this.players[`player${playerData.playerNumber}`]["cash"];
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

            this.players[`player${playerData.playerNumber}`]["deck"] = playerDeck;
            this.players[`player${playerData.playerNumber}`]["playStatus"] = "wait";

        });       
        
        document.querySelector(".game_table-container").dataset.coloron = this.userPreferences.colorOn;
        document.querySelector(".game_menu_color_on").dataset.coloron = this.userPreferences.colorOn;
        document.querySelector(".game_menu_color_on span").textContent = this.userPreferences.colorOn === "cards" ? "cartes" : "lettres";

        this.gameStatus.orderedPlayersTurns = playersTurnOrder;
        
        this.playersDecks = document.querySelectorAll(".player_deck");

        this.gameStatus.playerTurnNumber = playersTurnOrder[0];
        this.gameStatus.lastPlayerTurnNumber = this.gameStatus.playerTurnNumber;

        this.betAmountRange.max = this.players[`player${this.gameStatus.yourTurnNumber}`]["cash"] - this.gameStatus.bigBlind;
        this.betAmountRange.min = this.gameStatus.bigBlind;
        this.betAmountRange.value = this.betAmountRange.min;
        this.betAmountRange.dataset.amount = this.betAmountRange.value;
        this.potAmount.textContent = this.gameStatus.potAmount;
        this.gameStatus.previousBetAmount = 0;
        
    }

    generateDistribution() {
        console.log("generateDistribution");        
        let showdown = this.initData.cardsShowdown();
        let colorsToSet = this.initData.generateColorsList();
        // console.log("showdown:", showdown);
        // console.log("colorsToSet:", colorsToSet);
        socket.emit('game-generate-distribution', { showdown: showdown, colorsToSet: colorsToSet }, room.roomId);        
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
                    case "coloron":
                        this.toggleColorOn(event.currentTarget);
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
        setTimeout(() => { window.location.assign("/menu"); });
        // setTimeout(() => { window.location.assign("/test"); });
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

    toggleColorOn(button) {        
        if (button.dataset.coloron === "letters") {
            button.querySelector("span").textContent = "cartes";
            button.dataset.coloron = "cards";
            document.querySelector(".game_table-container").dataset.coloron = "cards";
            return;
        }
        if (button.dataset.coloron === "cards") {
            button.querySelector("span").textContent = "lettres";
            button.dataset.coloron = "letters";
            document.querySelector(".game_table-container").dataset.coloron = "letters";
            return;
        }
    }

}