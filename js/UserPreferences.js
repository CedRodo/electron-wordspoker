class UserPreferences {
    playerName;
    avatarNumber;
    gender;
    soundActivation;
    fullscreenActivation;
    constructor(playerName, avatarNumber, gender, soundActivation, fullscreenActivation) {
        this.playerName = playerName ?? "Joe";
        this.avatarNumber = avatarNumber ?? 1;
        this.gender = gender ?? "male";
        this.soundActivation = soundActivation ?? true;
        this.fullscreenActivation = fullscreenActivation ?? false;
    }
}