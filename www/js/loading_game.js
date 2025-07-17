const loadingScreen = document.querySelector(".loading_screen");

setTimeout(() => {
    loadingScreen.classList.add("hide");
    document.querySelector("main").classList.remove("hide");
    setTimeout(() => {
        loadingScreen.classList.add("d-none");
        setTimeout(() => {
            loadingScreen.remove();
        }, 1100);
    }, 550);
}, 5000);