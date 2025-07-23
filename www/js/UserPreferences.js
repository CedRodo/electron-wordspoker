class UserPreferences {
    playerName;
    avatarNumber;
    gender;
    soundActivation;
    fullscreenActivation;
    colorOn;
    constructor(playerName, avatarNumber, gender, soundActivation, fullscreenActivation, colorOn) {
        this.playerName = playerName ?? "Joe";
        this.avatarNumber = avatarNumber ?? 1;
        this.gender = gender ?? "male";
        this.soundActivation = soundActivation ?? true;
        this.fullscreenActivation = fullscreenActivation ?? false;
        this.colorOn = colorOn ?? "letters";
    }
}