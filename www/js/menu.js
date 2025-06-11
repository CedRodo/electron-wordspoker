
const menuContainer = document.querySelector(".menu-container");
const selectionItem = document.querySelector(".selection_item");
const selectionItemDisplay = document.querySelector(".selection_item_display");
const selectionItemPrevious = document.querySelector(".selection_item_previous");
const selectionItemNext = document.querySelector(".selection_item_next");
const menuQuitGame = document.querySelector(".menu_quit_game");
const profileActionDisplay = document.querySelector(".profile_action_display");
const roomActionDisplay = document.querySelector(".room_action_display");

let preventActions = false;

const menuSelectionElements = new MenuSelectionElements();

console.log("menuSelectionElements:", menuSelectionElements);


const profiles = localStorage.getItem("profiles") ? JSON.parse(localStorage.getItem("profiles")) : { current: 0, profile0: { userPreferences: new UserPreferences(), gamePreferences: new GamePreferences() }};
console.log("profiles:", profiles);
console.log("profiles.current:", profiles.current);
console.log("profiles profiles.current:", profiles[`profile${profiles.current}`]);
let currentProfile = structuredClone(profiles[`profile${profiles.current}`]);
let newProfile = false;
const initData = new InitData();

console.log("currentProfile:", currentProfile);

const sounds = new Sounds(["smoothgenestarboulevardofbrokenbeats"], "menu", currentProfile.userPreferences);
setTimeout(() => { sounds.generateSounds(); }, 3000);

const socket = io('http://localhost:3000');

const users = {};
let roomId = 0;

menuQuitGame.addEventListener("click", leavingApp);

function leavingApp() {
    console.log("leavingApp !!!");
    window.close();
}

menuContainer.addEventListener("pointerup", menuSelection);

