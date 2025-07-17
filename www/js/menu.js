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

const newUserRef = generateUserRef();

let roomInfo = {
    nbOfPlayers: 8,
    visibility: "public",
    buyIn: 1000,
    bigBlind: 20,
    backgroundNumber: 1,
    numberOfPlayers: 1
};
let roomsList = {};

const profiles = localStorage.getItem("profiles") ?
    JSON.parse(localStorage.getItem("profiles")) :
    {
        current: 0,
        profile0: new User({
            ref: newUserRef,
            email: "user" + newUserRef + "@gmail.com",
            username: "user" + newUserRef
        })
    };

// const profiles = {
//         current: 0,
//         profile0: new User({
//             ref: newUserRef,
//             email: "user" + newUserRef + "@gmail.com",
//             username: "user" + newUserRef
//         })
//     };
console.log("profiles:", profiles);
console.log("profiles.current:", profiles.current);
console.log("profiles profiles.current:", profiles[`profile${profiles.current}`]);
// let currentProfile = structuredClone(profiles[`profile${profiles.current}`]);
let currentProfile = profiles[`profile${profiles.current}`];

let newProfile = false;
const initData = new InitData();

console.log("currentProfile:", currentProfile);

socket.emit('new-user', currentProfile);

// document.querySelector(".menu_selection_game_multi_create_room").addEventListener("click", () => {
//     console.log("create room");
//     socket.emit('create-room', generateRoomId(socket.id));
// });

const sounds = new Sounds(["smoothgenestarboulevardofbrokenbeats"], "menu", currentProfile.userPreferences);
setTimeout(() => { sounds.generateSounds(); }, 3000);

let roomId = 0;

menuQuitGame.addEventListener("click", leavingApp);

function leavingApp() {
    console.log("leavingApp !!!");
    window.close();
}

menuContainer.addEventListener("pointerup", menuSelection);

async function menuSelection(event) {
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
                document.querySelector("main").classList.add("hide");
                sounds.audioThemeTag.pause();
                currentProfile.gamePreferences.gameMode = "solo";
                updatePreferences();
                // setTimeout(() => { window.location.assign("game.html"); }, 2000);
                setTimeout(() => { window.location.assign("/game"); }, 2000);
            }
            break;
        case "multi":
            console.log("multi");
            if (document.querySelector(".selection_item_display_join_button"))
                document.querySelector(".selection_item_display_join_button").remove();
            break;
        case "gamemultiroom":
            console.log("gamemultiroom");
            if (menuSelect.type === "create") {
                console.log("create");                
                currentProfile.gamePreferences.roomRef = currentProfile.ref;
                console.log("create currentProfile.gamePreferences:", currentProfile.gamePreferences);
                const gamePreferences = currentProfile.gamePreferences.getRoomPreferences();
                const room = new Room({
                    ref: currentProfile.ref,
                    roomId: generateRoomId(socket.id),
                    hostName: currentProfile.username,
                    visibility: currentProfile.gamePreferences.roomVisibility,
                    gamePreferences: gamePreferences,
                });
                console.log("create room: room");                
                currentProfile.gamePreferences.roomRef = room.ref;
                updatePreferences();
                roomActionDisplay.innerText = room.roomId;
                console.log("roomsList:", roomsList);
                await socket.emit('create-room', room);
                document.querySelector(".selection_item").setAttribute("data-item", "");
                document.querySelector(".menu_selection_game_multi_room-container").setAttribute("data-type", "create");
                break;
            };
            if (menuSelect.type === "start") {
                console.log("start multi");
                let roomRef = currentProfile.ref;
                console.log("start multi roomRef:", roomRef);
                console.log("start multi roomsList:", roomsList);
                let room;
                for (const r in roomsList) {
                    if (roomsList[r].ref === roomRef) room = roomsList[r];
                }
                if (!room) return;
                socket.emit('prepare-game-multi-start', room);
                break;
            };
            break;
        case "joinroomrooms":
            console.log("joinroomrooms");
            if (menuSelect.type === "joinpublic" || menuSelect.type === "joinprivate") {
                console.log("menuSelect.type:", menuSelect.type);
                // socket.emit('all-rooms', menuSelect.type);
                document.querySelector(".joining_display").textContent = "";
                socket.emit('enter-public-rooms');

                if (document.querySelector(".selection_item_display_join_button")) return;
                const selectionItemDisplayJoinButton = document.createElement("button");
                selectionItemDisplayJoinButton.classList.add("selection_item_display_join_button");
                selectionItemDisplayJoinButton.textContent = "Joindre";
                selectionItemDisplay.appendChild(selectionItemDisplayJoinButton);

                selectionItemDisplayJoinButton.addEventListener("pointerup", joinRoom);

                async function joinRoom() {
                    if (document.querySelector(".room-container.selected")) {
                        if (!document.querySelector(".room-container.selected").dataset.ref ||
                            document.querySelector(".room-container.selected").dataset.ref === "")
                            return;
                        let roomRef = document.querySelector(".room-container.selected").dataset.ref;
                        console.log("joinRoom roomRef:", roomRef);
                        console.log("joinRoom roomsList:", roomsList);
                        let room;
                        for (const r in roomsList) {
                            if (roomsList[r].ref === roomRef) room = roomsList[r];
                        }
                        if (!room) return;
                        const isAlreadyPresent = room.usersList.find(u => u.ref === currentProfile.ref);
                        if (typeof isAlreadyPresent === "undefined") {
                            console.log("room.gamePreferences.numberOfVsPlayers:", room.gamePreferences.numberOfVsPlayers);
                            room.gamePreferences.numberOfVsPlayers++;
                            updatePreferences();
                            room.usersList.push(currentProfile);
                            console.log("isJoined room:", room);
                            await socket.emit('join-room', room);
                            socket.emit('enter-room-lobby', room);
                            document.querySelector(".menu-container").setAttribute("data-display", "gamemultiroom");
                            document.querySelector(".menu_selection_game_multi_room-container").setAttribute("data-type", "");
                        }
                    }
                    // if (document.querySelector(".selection_item_display_join_button"))
                    //     document.querySelector(".selection_item_display_join_button").remove();
                }               
            };
            break;
        case "joinroom":
            console.log("joinroom");
            console.log("joinroom menuSelect:", menuSelect);
            if (menuSelect.element.classList.contains("menu_selection_game_multi_join_room")) {
                console.log("joinroom");
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
                currentProfile.gamePreferences.roomVisibility = "public";
            }
            if (event.currentTarget === selectionItemNext) {
                currentProfile.gamePreferences.roomVisibility = "private";
            }
            selectionItemDisplay.textContent = currentProfile.gamePreferences.roomVisibility === "private" ? "privée" : "publique";
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
        selectionItemDisplayInputName.id = "player_name";
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

