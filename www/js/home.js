const homeContinue = document.querySelector(".continue");
const introScreen = document.querySelector(".intro_screen");
const introScreenTitle = document.querySelector(".intro_screen-title");
const introScreenTitleLetters = document.querySelectorAll(".intro_screen-title-letter");

homeContinue.addEventListener("click", launchSelectionScreen);

function launchSelectionScreen() {
    // homeContinue.classList.add("pressed");
    // document.querySelector(".sfx-continue").play();
    document.querySelector("main").classList.add("hide");
    // setTimeout(() => { window.location.assign("menu.html"); }, 2000);
    setTimeout(() => { window.location.assign("/menu"); }, 2000);
}

let homeScreenIsLoaded = false;
let introScreenTitleIsClicked = false;

setTimeout(() => {
    introScreenTitle.addEventListener("pointerup", removeIntroScreen);
    document.addEventListener("keyup", removeIntroScreen);
    function removeIntroScreen(event) {
        // console.log("event:", event);
        if (event.key && event.key !== "Enter") return;
        if (introScreenTitleIsClicked === true) return;
        introScreenTitleIsClicked = true;
        introScreenTitleLetters.forEach(element => element.classList.add("intro_screen-title-clicked"));
        setTimeout(() => {
            homeScreenIsLoaded = true;
            introScreen.classList.add("intro_screen-stop");
            document.querySelector("main").classList.add("show");
            setTimeout(() => {
                introScreen.remove();
            }, 500);
        }, 3000);
    }
}, 2250);