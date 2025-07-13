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

    socket.emit('room-creation', room);
    io.emit('update-rooms-list', rooms);
  });
  socket.on('enter-public-rooms', () => {
    console.log("enter-public-rooms");
    socket.emit('update-rooms-list', rooms);
    // socket.emit('display-public-rooms', rooms);
  });
  socket.on('join-room', (room) => {
    if (!rooms[room.ref]) return;
    socket.join(room.roomId);
    if (!rooms[room.ref].usersList.includes(users[socket.id])) rooms[room.ref].usersList.push(users[socket.id]);
    console.log("rooms[room.ref].usersList:", rooms[room.ref].usersList);
    io.to(room.roomId).emit('room-joining', room);
    // socket.emit('update-room', roomId, "join");
  });
  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    for (const r in rooms) {
      if (rooms[r]["users"][socket.id]) {
        console.log("socket.id:", rooms[r]["users"][socket.id]);
        // delete rooms[r]["users"][socket.id];
        socket.broadcast.emit('update-room', r);
      }
    }
    console.log("rooms:", rooms);
    socket.emit('update-room', roomId, "leave");
  });
  socket.on('update-local-user', (user) => {
    console.log("update-local-user:", user);
    for (const prop in users[socket.id]) {
      if (users[socket.id][prop] !== user[prop]) users[socket.id][prop] = user[prop];
    };
  });
  socket.on('join-user', (userName) => {
    console.log("join-user userName:", userName);
    let userSocket;
    for (const sckt in users) {
      const user = users[sckt];
      if (user.username === userName) userSocket = sckt;
    }
    console.log("userSocket:", userSocket);
    socket.join(userSocket);
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