function appendRoom(rooms) {
    console.log("appendRoom rooms:", rooms);

    // if (document.getElementById(room.roomId)) return;
    
    const roomsListElement = document.querySelector(".menu_selection_game_multi_join_room_rooms_list tbody");

    while (Array.from(roomsListElement.querySelectorAll(".room-container"))[0]) {
        Array.from(roomsListElement.querySelectorAll(".room-container")).at(-1).remove();
    }

    rooms.forEach(room => {
        const roomContainer = document.createElement("tr");
        roomContainer.classList.add("room-container");
        roomContainer.setAttribute("data-ref", room.ref);
        roomContainer.setAttribute("id", room.roomId);
        const roomHost = document.createElement("td");
        roomHost.classList.add("room_host");
        roomHost.textContent = room.hostName;
        const roomBackgroundContainer = document.createElement("td");
        roomBackgroundContainer.classList.add("room_background-container");
        const roomBackground = document.createElement("img");
        roomBackground.classList.add("room_background");
        roomBackground.src = "./assets/img/backgrounds/bg" + room.gamePreferences.backgroundNumber + ".jpg";
        roomBackgroundContainer.appendChild(roomBackground);
        const roomNbOfPlayersContainer = document.createElement("td");
        roomNbOfPlayersContainer.classList.add("room_nb_of_players-container");
        const roomNbJoiningPlayers = document.createElement("span");
        roomNbJoiningPlayers.classList.add("room_nb_joining_players");
        roomNbJoiningPlayers.textContent = room.gamePreferences.numberOfVsPlayers;
        const roomPlayersSeparator = document.createElement("span");
        roomPlayersSeparator.classList.add("room_players_separator");
        roomPlayersSeparator.textContent = "/";
        const roomNbMaxPlayers = document.createElement("span");
        roomNbMaxPlayers.classList.add("room_nb_max_players");
        roomNbMaxPlayers.textContent = room.gamePreferences.numberOfPlayers;
        roomNbOfPlayersContainer.append(roomNbJoiningPlayers, roomPlayersSeparator, roomNbMaxPlayers);
        const roomBuyIn = document.createElement("td");
        roomBuyIn.classList.add("room_buyin");
        roomBuyIn.textContent = room.gamePreferences.buyIn;

        roomContainer.append(roomHost, roomBackgroundContainer, roomNbOfPlayersContainer, roomBuyIn);

        roomContainer.addEventListener("pointerup", selectRoom);

        function selectRoom() {
            document.querySelectorAll(".room-container").forEach(c => c.classList.remove("selected"));
            roomContainer.classList.add("selected");
            const isJoined = confirm("Voulez-vous rejoindre cette salle ?");
            if (isJoined) {                
                const isAlreadyPresent = room.usersList.find(r => r.ref === currentProfile.ref);
                if (typeof isAlreadyPresent === "undefined"){
                    console.log("room.gamePreferences.numberOfVsPlayers:", room.gamePreferences.numberOfVsPlayers);                    
                    room.gamePreferences.numberOfVsPlayers++;
                    room.usersList.push(currentProfile);
                    console.log("isJoined room:", room);                    
                    socket.emit('join-room', room);
                }
            } else {
                roomContainer.classList.remove("selected");
            }
        }

        function selectRoom(event) {
            document.querySelectorAll(".room-container").forEach(c => c.classList.remove("selected"));
            roomContainer.classList.add("selected");
        }

        roomsListElement.appendChild(roomContainer);
    })
}

