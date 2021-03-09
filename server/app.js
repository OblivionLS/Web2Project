const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

let counter = 0;
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// });

var position = {
  x: 200,
  y: 200
}

io.on('connection', (socket) => {
  console.log("connected " + counter);
  socket.emit("position", position);
  counter += 1;

  socket.on("move", data => {
    switch (data) {
      case "left":
        position.x -= 5;
        io.emit("position", position);
        break;
      case "right":
        position.x += 5;
        io.emit("position", position);
        break;
      case "up":
        position.y -= 5;
        io.emit("position", position);
        break;
      case "down":
        position.y += 5;
        io.emit("position", position);
        break;
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected ' + counter);
    counter -= 1;
    console.log("users online " + counter)
});

});



//io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

server.listen(3000, () => {
  console.log('listening on *:3000');
});