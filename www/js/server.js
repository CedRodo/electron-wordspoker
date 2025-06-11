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
  console.log("socket id:", socket.id);
  console.log("socket room:", socket.rooms);
  socket.on('new-user', name => {
    console.log("new-user:", name);
    console.log("users:", users);
    users[socket.id] = name;
    socket.emit('user-connected', name);
  });
  // socket.on('send-chat-message', message => {
  //   console.log("send-chat-message:", message);
  //   socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] });
  // });

  socket.on('check-playerName-change', name => {
    console.log("check-playerName-change:", name);
    if (users[socket.id] !== name) users[socket.id] = name;
    console.log("users[socket.id]:", users[socket.id]);
  });

  socket.on('create-room', data => {
    console.log("create-room:", data.roomId);
    rooms[data.roomId] = { data: data, players: [{ id: socket.id, name: users[socket.id], type: "host" }]}
    socket.broadcast.emit('room-creation', data.roomId);
  });

  socket.on('all-rooms', visibility => {
    console.log("all-rooms:", visibility);
    socket.emit('display-rooms', rooms);
  });

  socket.on('join-room', (roomId, playerData) => {
    console.log("join-room:", roomId);
    socket.join(roomId);
    rooms[roomId]["players"].push({ id: socket.id, name: playerData.playerName, avatar: playerData.avatarNumber, type: "client" })
    socket.broadcast.emit('room-joining', rooms[roomId]);
    // socket.emit('room-creation', id);
  });

  socket.on('disconnect', () => {
    // console.log("disconnect:", users[socket.id]);
    // socket.emit('user-disconnected', users[socket.id]);
    socket.emit('user-disconnected', users[socket.id]);
    delete users[socket.id];
  });
});