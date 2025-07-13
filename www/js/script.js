const socket = io('http://localhost:3000');

// socket.on('user-connected', name => {
//   console.log("user-connected:", name);  
//   showNotifications(`${name} connecté`);
// });

// socket.on('user-disconnected', userId => {
//   console.log("user-disconnected:", userId);  
//   showNotifications(`${users[userId]} déconnecté`);
//   delete users[userId];
// });

// socket.on('update-users', users => {
//   console.log("update-users:", users);
//   users.forEach(user => {
//     console.log("update-users user:", user);    
//     // app.addUser(user);
//   });
// });

// socket.on('new-user', name => {
//   console.log("new-user:", name);
//   console.log("users:", users);
//   users[socket.id] = name;
//   socket.emit('user-connected', name);
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