import { log } from "console";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost"
  }
});

httpServer.listen(3000);

const users = {};
const rooms = {};
let nbOfPlayersReady = 0;

io.on('connection', socket => {
  console.log("users:", users);
  console.log("socket id:", socket.id);

  socket.on('disconnect', () => {
    console.log("disconnect:", users[socket.id]);
    delete users[socket.id];
  });

  ///////////// MENU ///////////////

  socket.on('new-user', user => {
    console.log("new user:", user);
    if (!users[socket.id]) users[socket.id] = user;
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

  socket.on('create-room', (room) => {
    console.log("create-room");
    console.log("create-room room:", room);    
    socket.join(room.roomId);
    let isAlreadyPresent = false;
    if (!rooms[room.ref]) {
      Object.defineProperty(rooms, room.ref, { value: {}, enumerable: true, writable: true });
      console.log("rooms[room.ref]:", rooms[room.ref]);
    } else {
      isAlreadyPresent = true;
    }
    if (!isAlreadyPresent) {
      console.log("!isAlreadyPresent");
      const userAlreadyPresent = room.usersList.find(u => u.ref === users[socket.id].ref);
      if (typeof userAlreadyPresent === "undefined") {
        room.usersList.push(users[socket.id]);
      }
      rooms[room.ref] = room;
    }
    console.log("rooms:", rooms);
    io.to(room.roomId).emit('show-notification', { object: users[socket.id], type: "create" });
    socket.emit('room-creation', room);
    io.emit('update-rooms-list', rooms);
  });

  socket.on('join-room', (room) => {
    console.log("join-room");
    if (!rooms[room.ref]) return;
    socket.emit('room-to-update', room);
    socket.join(room.roomId);
    io.to(room.roomId).emit('show-notification', { object: users[socket.id], type: "join" });
    io.to(room.roomId).emit('room-joining', room);
  });

  socket.on('leave-room', (room) => {
    console.log("leave-room");
    if (!rooms[room.ref]) return;
    socket.emit('room-to-update', room);
    socket.leave(roomId);
    io.to(room.roomId).emit('room-leaving', room);
  });

  socket.on('update-room', (room) => {
    console.log("update-room");
    console.log("update-room room:", room);
    if (!rooms[room.ref]) return;
    for (const prop in rooms[room.ref]) {
      rooms[room.ref][prop] = room[prop];
    }
    console.log("update-room rooms:", rooms);
    io.emit('update-rooms-list', rooms);
  });

  socket.on('enter-public-rooms', () => {
    console.log("enter-public-rooms");
    socket.emit('update-rooms-list', rooms);
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
    if (!rooms[roomRef]) return;
    console.log("get-room rooms[roomRef]:", rooms[roomRef]);
    console.log("get-room users[socket.id]:", users[socket.id]);
    const room = rooms[roomRef];
    rooms[roomRef].usersList.forEach(u => {
      if (u.ref === users[socket.id]["ref"]) socket.join(room.roomId);
    });
    console.log("socket.rooms:", socket.rooms);    
    io.to(room.roomId).emit('game-multi-room', room);
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

  socket.on('send-word-to-play', (data, roomId) => {
    console.log("send-word-to-play");
    console.log("send-word-to-play data:", data);
    socket.to(roomId).emit('player-word-to-play', data);
  });

  socket.on('game-generate-distribution', (data, roomId) => {
    console.log("game-generate-distribution");
    console.log("game-generate-distribution data:", data);
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
    
    sockets.forEach(s => { players.push({ [users[s.id].ref]: { ready: s.data.ready } }); });
    console.log("player-check-status players:", players);
    let event = data.type + "-players-status";
    io.to(data.roomId).emit(event, players);
  });

});