class Sounds {
    audioThemeFilename;
    audioThemePath = "";
    audioThemeSrc;
    audioThemeTag = document.querySelector("#song");
    audioThemeVolume = 0.1;
    soundsList = [];
    playlist = [];
    playlistIndex = 0;
    isStoppedByUser = false;
    screen = "";
    userPreferences;
    constructor(soundsList, screen, userPreferences) {
        this.soundsList = soundsList;
        this.screen = screen;
        this.audioThemePath = `./sounds/themes/${screen}/`;
        this.userPreferences = userPreferences ?? null;
    }

    generateSounds() {
        this.createPlaylist();
        this.loadSong();
        if (this.screen === "ingame") this.eventsListeners();
        console.log("this.audioThemeTag.readyState:", this.audioThemeTag.readyState);
        console.log("this.audioThemeTag.error:", this.audioThemeTag.error);        
    }

    createPlaylist() {
        // console.log("this.soundsList:", this.soundsList);        
        for (let i = 0; i < this.soundsList.length; i++) {
            let theme = this.soundsList[Math.floor(Math.random() * this.soundsList.length)];
            while (this.playlist.includes(theme)) {
                // console.log("this.playlist:", this.playlist, "/ theme:", theme);       
                theme = this.soundsList[Math.floor(Math.random() * this.soundsList.length)];
            }
            this.playlist.push(theme);
        }
        console.log("this.playlist:", this.playlist);        
    }

    loadSong() {
        this.audioThemeFilename = this.playlist[this.playlistIndex];
        this.audioThemeSrc = `${this.audioThemePath}/${this.audioThemeFilename}.mp3`;
        this.audioThemeTag.src = this.audioThemeSrc;
        this.audioThemeTag.volume = this.audioThemeVolume;
        if (!this.userPreferences.soundActivation) this.audioThemeTag.autoplay = false;
    }

    eventsListeners() {
        this.audioThemeTag.addEventListener("canplaythrough", () => {
            setTimeout(() => {
                console.log("this.userPreferences.soundActivation:", this.userPreferences.soundActivation);                
                if (this.userPreferences.soundActivation) this.audioThemeTag.play();
                if (this.audioThemeTag.paused || !(this.audioThemeTag.currentTime > 0) || !this.userPreferences.soundActivation) {
                    document.querySelector(".game_menu_sound_activation").dataset.state = "off";
                    document.querySelector(".game_menu_sound_activation span").textContent = "désactivé";
                } else {
                    document.querySelector(".game_menu_sound_activation").dataset.state = "on";
                    document.querySelector(".game_menu_sound_activation span").textContent = "activé";
                }
            }, 2500);
        });
        this.audioThemeTag.addEventListener("play", (event) => {
            console.log("Playing song:", event.target.currentSrc);
        });
        this.audioThemeTag.addEventListener("error", (event) => {
            console.log("Error song:", event.target.currentSrc);
        });
        this.audioThemeTag.addEventListener("ended", (event) => {
            console.log("Song has ended:", event.target.currentSrc, " --> ", event);
            this.playlistIndex++;
            if (this.playlistIndex === this.playlist.length) this.playlistIndex = 0;
            if (!this.isStoppedByUser) this.loadSong();
        });
    }
}