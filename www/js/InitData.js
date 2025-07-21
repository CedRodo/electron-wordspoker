class InitData {
    letters = [
        { letter: "a", value: 1, quantity: 8 },
        { letter: "b", value: 3, quantity: 3 },
        { letter: "c", value: 3, quantity: 3 },
        { letter: "d", value: 2, quantity: 4 },
        { letter: "e", value: 1, quantity: 10 },
        { letter: "f", value: 4, quantity: 3 },
        { letter: "g", value: 2, quantity: 3 },
        { letter: "h", value: 4, quantity: 3 },
        { letter: "i", value: 1, quantity: 7 },
        { letter: "j", value: 8, quantity: 2 },
        { letter: "k", value: 10, quantity: 2 },
        { letter: "l", value: 1, quantity: 5 },
        { letter: "m", value: 2, quantity: 4 },
        { letter: "n", value: 1, quantity: 6 },
        { letter: "o", value: 1, quantity: 6 },
        { letter: "p", value: 3, quantity: 3 },
        { letter: "q", value: 8, quantity: 1 },
        { letter: "r", value: 1, quantity: 6 },
        { letter: "s", value: 1, quantity: 6 },
        { letter: "t", value: 1, quantity: 6 },
        { letter: "u", value: 1, quantity: 6 },
        { letter: "v", value: 4, quantity: 3 },
        { letter: "w", value: 10, quantity: 2 },
        { letter: "x", value: 10, quantity: 2 },
        { letter: "y", value: 10, quantity: 2 },
        { letter: "z", value: 10, quantity: 2 }
    ];
    
    avatarsList = {
        male: [1, 3, 5, 7, 9, 10, 12, 14, 16, 18, 19, 21, 23, 25, 27, 28, 30, 32, 34, 36, 38, 40, 42, 44, 45, 46, 48, 50, 52, 54, 55, 57, 59, 61, 63, 64, 66, 68, 70, 72, 73, 75, 77, 79, 81],
        female: [2, 4, 6, 8, 11, 13, 15, 17, 20, 22, 24, 26, 29, 31, 33, 35, 37, 39, 41, 43, 47, 49, 51, 53, 56, 58, 60, 62, 65, 67, 69, 71, 74, 76, 78, 80]
    }
    
    numberOfPlayers;
    colorsList = [];
    originalWordsList = [];
    wordsList = [];
    playerNamesList = [];

    constructor(numberOfPlayers) {
        this.numberOfPlayers = numberOfPlayers ?? 8;
    }

    generateColorsList() {
        let colorsList = [];
        const colors = ["red", "blue", "green", "yellow"];
        let lettersQuantity = 0;
        for (const letter in this.letters) {
            lettersQuantity += this.letters[letter].quantity;
        }
        // console.log("lettersQuantity:", lettersQuantity);
        for (let i = 0; i <= 3; i++) {
            for (let j = 1; j <= lettersQuantity / 4; j++) {
                colorsList.push(colors[i]);
            }
        }
        this.shuffle(colorsList);
        // console.log("colorsList:", colorsList);
        return colorsList;
    }

    async getData() {
        this.wordsList = await fetch("./data/words_list_fr.txt")
            .then((response) => response.text())
            .then((data) => { return JSON.parse(data) });
        // console.log("this.wordsList:", this.wordsList);
        // this.originalWordsList = await fetch("./data/words_fr.txt")
        //     .then((response) => response.text())
        //     .then((data) => { return JSON.parse(data) });

        // console.log("this.originalWordsList:", this.originalWordsList);

        this.playerNamesList = await fetch("./data/first_names_list.json")
            .then((response) => response.json())
            .then((data) => { return data });

        // console.log("this.playerNamesList:", this.playerNamesList);
    }

    // reduceWordsList() {   
    //     this.originalWordsList.forEach((word) => {
    //         if (word.length >= 5 && word.length <= 7 && !word.includes("-")) {
    //             // console.log("index:", index, " / word:", word, " / word.length:", word.length);
    //             let wrd = word.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    //             if (!this.wordsList.includes(wrd)) this.wordsList.push(wrd);
    //             // if (!this.wordsList.includes(wrd)) this.wordsList.push("\"" + wrd + "\"");
    //         }
    //     });
    //     // document.write(this.wordsList);
    //     console.log("this.wordsList:", this.wordsList);
    // }

    cardsShowdown() {
        let showdownLetters = [];
        for (const letter in this.letters) {
            for (let i = 1; i <= this.letters[letter]["quantity"]; i++) {
                showdownLetters.push([this.letters[letter]["letter"], this.letters[letter]["value"], this.letters[letter]["quantity"]])
            }
        }
        // console.log("showdownLetters:", showdownLetters);

        this.shuffle(showdownLetters);

        // console.log("showdownLetters after shuffle:", showdownLetters);

        let showdown = [];

        while (showdown.length < (this.numberOfPlayers * 2) + 5) {
            const letterIndex = Math.floor(Math.random() * (showdownLetters.length - 1));
            // console.log("letterIndex:", letterIndex);
            if (showdownLetters[letterIndex][2] > 0) {
                // console.log("showdownLetters[letterIndex]:", showdownLetters[letterIndex]);
                showdown.push([showdownLetters[letterIndex][0], showdownLetters[letterIndex][1]]);
                showdownLetters[letterIndex][2]--;
            }
        }
        // console.log("showdown:", showdown);
        return showdown;
    }

    shuffle(array) {
        let currentIndex = array.length;
        while (currentIndex != 0) {
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
    }
}