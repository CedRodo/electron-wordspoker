class Players {
    name = "";
    avatar = "";
    gender = "";
    type = "";
    number = 0;
    deck;
    cardsList = [];
    lettersList = [];
    possibleWords = [];
    cash = 0;
    cashPut = 0;
    playStatus = "";
    wordCards = [];
    wordsCards = [];
    possibleWordsToPlay = [];
    wordToPlay = { word: "", value: 0 };
    constructor(data) {
        this.number = data.playerNumber;
        this.name = data.playerName;
        this.avatar = data.avatarNumber;
        this.gender = data.gender;
        this.cash = data.playerCash;
    }

    getPossibleWords(initWordsList) {
        // console.log("lettersList:", lettersList);
        let possibleWordsList = [];
        let wordsList = [...initWordsList];
        const nbOfStarLetters = this.lettersList.filter((l) => (l === " ")).length;
        // console.log("getPossibleWords nbOfStarLetters:", nbOfStarLetters);        
        wordsList.forEach((wrd) => {
            let word = wrd.split("");
            // console.log("word:", word);
            let list = [...this.lettersList];
            let isPossible = true;
            let nbOfStarLettersCount = nbOfStarLetters;

            while (word.length > 0 && isPossible) {
                if (list.includes(word[0]) || nbOfStarLettersCount > 0) {
                    if (!list.includes(word[0])) nbOfStarLettersCount--;
                    list.splice(list.indexOf(word[0]), 1);
                    word.shift();
                } else {
                    isPossible = false;
                }
            }

            if (isPossible) {
                // if (isPossible.lettersPresentInWord === isPossible.wordLength) {
                // console.log("isPossible:", isPossible);
                // console.log("word:", wrd, " / lettersList:", lettersList);                    
                // console.log("word:", wrd, "/ value:", this.getWordValue(wrd));                    
                possibleWordsList.push({ word: wrd, value: this.getWordValue(wrd) });
            }


        });
        // console.log("possibleWordsList:", possibleWordsList);        
        this.possibleWords = possibleWordsList;
    }

    getWordValue(word) {
        const letters = new InitData().letters;
        // console.log("getWordValue word:", word);

        let lettersCount = {};
        let wordLetters = word.split("");

        wordLetters.forEach((letter) => {
            lettersCount[letter] > 0 ? lettersCount[letter]++ : lettersCount[letter] = 1;
        });

        // console.log("lettersCount:", lettersCount);

        let wordValue = 0;
        let i = 0;

        while (i < word.length) {
            letters.find((letter) => {
                if (letter["letter"] === word[i]) {
                    wordValue += letter["value"] * lettersCount[letter["letter"]];
                    i++;
                }
            });
            // if (gameEnvironment.players[`player${gameStatus.playerTurnNumber}`]["type"] === "you") console.log("getWordValue word[i]:", word[i]);
            // letters.forEach((letter) => {
            //     if (letter["letter"] === word[i]) {
            //         // if (gameEnvironment.players[`player${gameStatus.playerTurnNumber}`]["type"] === "you") console.log("getWordValue letter:", letter);             
            //         wordValue += letter["value"] * lettersCount[letter["letter"]];
            //         i++;
            //     }
            // });
        }
        // console.log("getWordValue wordValue:", wordValue);
        return wordValue;
    }

    setWordsCards() {
        console.log("setWordsCards possibleWords:", ...this.possibleWords);
        if (this.possibleWords.length === 0) return;
        let wordsCards = [];
        this.possibleWords.forEach((word) => {
            let wordToSuggest = { word: word.word, value: word.value, cards: [] };
            word.word.split("").forEach((letter, index) => {
                this.cardsList.forEach((card) => {
                    // console.log("letter:", letter);
                    // console.log("index:", index);
                    // console.log("card.letter:", card.letter);
                    if (letter === card.letter || card.letter === " ") {
                        wordToSuggest.cards[index] = card;
                    }
                });
            });
            // console.log("wordToSuggest:", wordToSuggest);
            wordsCards.push(wordToSuggest);
        });
        // console.log("wordsCards:", wordsCards);
        this.wordsCards = wordsCards;
    }

    checkHandRanks() {

        let handRanks = {
            four: false,
            five: false,
            six: false,
            seven: false,
            full: false,
            flush: false
        };

        let colors = {
            blue: 0,
            red: 0,
            green: 0,
            yellow: 0
        };

        this.wordCards.forEach((letter) => {
            const color = letter.color;
            colors[color]++;
        });
        // console.log("colors:", colors);

        let colorsList = [];
        for (const color in colors) {
            if (colors[color] === 7) {
                handRanks.flush = true;
            } else if (colors[color] === 6) {
                handRanks.six = true;
            } else if (colors[color] === 5) {
                handRanks.five = true;
            } else if (colors[color] === 4) {
                handRanks.four = true;
            }
            if (colors[color] > 0 && !colorsList.includes(color)) {
                colorsList.push(color);
            }
        }
        // console.log("colorsList:", colorsList);

        if (colorsList.length === 2) {
            switch (this.wordCards.length) {
                case 5:
                    if ((colors[colorsList[0]] === 3 && colors[colorsList[1]] === 2) ||
                        (colors[colorsList[0]] === 2 && colors[colorsList[1]] === 3)) {
                        handRanks.full = true;
                    }
                    break;
                case 6:
                    if ((colors[colorsList[0]] === 3 && colors[colorsList[1]] === 3) ||
                        (colors[colorsList[0]] === 4 && colors[colorsList[1]] === 2) ||
                        (colors[colorsList[0]] === 2 && colors[colorsList[1]] === 4)) {
                        handRanks.full = true;
                    }
                    break;
                case 7:
                    if ((colors[colorsList[0]] === 4 && colors[colorsList[1]] === 3) ||
                        (colors[colorsList[0]] === 3 && colors[colorsList[1]] === 4) ||
                        (colors[colorsList[0]] === 5 && colors[colorsList[1]] === 2) ||
                        (colors[colorsList[0]] === 2 && colors[colorsList[1]] === 5)) {
                        handRanks.full = true;
                    }
                    break;
            }
        }
        // console.log("handRanks:", handRanks);

        let handRankValue = 1;
        switch (true) {
            case handRanks.flush:
                handRankValue = 10;
                break;
            case handRanks.full:
                handRankValue = 8;
                break;
            case handRanks.six:
                handRankValue = 6;
                break;
            case handRanks.five:
                handRankValue = 5;
                break;
            case handRanks.four:
                handRankValue = 4;
                break;
        }

        return handRankValue;
    }

    getWordTotalValue(word) {
        const wordLettersValue = this.possibleWords.find((wrd) => wrd.word === word);
        // if (word.length > 5) {
        //     console.log("getWordTotalValue word:", word);
        //     console.log("getWordTotalValue this.possibleWords:", this.possibleWords);        
        //     console.log("wordLettersValue:", wordLettersValue);
        // }
        const handRankValue = this.checkHandRanks();
        return (wordLettersValue.value * word.length) + (word.length * handRankValue);
    }

    setWordsAndValues() {
        // console.log("setWordsCards wordsCards:", this.wordsCards);
        if (this.wordsCards.length === 0) return;
        this.possibleWordsToPlay.length = 0;
        this.wordsCards.forEach((word) => {
            // this.wordCards = word.cards;
            // console.log("word.word:", word.word);
            const value = this.getWordTotalValue(word.word);
            this.possibleWordsToPlay.push({
                word: word.word,
                cards: word.cards,
                value: value
            });
        });
        this.possibleWordsToPlay.sort((a, b) => b.value - a.value);
        console.log("this.possibleWordsToPlay:", this.possibleWordsToPlay);
    }

    checkIfAllIn() {
        console.log("checkIfAllIn");        
        if (this.cash === 0) {
            this.deck.dataset.playstatus = "allin";
            this.playStatus = "allin";
        }
        return true;
    }

    clear() {
        this.playStatus = "wait";
        this.cashPut = 0;
        this.cardsList.length = 0;
        this.lettersList.length = 0;
        this.possibleWords.length = 0;
        this.possibleWordsToPlay.length = 0;
        this.wordsCards.length = 0;
        this.wordCards.length = 0;
        this.wordToPlay = { word: "", value: 0 };
        this.deck.classList.remove("result");
        this.deck.classList.remove("winner");
        this.deck.classList.remove("undisputed");
        this.deck.classList.remove("face_off");
        this.deck.dataset.playstatus = "wait";
        this.deck.dataset.bet = "";
        this.deck.querySelector(".cash_amount").textContent = this.cash;
        this.deck.querySelector(".player_word_suggested_value").textContent = 0;
        this.deck.querySelector(".action_sign").textContent = "";
        this.deck.querySelector(".bet_amount").textContent = "";
        while (this.deck.querySelector(".player_word_suggested-container").firstChild) {
            this.deck.querySelector(".player_word_suggested-container").lastChild.remove();
        }
    }
}