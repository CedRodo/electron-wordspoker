class User {
    ref;
    username;
    email;
    password;
    userPreferences;
    gamePreferences;
    constructor(userData) {
        this.ref = userData.ref;
        this.email = userData.email;
        this.username = userData.username;
        this.userPreferences = new UserPreferences();
        this.gamePreferences = new GamePreferences();
    }
}