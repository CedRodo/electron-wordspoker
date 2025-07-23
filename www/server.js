import { log } from "console";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import "dotenv/config";

const __dirname = path.resolve();

console.log("process.env.APP_ENV", process.env.APP_ENV);

const APP_ENV = process.env.APP_ENV;

const app = express();

app.set('views', './www/views')
app.set('view engine', 'ejs')
app.use(cors());
app.use("/js", express.static(path.join(__dirname + "/www/js")));
app.use("/css", express.static(path.join(__dirname + "/www/css")));
app.use("/data", express.static(path.join(__dirname + "/www/data")));
app.use("/assets", express.static(path.join(__dirname + "/www/assets")));
app.use("/sounds", express.static(path.join(__dirname + "/www/sounds")));
app.use(express.urlencoded({ extended: true }));

let page = ""

app.get('/', (req, res) => {
  console.log("index");
  page = "";
  res.render('index');
});

app.get('/menu', (req, res) => {
  console.log("menu");
  page = "menu";
  res.render('menu');
});

app.get('/game', (req, res) => {
  console.log("game");
  page = "game";
  res.render('game');
});

app.get('/test', (req, res) => {
  console.log("test");
  page = "test";
  res.render('test');
});

const httpServer = createServer(app);

let host;

switch (APP_ENV) {
  case "PROD":
    // host = "https://www.electronglitch.com/wordspoker";
    host = "https://wordspoker.electronglitch.com";
    break;
  case "PROD2":
    host = "https://electron-wordspoker.onrender.com";
    break;
  case "DEV":
    host = "http://localhost";
    break;
  default:
    host = "http://localhost";
    break;
}

const PORT = process.env.PORT;

const io = new Server(httpServer, {
  cors: {
    origin: host
  }
});

httpServer.listen(PORT);

const users = {};
const rooms = {};
let nbOfPlayersReady = 0;

