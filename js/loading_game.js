const loadingScreen = document.querySelector(".loading_screen");
const main = document.querySelector("main");

setTimeout(() => {
    loadingScreen.classList.add("hide");
    main.classList.remove("hide");
    setTimeout(() => {
        loadingScreen.classList.add("d-none");
        setTimeout(() => {
            loadingScreen.remove();
        }, 1100);
    }, 550);
}, 5000);