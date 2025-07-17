class Room {
    ref;
    roomId;
    hostName;
    visibility;
    gamePreferences;
    usersList = [];
    nbOfUsers = 0;

    constructor(roomData) {
        this.ref = roomData.ref;
        this.roomId = roomData.roomId;
        this.hostName = roomData.hostName;
        this.visibility = roomData.visibility;
        this.gamePreferences = roomData.gamePreferences;
    }

    addUser(user) {
        console.log("addUser user:", user);
        const userAlreadyPresent = this.getUsers().find(u => u.ref === user.ref);
        let isAdded = false;
        if (typeof userAlreadyPresent === "undefined") {
            this.getUsers().push(user);
            isAdded = true;
        }
        console.log("addUser usersList:", this.getUsers());
        return isAdded;
    }

    removeUser(user) {
        let indexOfUser = this.getUsers().indexOf(user);
        if (indexOfUser > 0) this.getUsers().splice(indexOfUser, 1);
    }

    getUsers() {
        return this.usersList;
    }

    setUsers(users) {
        this.usersList = users;
    }

    updateUserInUsersList(user) {
        this.getUsers().forEach(u => {
            if (user.ref === u.ref) {
                u = user;
            }
        });
        console.log("updateUserInUsersList this.getUsers():", this.getUsers());
    }
}