function appendUsers(room) {
    console.log("appendUsers room:", room);
    if (room.usersList.length === 0) return;
    console.log("appendUsers room.usersList:", room.usersList);

    const roomPlayersListElement = document.querySelector(".menu_selection_game_multi_room_players_list tbody");

    while (Array.from(roomPlayersListElement.querySelectorAll(".room_user-container"))[0]) {
        Array.from(roomPlayersListElement.querySelectorAll(".room_user-container")).at(-1).remove();
    }

    room.usersList.forEach(user => {
        const roomUserContainer = document.createElement("tr");
        roomUserContainer.classList.add("room_user-container");
        if (user.username === room.hostName) roomUserContainer.classList.add("host");
        if (user.ref === currentProfile.ref) roomUserContainer.classList.add("you");
        roomUserContainer.setAttribute("data-ref", user.ref);
        roomUserContainer.setAttribute("username", user.username);
        const roomUserUsername = document.createElement("td");
        roomUserUsername.classList.add("room_user_username");
        roomUserUsername.textContent = user.username;
        const roomUserAvatarContainer = document.createElement("td");
        roomUserAvatarContainer.classList.add("room_user_avatar-container");
        const roomUserAvatar = document.createElement("img");
        roomUserAvatar.classList.add("room_user_avatar");
        roomUserAvatar.src = "./assets/img/avatars/avatar" + user.userPreferences.avatarNumber + ".png";
        roomUserAvatarContainer.appendChild(roomUserAvatar);
        const roomUserPlayerName = document.createElement("td");
        roomUserPlayerName.classList.add("room_user_playername");
        roomUserPlayerName.textContent = user.userPreferences.playerName;
        const roomUserRank = document.createElement("td");
        roomUserRank.classList.add("room_user_rank");
        roomUserRank.textContent = user.playerDetails.rank;
        const roomUserGameStatsContainer = document.createElement("td");
        roomUserGameStatsContainer.classList.add("room_user_game_stats-container");
        const roomUserNbOfWins = document.createElement("span");
        roomUserNbOfWins.classList.add("room_user_nb_of_wins");
        roomUserNbOfWins.textContent = user.playerDetails.playStats.win;
        const roomUserGameStatsSeparator = document.createElement("span");
        roomUserGameStatsSeparator.classList.add("room_user_game_stats_separator");
        roomUserGameStatsSeparator.textContent = "/";
        const roomUserNbOfGames = document.createElement("span");
        roomUserNbOfGames.classList.add("room_user_nb_of_games");
        roomUserNbOfGames.textContent = user.playerDetails.playStats.nbOfGames;
        roomUserGameStatsContainer.append(roomUserNbOfWins, roomUserGameStatsSeparator, roomUserNbOfGames);

        roomUserContainer.append(roomUserUsername, roomUserAvatarContainer, roomUserPlayerName, roomUserRank, roomUserGameStatsContainer);

        roomPlayersListElement.appendChild(roomUserContainer);
    });
}

function loadProfile(profileNumber) {
    profiles.current = profileNumber;
    // currentProfile = structuredClone(profiles[`profile${profiles.current}`]);
    currentProfile = profiles[`profile${profiles.current}`];
    newProfile = false;
    updatePreferences();
}

function updatePreferences(profileNumber) {
    if (profileNumber) {
        // profiles[`profile${profileNumber}`] = structuredClone(currentProfile);
        profiles.current = profileNumber;
    }
    profiles[`profile${profiles.current}`] = currentProfile;
    socket.emit('check-playerName-change', currentProfile.userPreferences.playerName);
    localStorage.setItem("profiles", JSON.stringify(profiles));
}