io.on('connection', socket => {
  console.log("users:", users);
  console.log("socket id:", socket.id);
  socket.on('disconnecting', () => {
    if (!users[socket.id]) return;
    console.log("disconnecting");
    let userRef = users[socket.id].ref;
    delete users[socket.id];
    console.log("disconnecting users[socket.id]:", users[socket.id]);
    switch (page) {
      case "test":
        socket.rooms.forEach(roomId => {
          socket.leave(roomId);
          io.to(roomId).emit('test-update-users', users, "remove");
        });
        break;
      case "menu":
        socket.rooms.forEach(roomId => {
          socket.leave(roomId);
          io.to(roomId).emit('user-disconnecting', roomId, userRef);
        });
        break;
    }
    console.log("disconnecting users:", users);
  });

  socket.on('disconnect', () => {
    console.log("disconnect users[socket.id]:", users[socket.id]);
    // let eventName = "";
    // switch (page) {
    //   case "test":
    //     eventName = 'test-update-users';
    //     break;
    //   default:
    //     eventName = '';
    //     break;
    // }
    // console.log("disconnect eventName:", eventName);
    // if (eventName !== '') {
    //   socket.rooms.forEach(roomId => {
    //     io.to(roomId).emit(eventName);
    //   });
    // }
    delete users[socket.id];
    console.log("disconnect users:", users);
  });

  ///////////// MENU ///////////////

  socket.on('new-user', user => {
    console.log("new user:", user);
    console.log("new user socket.id:", socket.id);
    if (!users[socket.id]) users[socket.id] = user;
    console.log("new user users[socket.id]:", users[socket.id]);
  });

  socket.on('check-host-room', user => {
    console.log("check-host-room:", user);;
    console.log("check-host-room rooms:", rooms);
    let roomRef;
    for (const ref in rooms) {
      console.log("check-host-room ref:", ref);
      console.log("check-host-room rooms[ref]:", rooms[ref]);
      if (ref === user.ref) {
        console.log("ref === user.ref");        
        roomRef = ref;
      }
    }
    delete rooms[roomRef];
    console.log("rooms after:", rooms);  
  });

  socket.on('room-users', async (roomId) => {
    console.log("room-users roomId:", roomId);
    const sockets = await io.in(roomId).fetchSockets();
    // console.log("sockets:", sockets);
    const socketsIds = sockets.map(socket => socket.id);
    console.log("socketsIds:", socketsIds);
    const usersInRoom = socketsIds.map(id => users[id]);
    console.log("usersInRoom:", usersInRoom);
    io.emit('display-room-users', { roomId: roomId, users: usersInRoom });
  });

  socket.on('update-user', user => {
    console.log("update-user");
    console.log("update-user user:", user);
    console.log("update-user socket.id:", socket.id);
    console.log("update-user users[socket.id]:", users[socket.id]);
    console.log("update-user users before:", users);
    if (!users[socket.id]) return;
    for (const prop in users[socket.id]) {
      users[socket.id][prop] = user[prop];
    }
    console.log("update-user users after:", users);
  });

  socket.on('delete-user', user => {
    console.log("delete-user");
    console.log("delete-user user:", user);
    console.log("delete-user users[socket.id]:", users[socket.id]);
    console.log("delete-user users before:", users);
    if (!users[socket.id]) return;
    delete users[socket.id];
    console.log("update-user users after:", users);
  });

  socket.on('create-room', (room) => {
    console.log("create-room");
    console.log("create-room room:", room);    
    let isAlreadyPresent = false;
    if (!rooms[room.ref]) {
      Object.defineProperty(rooms, room.ref, { value: {}, enumerable: true, writable: true, configurable: true });
      console.log("rooms[room.ref]:", rooms[room.ref]);
    } else {
      // isAlreadyPresent = true;
      io.to(room.roomId).socketsLeave();
      delete rooms[room.ref];
    }
    // if (!isAlreadyPresent) {
    //   console.log("!isAlreadyPresent");
    //   console.log("create-room users[socket.id]:", users[socket.id]);  
    //   const userAlreadyPresent = room.usersList.find(u => u.ref === users[socket.id].ref);
    //   if (typeof userAlreadyPresent === "undefined") {
    //     room.usersList.push(users[socket.id]);
    //   }
    //   rooms[room.ref] = room;
    // }
    console.log("!isAlreadyPresent");
    console.log("create-room users[socket.id]:", users[socket.id]);  
    const userAlreadyPresent = room.usersList.find(u => u.ref === users[socket.id].ref);
    if (typeof userAlreadyPresent === "undefined") {
      room.usersList.push(users[socket.id]);
    }
    rooms[room.ref] = room;
    socket.join(room.roomId);
    console.log("rooms:", rooms);
    io.to(room.roomId).emit('show-notification', { object: users[socket.id], type: "create" });
    socket.emit('room-creation', room);
    io.emit('update-rooms-list', rooms);
  });

  socket.on('join-room', (room, visibility) => {
    console.log("join-room");
    if (!rooms[room.ref]) return;
    socket.emit('room-to-update', room, visibility);
    socket.join(room.roomId);
    io.to(room.roomId).emit('show-notification', { object: users[socket.id], type: "join" });
    io.to(room.roomId).emit('room-joining', room);
  });

  socket.on('join-private-room', (roomRef) => {
    console.log("join-private-room");
    if (!rooms[roomRef]) return;
    // socket.emit('room-to-update', room);
    socket.join(rooms[roomRef].roomId);
    io.to(rooms[roomRef].roomId).emit('show-notification', { object: users[socket.id], type: "join" });
    io.to(rooms[roomRef].roomId).emit('private-room-joining', rooms[roomRef]);
  });

  socket.on('leave-room', (room) => {
    console.log("leave-room");
    if (!rooms[room.ref]) return;
    socket.emit('room-to-update', room);
    socket.leave(roomId);
    io.to(room.roomId).emit('room-leaving', room);
  });

  // socket.on('clear-other-rooms', async (roomRef) => {
  //   console.log("clear-other-rooms");
  //   console.log("clear-other-rooms roomRef:", roomRef);
  //   room.usersList.forEach(u => {
  //     for (const user in users) {
  //       if (users[user].ref === u.ref) {
  //         users[user]["gamePreferences"]["roomRef"] = "";
  //       }
  //     }
  //   })
  //   if (!rooms[room.ref]) return;
  //   // delete rooms[room.ref];
  //   console.log("remove-room rooms:", rooms);
  //   io.emit('update-rooms-list', rooms);
  //   io.to(room.roomId).emit('close-lobby', room);
  //   io.in(room.roomId).socketsLeave();
  // });

  socket.on('remove-room', async (room) => {
    console.log("remove-room");
    console.log("remove-room room:", room);
    room.usersList.forEach(u => {
      for (const user in users) {
        if (users[user].ref === u.ref) {
          users[user]["gamePreferences"]["roomRef"] = "";
        }
      }
    })
    if (!rooms[room.ref]) return;
    // delete rooms[room.ref];
    console.log("remove-room rooms:", rooms);
    io.emit('update-rooms-list', rooms);
    io.to(room.roomId).emit('close-lobby', room);
    io.in(room.roomId).socketsLeave();
  });

  socket.on('update-room', (room, visibility) => {
    console.log("update-room");
    console.log("update-room room:", room);
    if (!rooms[room.ref]) return;
    for (const prop in rooms[room.ref]) {
      rooms[room.ref][prop] = room[prop];
    }
    console.log("update-room rooms:", rooms);
    io.emit('update-rooms', rooms, visibility);
  });

  socket.on('update-private-room', (room) => {
    console.log("update-private-room");
    console.log("update-private-room roomRef:", roomRef);
    if (!rooms[roomRef]) return;
    console.log("update-private-room rooms[roomRef]:", rooms[roomRef]);
    io.to(rooms[roomRef].roomId).emit('update-private-room-in-rooms-list', rooms[roomRef]);
  });

  socket.on('enter-public-rooms', () => {
    console.log("enter-public-rooms");
    socket.emit('update-rooms', rooms, "public");
  });

  socket.on('find-private-room', roomId => {
    console.log("find-private-room");
    console.log("find-private-room roomId:", roomId);
    let privateRoom;
    for (const room in rooms) {
      console.log("find-private-room rooms[room]:", rooms[room]);
      console.log("find-private-room rooms[room].roomId:", rooms[room].roomId);
      if (rooms[room].roomId === roomId && rooms[room].visibility === "private") {
        console.log("PRIVATE!");        
        privateRoom = rooms[room];
      }
    }
    console.log("privateRoom:", privateRoom); 
    if (typeof privateRoom !== "undefined") socket.emit('show-private-room', privateRoom);
  });

  socket.on('enter-room-lobby', room => {
    console.log("enter-room-lobby");
    console.log("enter-room-lobby room:", room);
    if (!rooms[room.ref]) return;
    io.to(room.roomId).emit('display-room-users', room);
  });

  socket.on('prepare-game-multi-start', (room) => {
    console.log("prepare-game-multi-start");
    console.log("prepare-game-multi-start room:", room);
    if (!rooms[room.ref]) return;
    io.to(room.roomId).emit('start-game-multi', room.ref);
  });

  socket.on('get-room', (roomRef) => {
    console.log("get-room");
    console.log("get-room roomRef:", roomRef);
    // console.log("get-room username:", username);
    console.log("get-room rooms:", rooms);
    console.log("get-room rooms[roomRef].usersList:", rooms[roomRef].usersList);
    if (!rooms[roomRef]) return;
    // console.log("get-room rooms[roomRef]:", rooms[roomRef]);
    console.log("get-room users[socket.id]:", users[socket.id]);
    const room = rooms[roomRef];
    rooms[roomRef].usersList.forEach(u => {
      if (u.ref === users[socket.id]["ref"]) socket.join(room.roomId);
    });
    console.log("socket.rooms:", socket.rooms);    
    socket.emit('game-multi-room', room);
  });

  ///////////// TEST ///////////////

  socket.on('test-new-user', (user, roomId) => {
    console.log("test-new-user");
    console.log("test-new-user user:", user);
    if (!users[socket.id]) users[socket.id] = user;
    console.log("test-new-user users:", users);
    socket.join(roomId);
    io.to(roomId).emit('test-update-users', users);
    io.to(roomId).emit('test-display-users');
  });

  socket.on('test-new-room', room => {
    console.log("test-new-room");
    console.log("test-new-room room:", room);
    if (!rooms[room.ref]) {
      Object.defineProperty(rooms, room.ref, { value: {}, enumerable: true, writable: true });
    }
    rooms[room.ref] = room;
    console.log("rooms:", rooms);
  });

  socket.on('test-change-nb-players', (room, nbPlayers) => {
    console.log("test-change-nb-players");
    console.log("test-change-nb-players nbPlayers:", nbPlayers);
    if (!rooms[room.ref]) return;
    rooms[room.ref].gamePreferences.numberOfPlayers = nbPlayers;
    console.log("test-change-nb-players rooms[room.ref]:", rooms[room.ref]);
  });

  socket.on('test-update-room', (room, prop) => {
    console.log("test-update-room");
    console.log("test-update-room room:", room);
    if (!rooms[room.ref]) return;
    rooms[room.ref][prop] = room[prop];
    console.log("test-update-room rooms[room.ref]:", rooms[room.ref]);
  });

  socket.on('launch-multi', roomId => {
    console.log("launch-multi");
    console.log("launch-multi roomId:", roomId);
    io.to(roomId).emit('start-multi');
  });

  ///////////// GAME ///////////////

  socket.on('player-number', (data, roomId) => {
    console.log("player-number");
    console.log("player-number data:", data);
    io.to(roomId).emit(data.eventName, data.playerNumber);
  });

  socket.on('send-my-player-infos', (player, roomId) => {
    console.log("send-my-player-infos");
    console.log("send-my-player-infos player:", player);
    io.to(roomId).emit('get-player-infos', player);
  });

  socket.on('player-action', (data, roomId) => {
    console.log("player-action");
    console.log("player-action data:", data);
    io.to(roomId).emit('update-game-status', data);
  });

  socket.on('overtime-skip-turn', (player, roomId) => {
    io.to(roomId).emit('overtime-play', player);
  });

  socket.on('get-ai-thinking-time', (data, roomId) => {
    console.log("get-ai-thinking-time data:", data);
    let thinkingTime = Math.floor(Math.random() * (data.timeLimitMax - data.timeLimitMin + 1)) + data.timeLimitMin;
    io.to(roomId).emit('ai-thinking-time', thinkingTime);
  });

  socket.on('ai-play-decision', (data, roomId) => {
    console.log("ai-play-decision");
    console.log("ai-play-decision data:", data);
    io.to(roomId).emit('ai-play', data);
  });

  socket.on('activate-ai-play', (roomId, callback) => {
    console.log("activate-ai-play");
    console.log("activate-ai-play callback:", callback);
    io.to(roomId).emit('ai-play', callback);
  });

  socket.on('send-word-to-play', (data, roomId) => {
    console.log("send-word-to-play");
    console.log("send-word-to-play data:", data);
    socket.to(roomId).emit('player-word-to-play', data);
  });

  socket.on('send-ai-players-list', async (AIPlayersList, roomId) => {
    console.log("send-ai-players-list");
    console.log("send-ai-players-list AIPlayersList:", AIPlayersList);
    // const sockets = await io.in(roomId).fetchSockets();
    // const socketsIds = sockets.map(socket => socket.id);
    // console.log("socketsIds:", socketsIds);
    // const usersInRoom = socketsIds.map(id => users[id]);
    // console.log("usersInRoom:", usersInRoom);
    io.to(roomId).emit('game-create-ai-players', AIPlayersList);
  });

  socket.on('game-generate-distribution', (data, roomId) => {
    console.log("game-generate-distribution");
    // console.log("game-generate-distribution data:", data);
    io.to(roomId).emit('game-distribution', data);
  });

  socket.on('add-player-ready', (roomId) => {
    console.log("add-player-ready nbOfPlayersReady:", nbOfPlayersReady);
    nbOfPlayersReady++;
    console.log("nbOfPlayersReady++:", nbOfPlayersReady);
    io.to(roomId).emit('number-of-players-ready', nbOfPlayersReady);
  });

  socket.on('player-set-ready', data => {
    console.log("player-set-ready data:", data);
    console.log("player-set-ready socket.id:", socket.id);
    console.log("player-set-ready socket.data:", socket.data);
    socket.data.ready = true;
    console.log("player-set-ready socket.data.ready:", socket.data.ready);
    let event = data.type + "-update-players-status";
    io.to(data.roomId).emit(event, data);
  });

  socket.on('players-check-status', async (data) => {
    console.log("player-check-status data:", data);
    let players = [];
    const sockets = await io.in(data.roomId).fetchSockets();
    console.log("player-check-status sockets.length:", sockets.length);
    
    sockets.forEach(s => {
      console.log("s.id:", s.id);
      console.log("s.data.ready:", s.data.ready);
      players.push({ [users[s.id].ref]: { ready: s.data.ready } });
    });
    console.log("player-check-status players:", players);
    let event = data.type + "-players-status";
    io.to(data.roomId).emit(event, players);
  });

  socket.on('send-players-turn-order', (data, roomId) => {
    console.log("send-players-turn-order data:", data);
    io.to(roomId).emit('receive-players-turn-order', data);
  });

  socket.on('page-not-visible', () => {
    console.log("page-not-visible");
  });

  socket.on('page-visible', () => {
    console.log("page-visible");
  });

});