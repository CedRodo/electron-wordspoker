document.querySelector(".launch_game").addEventListener("click", () => {
    socket.emit('launch-multi', usersRoom.roomId);
});

const newUserRef = generateUserRef();

// const profiles = localStorage.getItem("profiles") ?
//     JSON.parse(localStorage.getItem("profiles")) :
//     {
//         current: 1,
//         profile1: new User({
//             ref: newUserRef,
//             email: "user" + newUserRef + "@gmail.com",
//             username: "user" + newUserRef
//         })
//     };

if (localStorage.getItem("profiles")) localStorage.removeItem("profiles");

const profiles = {
        current: 1,
        profile1: new User({
            ref: newUserRef,
            email: "user" + newUserRef + "@gmail.com",
            username: "user" + newUserRef
        })
    };

let currentProfile = profiles[`profile${profiles.current}`];

const usersRoom = new Room({
    ref: 12345678,
    roomId: "test",
    hostName: "",
    visibility: "public",
    gamePreferences: new GamePreferences().getRoomPreferences(),
});

usersRoom.gamePreferences.numberOfPlayers = 0;
usersRoom.gamePreferences.numberOfVsPlayers = 0;

socket.emit('test-new-room', usersRoom);

init();

async function init() {
    let namesList = await fetch("./data/first_names_list.json")
        .then((response) => response.json())
        .then((data) => { return data });

    console.log("namesList:", namesList);

    currentProfile.gamePreferences.gameMode = "multi";
    currentProfile.gamePreferences.numberOfPlayers = 0;
    currentProfile.gamePreferences.numberOfVsPlayers = 0;
    currentProfile.userPreferences.playerName = namesList[Math.floor(Math.random() * namesList.length)].prenoms;
    currentProfile.userPreferences.avatarNumber = Math.floor(Math.random() * 80) + 1;

    socket.emit('test-new-user', currentProfile, usersRoom.roomId);
}

///////////////

function generateUserRef() {
    return (Math.floor(Math.random() * 99999999 - 10000000 + 1) + 10000000).toString();
}

function displayUsers() {
    console.log("displayUsers");

    const usersContainer = document.querySelector(".users-container");

    while (usersContainer.firstChild) {
        usersContainer.lastChild.remove();
    }

    console.log("displayUsers usersRoom:", usersRoom);

    usersRoom.usersList.forEach(user => {
        const userContainer = document.createElement("div");
        userContainer.classList.add("user-container");
        const userRefContainer = document.createElement("span");
        userRefContainer.classList.add("user_ref");
        userRefContainer.textContent = user.ref;
        const userUsernameContainer = document.createElement("span");
        userUsernameContainer.classList.add("user_username");
        userUsernameContainer.textContent = user.username;
        const userPlayerNameContainer = document.createElement("span");
        userPlayerNameContainer.classList.add("user_player_name");
        userPlayerNameContainer.textContent = user.userPreferences.playerName;
        userContainer.append(userRefContainer, userUsernameContainer, userPlayerNameContainer);

        document.querySelector(".users-container").appendChild(userContainer);
    });
}

function saveUserProfile() {
    profiles[`profile${profiles.current}`] = currentProfile;
    localStorage.setItem("profiles", JSON.stringify(profiles));
}

////////////////

socket.on('test-update-users', users => {
    console.log("test-update-users users:", users);
    for (const user in users) {
        let userAlreadyPresent;
        if (usersRoom.usersList.length > 0) {
            userAlreadyPresent = usersRoom.usersList.find(u => u.ref === users[user].ref);
        }
        if (typeof userAlreadyPresent === "undefined" || usersRoom.usersList.length === 0) {
            usersRoom.usersList.push(users[user]);
            currentProfile.gamePreferences.numberOfPlayers++;
            usersRoom.gamePreferences.numberOfPlayers++;
            currentProfile.gamePreferences.numberOfVsPlayers++;
            usersRoom.gamePreferences.numberOfVsPlayers++;
            socket.emit('test-update-room', usersRoom, "gamePreferences");
        }
    }
    console.log("test-update-users usersRoom:", usersRoom);
    socket.emit('test-update-room', usersRoom, "usersList");

    displayUsers();
});

socket.on('start-multi', async () => {
    console.log("start-multi");    
    saveUserProfile();
    usersRoom.hostName = usersRoom.usersList[0].username;
    socket.emit('test-update-room', usersRoom, "hostName");
    localStorage.setItem("room", usersRoom.ref);
    setTimeout(() => { window.location.assign("game.html"); }, 1000);
});