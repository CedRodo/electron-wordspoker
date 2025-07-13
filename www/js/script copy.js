const socket = io('http://localhost:3000');
const roomIdDisplay = document.querySelector(".room_id_display");


const users = {};
let roomId = 0;
const name = currentProfile.userPreferences.playerName;

document.querySelector(".menu_selection_game_multi_create_room").addEventListener("click", () => {
  console.log("create room");  
  socket.emit('create-room', generateRoomId(socket.id));
});

socket.on('room-creation', id => {
  console.log("room-creation:", id);
  roomIdDisplay.innerText = id;
  socket.emit('user-connected', name);
});

socket.on('user-connected', name => {
  console.log("user-connected:", name);  
  showNotifications(`${name} connecté`);
});

socket.on('user-disconnected', userId => {
  console.log("user-disconnected:", userId);  
  showNotifications(`${users[userId]} déconnecté`);
  delete users[userId];
});

socket.on('new-user', name => {
  console.log("new-user:", name);
  console.log("users:", users);
  users[socket.id] = name;
  socket.emit('user-connected', name);
});

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
  document.querySelector(".profile_action_display").innerText = notification;
}

function generateRoomId(userId) {
  roomId = "#" + userId.substring(0, 8);
  console.log("roomId:", roomId);  
  return roomId;
}