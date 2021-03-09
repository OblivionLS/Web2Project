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

var position = [];
position[0] = {
  x: 200,
  y: 200,
  end: 0,
}

io.on('connection', (socket) => {
  socket.emit("position", position[0]);
  counter += 1;
  console.log("users online " + counter)

  socket.on("move", data => {
    switch (data) {
      case "left":
        position[0].x -= 5;
        io.emit("position", position[0]);
        break;
      case "right":
        position[0].x += 5;
        io.emit("position", position[0]);
        break;
      case "up":
        position[0].y -= 5;
        io.emit("position", position[0]);
        break;
      case "down":
        position[0].y += 5;
        io.emit("position", position[0]);
        break;
    }
  });

  socket.on("screenDef", (data) => {
    position[0].end = data.end;
    console.log("Screen width: "+position[0].end)
  })

  socket.on('disconnect', () => {
    counter -= 1;
    console.log("users online " + counter)
});

});



//io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

server.listen(3000, () => {
  console.log('listening on *:3000');
});