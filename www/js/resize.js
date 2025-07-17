
const main = document.querySelector("main");
if (main) {
    let innerWidth = window.innerWidth;
    let innerHeight = window.innerHeight;
    let aspectRatioDefault = parseFloat(getComputedStyle(main).getPropertyValue("aspect-ratio"));
    let aspectRatioCurrent = innerWidth / innerHeight;
    
    window.addEventListener("resize", recalcDimensions);
    
    function recalcDimensions() {
        innerWidth = window.innerWidth;
        innerHeight = window.innerHeight;
        aspectRatioCurrent = innerWidth / innerHeight;
        checkAspectRatio();
    }
    
    function checkAspectRatio() {
        if (aspectRatioCurrent < aspectRatioDefault) {
            main.style.width = "100%";
            main.style.height = "auto";
        } else {
            main.style.width = "auto";
            main.style.height = "100%";
        }
    }
    
    checkAspectRatio();
}