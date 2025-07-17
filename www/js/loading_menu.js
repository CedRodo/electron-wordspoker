const loadingScreen = document.querySelector(".loading_screen");
const chipAnimation = document.querySelector(".chip_animation");

let chipAnimationNumber = 1;
let chipAnimationMaxNumber = 24;

let animation = setInterval(() => {
    // console.log("chipAnimationNumber:", chipAnimationNumber);    
    chipAnimation.src = `./assets/img/items/loading/${chipAnimationNumber}.png`;
    chipAnimationNumber++;
    if (chipAnimationNumber > chipAnimationMaxNumber) chipAnimationNumber = 1;
}, 50);

setTimeout(() => {
    loadingScreen.classList.add("hide");
    document.querySelector("main").classList.remove("hide");
    setTimeout(() => {
        loadingScreen.classList.add("d-none");
        clearInterval(animation);
        setTimeout(() => {
            loadingScreen.remove();
        }, 1100);
    }, 550);
}, 3000);