function menuSelection(event) {
    if (preventActions || !event.target.closest(".menu_selection")) return;
    let menuSelect = { element: null, display: null, item: null };
    console.log("event.target:", event.target);
    for (const prop in menuSelectionElements) {
        // console.log("prop element:", menuSelectionElements[prop]["element"]);
        if (menuSelectionElements[prop]["element"] === event.target ||
            menuSelectionElements[prop]["element"] === event.target.parentNode) {   
            console.log("prop:", menuSelectionElements[prop]);          
            menuSelect.element = menuSelectionElements[prop]["element"];
            menuSelect.display = menuSelectionElements[prop]["display"] ?? null;
            menuSelect.item = menuSelectionElements[prop]["item"] ?? null;
            menuSelect.type = menuSelectionElements[prop]["type"] ?? null;
            menuSelect.target = menuSelectionElements[prop]["target"] ?? null;
        };
    }

    // console.log("menuSelect:", menuSelect);
    profileActionDisplay.textContent = "";
    
    if (typeof menuSelect.display !== "undefined" && menuSelect.display !== null)
        menuContainer.dataset.display = menuSelect.display;

    if (typeof menuSelect.type !== "undefined" && menuSelect.type !== null && menuSelect.type !== "") {
        console.log("menuSelect.target:", menuSelect.target);
        if (menuSelect.target) document.querySelector("." + menuSelect.target).setAttribute("data-type", menuSelect.type);
        newProfile = menuSelect.type === "new" || (newProfile && (menuSelect.display === "profile" || !menuSelect.display)) ? true : false;
    }

    switch (menuSelect.display) {
        case "profiles":
            console.log("showProfiles");
            showProfiles();
            break;
        case "gamesettings":
            if (menuSelect.type === "start") {
                // case "createroom":
                //     console.log("createroom");
                //     currentProfile.gamePreferences.roomId = `#${socket.id.substring(0, 8)}`;
                //     roomActionDisplay.innerText = currentProfile.gamePreferences.roomId;
                //     socket.emit('create-room', currentProfile.gamePreferences);
                //     break;
                    // document.querySelector(".sfx-continue").play();
                preventActions = true;
                main.classList.add("hide");
                sounds.audioThemeTag.pause();
                updatePreferences(profiles.current);
                setTimeout(() => { window.location.assign("game.html"); }, 2000);
            }
            break;
        case "gamemultiroom":
            console.log("gamemultiroom");
            if (menuSelect.type === "create") {
                console.log("create");
                currentProfile.gamePreferences.roomId = `#${socket.id.substring(0, 8)}`;
                roomActionDisplay.innerText = currentProfile.gamePreferences.roomId;
                appendRoom(currentProfile.gamePreferences);
                socket.emit('create-room', currentProfile.gamePreferences);
                break;
            };
            break;
        case "joinroom":
            if (menuSelect.element.classList.contains("menu_selection_game_multi_join_room")) {
                console.log("joinroom");
                // socket.emit('join-room');
            };
            break;
    }

    if (menuSelect.element.classList.contains("menu_selection_game_profiles_profile")) {
        if (menuSelect.element.querySelector(".menu_selection_game_profile_empty")) {
            menuSelect.item = "";
        } else {
            menuSelect.display = "profile";
            menuContainer.dataset.display = menuSelect.display;
            menuSelect.item = "loadprofile";
            loadProfile(menuSelect.element.dataset.pflnb);
            profileActionDisplay.textContent = "Profil chargé";
        }
    }
        

    if (typeof menuSelect.item !== "undefined" && menuSelect.item !== null) {
        console.log("menuSelect.item:", menuSelect.item);
        console.log("menuSelect.display:", menuSelect.display);
        console.log("newProfile before:", newProfile);
        selectionItem.dataset.item = menuSelect.item;
        console.log("newProfile after:", newProfile);
        // menuSelect.element.parentNode.querySelectorAll(".menu_selection").forEach(element => element.classList.remove("selected"));
        menuContainer.querySelectorAll(".menu_selection").forEach(element => element.classList.remove("selected"));
        menuSelect.element.classList.add("selected");

        switch (menuSelect.item) {
            case "nbofplayers":
                selectionItemDisplay.textContent = currentProfile.gamePreferences.numberOfPlayers;
                break;
            case "buyin":
                selectionItemDisplay.textContent = currentProfile.gamePreferences.buyIn;
                break;
            case "background":
                selectionItemDisplay.textContent = "";
                selectionItemDisplay.style.setProperty("--url", `url('../assets/img/backgrounds/bg${currentProfile.gamePreferences.backgroundNumber}.jpg')`);
                break;
            case "name":
                selectionItemDisplay.textContent = currentProfile.userPreferences.playerName;
                break;
            case "avatar":
                console.log("userPreferences.avatarNumber:", currentProfile.userPreferences.avatarNumber);
                selectionItemDisplay.textContent = "";
                selectionItemDisplay.style.setProperty("--url", `url('../assets/img/avatars/avatar${currentProfile.userPreferences.avatarNumber}.png')`);
                break;
            case "roomid":
                console.log("roomid:", currentProfile.gamePreferences.roomId);
                selectionItemDisplay.textContent = currentProfile.gamePreferences.roomId;
                break;
            case "roomtype":
                selectionItemDisplay.textContent = "publique";
                break;
            case "show":
                const menuSelectionGameShowProfileNumber = document.querySelector(".menu_selection_game_show_profile_number");
                const menuSelectionGameShowProfileName = document.querySelector(".menu_selection_game_show_profile_name");
                const menuSelectionGameShowProfileAvatar = document.querySelector(".menu_selection_game_show_profile_avatar");
                if (profiles.current == 0) {
                    menuSelect.item = "";
                    selectionItem.dataset.item = menuSelect.item;
                    menuSelectionGameShowProfileNumber.innerText = "Aucun profil";
                    menuSelectionGameShowProfileName.innerText = "";
                    menuSelectionGameShowProfileAvatar.src = "";
                } else {
                    const profileUserPreferences = profiles[`profile${profiles.current}`]['userPreferences'];
                    menuSelectionGameShowProfileNumber.innerText = "Profil n°" + profiles.current;
                    menuSelectionGameShowProfileName.innerText = profileUserPreferences.playerName;
                    menuSelectionGameShowProfileAvatar.src = "./assets/img/avatars/avatar" + profileUserPreferences.avatarNumber + ".png";                    
                }
                break;
            case "saveprofile":
                // document.querySelector(".sfx-continue").play();
                let profileNumberToSelect;
                let slotAvailable = false;
                for (let i = 1; i <= 5; i++) {
                    if (typeof profiles[`profile${i}`] === "undefined" && !slotAvailable) {
                        profileNumberToSelect = i;
                        slotAvailable = true;
                    }
                }
                newProfile = false;
                if (slotAvailable) {
                    updatePreferences(profileNumberToSelect);
                }
                profileActionDisplay.textContent = slotAvailable ? "Profil sauvegardé" : "Maximum dépassé";
                break;
            case "editprofile":
                // document.querySelector(".sfx-continue").play();
                updatePreferences(profiles.current);
                profileActionDisplay.textContent = "Profil modifié";
                break;
            case "deleteprofile":
                if (profiles.current === 0) {
                    console.log("deleteprofile profiles.current === 0");                    
                    profileActionDisplay.textContent = "Aucun profil à supprimer";
                } else {
                    console.log("deleteprofile profiles.current !== 0");
                    if (!confirm("Êtes-vous sûr de vouloir supprimer le profil ?")) return;                   
                    delete profiles[`profile${profiles.current}`];
                    profiles.current = 0;
                    updatePreferences();
                    profileActionDisplay.textContent = "Profil supprimé";
                }
                break;
            case "sound":
                selectionItemDisplay.textContent = currentProfile.userPreferences.soundActivation ? "activé" : "désactivé";
                break;
            case "fullscreen":
                selectionItemDisplay.textContent = currentProfile.userPreferences.fullscreenActivation ? "activé" : "désactivé";
                break;
        }
    }
 
}

