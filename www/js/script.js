// console.log("process", process);

// const APP_ENV = process.env.APP_ENV;

// let host;

// switch (APP_ENV) {
//     case "DEV1":
//         host = "https://www.electronglitch.com/words_poker"
//         break;
//     case "DEV2":
//         host = "https://electron-wordspoker.onrender.com";
//         break;
//     case "PROD":
//         host = "http://localhost:" + process.env.PORT;
//         break;
//     default:
//         host = "http://localhost:" + process.env.PORT;
//         break;
// }

// const socket = io(host);
// const socket = io('http://localhost:3000');
const socket = io();

