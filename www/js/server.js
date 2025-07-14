import { log } from "console";
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost"
  }
});

httpServer.listen(3000);

const users = {};
const rooms = {};

io.on('connection', socket => {
  console.log("users:", users);
  console.log("socket id:", socket.id);
  socket.on('new-user', user => {
    console.log("new user:", user);
    users[socket.id] = user;
    // let usersList = [];
    // for (const sckt in users) {
    //   usersList.push(users[sckt]);
    // }
    // console.log("usersList:", usersList);
    // io.emit('update-users', usersList);
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
    // io.to(roomId).emit('display-room-users', { roomId: roomId, users: usersInRoom });
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
    io.to(room.roomId).emit('show-notification', { obj: users[socket.id], type: "create" });
    socket.emit('room-creation', room);
    io.emit('update-rooms-list', rooms);
  });
  socket.on('join-room', (room) => {
    console.log("join-room");
    if (!rooms[room.ref]) return;
    socket.emit('room-to-update', room);
    socket.join(room.roomId);
    io.to(room.roomId).emit('show-notification', { obj: users[socket.id], type: "join" });
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
    // socket.emit('display-public-rooms', rooms);
  });
  socket.on('enter-room-lobby', room => {
    console.log("enter-room-lobby");
    if (!rooms[room.ref]) return;
    io.to(room.roomId).emit('display-room-users', room);
    // socket.emit('display-public-rooms', rooms);
  });
  socket.on('prepare-game-multi-start', (room) => {
    console.log("prepare-game-multi-start");
    console.log("prepare-game-multi-start room:", room);
    if (!rooms[room.ref]) return;
    io.to(room.roomId).emit('start-game-multi');
  });
  socket.on('disconnect', () => {
    console.log("disconnect:", users[socket.id]);
    for (const r in rooms) {
      if (rooms[r]["users"][socket.id]) {
        // console.log("socket.id:", rooms[r]["users"][socket.id]);             
        socket.broadcast.emit('update-room', r);
      }
    }
    delete users[socket.id];
  });
});