selectionItemPrevious.addEventListener("pointerup", changeDisplay);
selectionItemNext.addEventListener("pointerup", changeDisplay);

function changeDisplay(event) {
    if (preventActions) return;
    let imagePath;
    let imageNumber;
    let imageExtension;
    switch (selectionItem.dataset.item) {
        case "avatar":
            const avatarMaxNumber = 81;
            imagePath = "../assets/img/avatars/avatar";
            imageNumber = currentProfile.userPreferences.avatarNumber;
            if (event.currentTarget === selectionItemPrevious) {
                imageNumber - 1 > 0 ? imageNumber-- : imageNumber = avatarMaxNumber;
            }
            if (event.currentTarget === selectionItemNext) {
                imageNumber + 1 <= avatarMaxNumber ? imageNumber++ : imageNumber = 1;
            }
            imageExtension = ".png";
            currentProfile.userPreferences.avatarNumber = imageNumber;
            selectionItemDisplay.style.setProperty("--url", `url('${imagePath}${imageNumber}${imageExtension}')`);
            if (initData.avatarsList.male.includes(imageNumber)) currentProfile.userPreferences.gender = "male";
            if (initData.avatarsList.female.includes(imageNumber)) currentProfile.userPreferences.gender = "female";
            break;
        case "background":
            const backgroundMaxNumber = 86;
            imagePath = "../assets/img/backgrounds/bg";
            imageNumber = currentProfile.gamePreferences.backgroundNumber;
            if (event.currentTarget === selectionItemPrevious) {
                imageNumber - 1 > 0 ? imageNumber-- : imageNumber = backgroundMaxNumber;
            }
            if (event.currentTarget === selectionItemNext) {
                imageNumber + 1 <= backgroundMaxNumber ? imageNumber++ : imageNumber = 1;
            }
            imageExtension = ".jpg";
            currentProfile.gamePreferences.backgroundNumber = imageNumber;
            selectionItemDisplay.style.setProperty("--url", `url('${imagePath}${imageNumber}${imageExtension}')`);
            break;
        case "nbofplayers":
            const playerMaxNumber = 8;
            let nbOfPlayers = currentProfile.gamePreferences.numberOfPlayers;
            if (event.currentTarget === selectionItemPrevious) {
                nbOfPlayers - 1 > 0 ? nbOfPlayers-- : nbOfPlayers = 1;
            }
            if (event.currentTarget === selectionItemNext) {
                nbOfPlayers + 1 <= playerMaxNumber ? nbOfPlayers++ : nbOfPlayers = playerMaxNumber;
            }
            currentProfile.gamePreferences.numberOfPlayers = nbOfPlayers;
            selectionItemDisplay.textContent = nbOfPlayers;
            break;
        case "buyin":
            const buyInMaxNumber = 5000;
            const buyInMinNumber = 500;
            const incrementation = 250;
            let buyIn = currentProfile.gamePreferences.buyIn;
            if (event.currentTarget === selectionItemPrevious) {
                buyIn - incrementation > buyInMinNumber ? buyIn -= incrementation : buyIn = buyInMinNumber;
            }
            if (event.currentTarget === selectionItemNext) {
                buyIn + incrementation <= buyInMaxNumber ? buyIn += incrementation : buyIn = buyInMaxNumber;
            }
            currentProfile.gamePreferences.buyIn = buyIn;
            selectionItemDisplay.textContent = buyIn;
            break;
        case "roomtype":
            if (event.currentTarget === selectionItemPrevious) {
                currentProfile.gamePreferences.roomType = "publique";
            }
            if (event.currentTarget === selectionItemNext) {
                currentProfile.gamePreferences.roomType = "privée";
            }
            selectionItemDisplay.textContent = currentProfile.gamePreferences.roomType;
            break;
        case "sound":
            if (event.currentTarget === selectionItemPrevious) {
                currentProfile.userPreferences.soundActivation = false;
                sounds.audioThemeTag.pause();
            }
            if (event.currentTarget === selectionItemNext) {
                currentProfile.userPreferences.soundActivation = true;
                sounds.audioThemeTag.play();
            }
            selectionItemDisplay.textContent = currentProfile.userPreferences.soundActivation ? "activé" : "désactivé";
            updatePreferences(profiles.current);
            break;
        case "fullscreen":
            if (event.currentTarget === selectionItemPrevious) {
                currentProfile.userPreferences.fullscreenActivation = false;
                document.exitFullscreen();
            }
            if (event.currentTarget === selectionItemNext) {
                currentProfile.userPreferences.fullscreenActivation = true;
                document.documentElement.requestFullscreen().catch((err) => {
                    alert(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
                });
            }
            selectionItemDisplay.textContent = currentProfile.userPreferences.fullscreenActivation ? "activé" : "désactivé";
            updatePreferences(profiles.current);
            break;
            
    }

}

selectionItemDisplay.addEventListener("pointerup", profileAction);

function profileAction() {
    if (preventActions) return;
    if (selectionItem.dataset.item === "name") {
        if (document.querySelector(".selection_item_display_input_name")) return;
        const selectionItemDisplayInputName = document.createElement("input");
        selectionItemDisplayInputName.classList.add("selection_item_display_input_name");
        selectionItemDisplayInputName.type = "text";
        console.log("selectionItemDisplay.textContent:", selectionItemDisplay.textContent);        
        console.log("userPreferences.playerName:", currentProfile.userPreferences.playerName);        
        selectionItemDisplayInputName.value = currentProfile.userPreferences.playerName;
        selectionItemDisplay.textContent = "";
        selectionItemDisplay.appendChild(selectionItemDisplayInputName);
        
        selectionItemDisplayInputName.addEventListener("blur", setNameValue);

        function setNameValue(event) {
            currentProfile.userPreferences.playerName = event.currentTarget.value;
            selectionItemDisplay.textContent = event.currentTarget.value;
            // updatePreferences();
            selectionItemDisplayInputName.removeEventListener("blur", setNameValue);
            selectionItemDisplayInputName.remove();
        }
    }
    if (selectionItem.dataset.action === "edit") {

    }
}

function showProfiles() {
    for (let i = 1; i <= 5; i++) {
        const menuSelectionGameProfilesProfile = document.querySelector(`[data-pflnb="${i}"]`);
        while (menuSelectionGameProfilesProfile.firstChild) {
            menuSelectionGameProfilesProfile.lastChild.remove();
        }
        const menuSelectionGameProfileNumber = document.createElement("div");
        menuSelectionGameProfileNumber.classList.add("menu_selection_game_profile_number");
        menuSelectionGameProfileNumber.innerText = i + ".";
        console.log("showProfiles profiles:", profiles);
        console.log("showProfiles profile:", profiles[`profile${i}`]);
        if (typeof profiles[`profile${i}`] !== "undefined" && profiles[`profile${i}`] !== null) {
            console.log("not empty");
            const profileUserPreferences = profiles[`profile${i}`]['userPreferences'];
            console.log("profileUserPreferences:", profileUserPreferences);            
            const profileAvatarContainer = document.createElement("div");
            profileAvatarContainer.classList.add("menu_selection_game_profile_avatar-container");
            const profileAvatar = document.createElement("img");
            profileAvatar.classList.add("menu_selection_game_profile_avatar");
            profileAvatar.src = "./assets/img/avatars/avatar" + profileUserPreferences.avatarNumber + ".png";
            profileAvatarContainer.appendChild(profileAvatar);
            const profileName = document.createElement("div");
            profileName.classList.add("menu_selection_game_profile_name");
            profileName.innerText = profileUserPreferences.playerName;
            menuSelectionGameProfilesProfile.append(menuSelectionGameProfileNumber, profileAvatarContainer, profileName);
        } else {
            console.log("empty");            
            const menuSelectionGameProfileEmpty = document.createElement("div");
            menuSelectionGameProfileEmpty.classList.add("menu_selection_game_profile_empty");
            menuSelectionGameProfileEmpty.innerText = "Aucun profil";
            menuSelectionGameProfilesProfile.append(menuSelectionGameProfileNumber, menuSelectionGameProfileEmpty);
        }
    }
}

function appendRoom(roomData) {
    console.log("appendRoom roomData:", roomData);
    
    const roomsList = document.querySelector(".menu_selection_game_multi_join_room_rooms_list");
    
    const roomContainer = document.createElement("div");
    roomContainer.classList.add("room-container");
    const roomId = document.createElement("div");
    roomId.classList.add("room_id");
    roomId.textContent = roomData.roomId;
    const roomBackgroundContainer = document.createElement("div");
    roomBackgroundContainer.classList.add("room_background-container");
    const roomBackground = document.createElement("img");
    roomBackground.classList.add("room_background");
    roomBackground.src = "./assets/img/backgrounds/bg" + roomData.backgroundNumber + ".jpg";
    roomBackgroundContainer.appendChild(roomBackground);
    const roomNbOfPlayersContainer = document.createElement("div");
    roomNbOfPlayersContainer.classList.add("room_nb_of_players-container");
    const roomNbJoiningPlayers = document.createElement("span");
    roomNbJoiningPlayers.classList.add("room_nb_joining_players");
    roomNbJoiningPlayers.textContent = 1;
    const roomPlayersSeparator = document.createElement("span");
    roomPlayersSeparator.classList.add("room_players_separator");
    roomPlayersSeparator.textContent = "/";
    const roomNbMaxPlayers = document.createElement("span");
    roomNbMaxPlayers.classList.add("room_nb_max_players");
    roomNbMaxPlayers.textContent = roomData.nbOfPlayers;
    roomNbOfPlayersContainer.append(roomNbJoiningPlayers, roomPlayersSeparator, roomNbMaxPlayers);
    const roomBuyIn = document.createElement("div");
    roomBuyIn.classList.add("room_buyin");
    roomBuyIn.textContent = roomData.buyIn;
    // const roomAvatarContainer = document.createElement("div");
    // roomAvatarContainer.querySelector(".room_avatar-container");
    // const roomAvatar = document.createElement("img");
    // roomAvatar.querySelector(".room_avatar");
    // roomAvatar.src = "./assets/img/avatars/avatar" + roomData.avatarNumber + ".png";
    // roomAvatarContainer.appendChild(roomAvatar);
    // const roomHostPlayerName = document.createElement("div");
    // roomHostPlayerName.querySelector(".room_host_player_name");
    // roomHostPlayerName.textContent = roomData.hostPlayerName;

    // roomContainer.append(roomId, roomBackgroundContainer, roomNbOfPlayersContainer, roomBuyIn, roomAvatarContainer, roomHostPlayerName);
    roomContainer.append(roomId, roomBackgroundContainer, roomNbOfPlayersContainer, roomBuyIn);

    roomsList.appendChild(roomContainer);
}

function loadProfile(profileNumber) {
    profiles.current = profileNumber;
    currentProfile = structuredClone(profiles[`profile${profiles.current}`]);
    newProfile = false;
    updatePreferences();
}

function updatePreferences(profileNumber) {
    if (profileNumber) {
        profiles[`profile${profileNumber}`] = structuredClone(currentProfile);
        profiles.current = profileNumber;
    }
    socket.emit('check-playerName-change', currentProfile.userPreferences.playerName);
    localStorage.setItem("profiles", JSON.stringify(profiles));
}

// ONLINE

socket.on('room-creation', id => {
    console.log("room-creation:", id);
    roomActionDisplay.textContent = id;
});

// socket.on('room-join', id => {
//     console.log("room-join:", id);
//     roomActionDisplay.textContent = id;
//     currentProfile.gamePreferences.roomId = id;
// });

// socket.emit('user-connected', currentProfile.userPreferences.playerName);
socket.emit('new-user', currentProfile.userPreferences.playerName);

socket.on('user-connected', name => {
    console.log("user-connected:", name);
    currentProfile.gamePreferences.playerId = socket.id;
    console.log("playerId:", currentProfile.gamePreferences.playerId);
});

socket.on('user-disconnected', name => {
    console.log("user-disconnected:", name);
    showNotifications(`${name} déconnecté`);
});

// socket.on('new-user', name => {
//     console.log("new-user:", name);
//     console.log("users:", users);
//     users[socket.id] = name;
//     socket.emit('user-connected', name);
// });

// let connection = true;
// connectionButton.addEventListener('click', () => {
//   console.log("socket:", socket);
//   console.log("connection:", connection);
//   // console.log("socket broadcast:", socket.broadcast);
//   if (connection === true) {
//     console.log("disconnect");
//     socket.disconnect();
//     connectionButton.innerText = "Connect";
//     connection = false;
//     return;
//   }
//   if (connection === false) {
//     console.log("connect");
//     socket.connect();
//     connectionButton.innerText = "Disconnect";
//     connection = true;
//   }
// });

function showNotifications(notification) {
    profileActionDisplay.innerText = notification;
}

function generateRoomId(userId) {
    roomId = "#" + userId.substring(0, 8);
    console.log("roomId:", roomId);
    return roomId;
  }