function showNotifications(notification) {
    profileActionDisplay.innerText = notification;
}

function generateRoomId(id) {
    roomId = "#" + id.substring(0, 8);
    console.log("roomId:", roomId);
    return roomId;
}

function generateUserRef() {
    return (Math.floor(Math.random() * 99999999 - 10000000 + 1) + 10000000).toString();
}

// ONLINE

socket.on('room-creation', room => {
    console.log("room-creation:", room);
    document.querySelector(".room_id_display").dataset.id = room.roomId;
    socket.emit('enter-room-lobby', room);
});

socket.on('room-to-update', room => {
    console.log("room-to-update:", room);
    socket.emit('update-room', room);
});

socket.on('update-rooms-list', rooms => {
    console.log("update-rooms-list:", rooms);
    roomsList = rooms;
    const publicRooms = [];
    for (const room in rooms) {
        console.log("rooms[room]:", rooms[room]);
        if (rooms[room].visibility === "public") publicRooms.push(rooms[room]);
    }
    console.log("update-rooms-list publicRooms:", publicRooms);
    appendRoom(publicRooms);
});

socket.on('display-room-users', room => {
    console.log("display-room-users room:", room);
    let roomToFind;
    for (const r in roomsList) {
        if (roomsList[r].ref === room.ref) roomToFind = roomsList[r];
    }
    console.log("display-room-users roomToFind:", roomToFind);
    // if (!roomToFind) return;
    appendUsers(room);
});

socket.on('display-public-rooms', rooms => {
    console.log("display-public-rooms:", rooms);
});

socket.on('room-joining', room => {
    console.log("room-joining:", room);
});

socket.on('start-game-multi', roomRef => {
    console.log("start-game-multi");
    setTimeout(() => {
        localStorage.setItem("room", roomRef);
        let room;
        for (const r in roomsList) {
            if (roomsList[r].ref === roomRef)
                room = roomsList[r];
        }
        console.log("start-game-multi room:", room);
        if (!room) return;
        for (const prop in room.gamePreferences) {
            currentProfile.gamePreferences[prop] = room.gamePreferences[prop];
        }
        currentProfile.gamePreferences.roomRef = roomRef;
        currentProfile.gamePreferences.gameMode = "multi";
        console.log("start-game-multi currentProfile:", currentProfile);        
        updatePreferences();
        // window.location.assign("game.html");
        window.location.assign("/game");
    }, 1000);
});

socket.on('show-notification', data => {
    console.log("show-notification:", data);
    switch (data.type) {
        case "create":
            document.querySelector(".room_action_display").textContent = data.object.username + " a créé la salle";
            break;
        case "join":
            document.querySelector(".room_action_display").textContent = data.object.username + " a joint la salle";
            break;
    }
});

socket.on('user-disconnecting', (roomId, userRef) => {
    console.log("user-disconnecting roomId/userRef:", roomId, userRef);
    let room;
    for (const r in roomsList) {
        if (roomsList[r].roomId === roomId) room = roomsList[r];
    }
    console.log("user-disconnecting room:", room);
    if (!room) return;
    let username = "";
    let indexToRemove = "";
    room.usersList.forEach((u, index) => {
        if (u.ref === userRef) {
            username = u.username;
            indexToRemove = index;
        }        
    });
    room.usersList.splice(indexToRemove, 1);
    console.log("menu-update-users user:", username);
    console.log("menu-update-users room:", room);
    console.log("menu-update-users room.hostName => username:", room.hostName, username);
    if (room.hostName === username) {
        console.log("menu-update-users room.hostName === username");
        room.usersList.forEach(u => u.gamePreferences.roomRef = "");
        socket.emit('remove-room', room);
    } else {
        console.log("menu-update-users room.hostName !== username");
        socket.emit('enter-room-lobby', room);
    }
});

socket.on('close-lobby', room => {
    console.log("close-lobby:", room);
    if (document.querySelector(".menu-container").dataset.display === "gamemultiroom") {
        document.querySelector(".menu-container").dataset.display = "joinroom";
        document.querySelector(".room_action_display").textContent = "La salle a été fermée";
    }
    console.log("close-lobby roomsList before:", roomsList);
    for (const r in roomsList) {
        if (roomsList[r].ref === room.ref) delete roomsList[r];
    }
    console.log("close-lobby roomsList after:", roomsList);    
});

socket.on('user-connected', name => {
    console.log("user-connected:", name);
    currentProfile.gamePreferences.playerId = socket.id;
    console.log("playerId:", currentProfile.gamePreferences.playerId);
});

socket.on('user-disconnected', name => {
    console.log("user-disconnected:", name);
    showNotifications(`${name} déconnecté`);
});



