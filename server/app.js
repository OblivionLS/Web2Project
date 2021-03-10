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

var position = [];
position[0] = {
  user: 0,
  x: 200,
  y: 200,
  end: 0,
}

let user;

io.on('connection', (socket) => {
  position[counter] = {
    x: 200,
    y: 200,
    height: 0,
    width: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0,
    screen: counter,
  }

  user = counter;
  socket.emit("user", user);
  socket.emit("position", position[counter]);
  counter += 1;
  console.log("users online " + counter)

  socket.on("move", data => {
    switch (data.data) {
      case "left":
        if (position[data.user].x - 20 >= 0) {
          position[data.user].x -= 5;
          io.emit(position[data.user].screen, position[data.user]);
        }
        break;
      case "right":
        if (position[data.user].x + 20 <= position[data.user].width) {
          position[data.user].x += 5;
          io.emit(position[data.user].screen, position[data.user]);
        }
        break;
      case "up":
        if(position[data.user].y - 20 >= 0){
          position[data.user].y -= 5;
          io.emit(position[data.user].screen, position[data.user]);
        }
        
        break;
      case "down":
        if(position[data.user].y + 20 <= position[data.user].height){
          position[data.user].y += 5;
          io.emit(position[data.user].screen, position[data.user]);
        }
        break;
    }
  });

  socket.on("screenDef", (data) => {
    position[data.user].width = data.end;
    position[data.user].height = data.height;
  })

  //sending all positions that are on screen.
  // socket.on('positions', (data) => {
  //   let onScreen = [];
  //   let count = 0;
  //   for(let i = 0; i < position.length; i++){
  //     if(position[i].x < position[data].right && position[i].x > position[data].left && position[i].y > position[data].up && position[i].y < position[data].down){
  //       onScreen[count] = position[i];
  //     }
  //   }
  //   io.emit("positions", onScreen);
  // });

  socket.on('disconnect', () => {
    counter -= 1;
    console.log("users online " + counter)
  });

});



//io.emit('some event', { someProperty: 'some value', otherProperty: 'other value' }); // This will emit the event to all connected sockets

server.listen(3000, () => {
  console.log('listening on *:3000');
});