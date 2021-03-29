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
let added = false;
let size = 60;
let stepsize = 10;

let miniscreens = [];
let screens = [];
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
    x2: 0,
    y2: 0,
    added: false,
    myscreen: counter,
    screen: {
      height: 0,
      width: 0,
      left: null,
      right: null,
      up: null,
      down: null,
      num: counter,
      onscreen: {
        users: [counter],
        amount: 1,
        coordinates: [{ x: 200, y: 200 }],
      }
    },
  };
  screens[counter] = {
    height: 0,
    width: 0,
    left: null,
    right: null,
    up: null,
    down: null,
    num: counter,
    onscreen: {
      users: [counter],
      amount: 1,
      coordinates: [{ x: 200, y: 200 }],
      onminiscreen: [{ x: 200, y: 200 }],
    }
  };
  if (counter != 0) {
    position[counter - 1].screen.right = counter;
    position[counter].screen.left = counter - 1;
    screens[counter - 1].right = counter;
    screens[counter].left = counter - 1;
  }
  user = counter;
  socket.emit("user", user);
  socket.emit("position", position[counter]);
  counter += 1;
  console.log("users online " + counter)

  //============================================================
  //Move Method
  //===========================================================
  socket.on("move", data => {
    //let userIndex = screens[position[data.user].myscreen].onscreen.users.indexOf(user);
    let screen = position[data.user].myscreen;
    switch (data.data) {
      case "left":
        if (position[data.user].x - size >= 0) {
          updateXposition(data.user, screen, -stepsize);
          io.emit(screen, screens[screen].onscreen);
        } else if (screens[screen].left != null) {
          if (position[data.user].x <= 0 - size) {
            changingScreenLeft(data);
          } else {
            //add user to the second screen aswell as still keeping him on the first.
            // addToLeftScreen(data);
            // io.emit(screen, screens[screens[screen].left].onscreen);
            updateXposition(data.user, screen, -stepsize);
            io.emit(screen, screens[screen].onscreen);
          }
        }
        break;
      case "right":
        if (position[data.user].x + size <= screens[screen].width) {
          updateXposition(data.user, screen, + stepsize);
          io.emit(screen, screens[screen].onscreen);
        } else if (screens[screen].right != null) {
          if (position[data.user].x >= screens[screen].width + size) { //if out of range from first screen it changes to second screen
            changingScreenRight(data)
          } else {
            // addToRightScreen(data)
            updateXposition(data.user, screen, + stepsize);
            io.emit(screen, screens[screen].onscreen);
            // io.emit(screen, screens[screens[screen].right].onscreen);
          }
        }
        break;
      case "up":
        if (position[data.user].y - size >= 0) {
          //position[data.user].y -= 5;
          updateYposition(data.user, screen, -stepsize);
          io.emit(screen, screens[screen].onscreen);
        }
        break;
      case "down":
        if (position[data.user].y + 20 <= screens[screen].height) {
          //position[data.user].y += 5;
          updateYposition(data.user, screen, +stepsize)
          io.emit(screen, screens[screen].onscreen);
        }
        break;
    }
  });

  socket.on("screenDef", (data) => {
    screens[position[data.user].myscreen].width = data.end;
    screens[position[data.user].myscreen].height = data.height;
    screens[data.user].height = data.height;
    screens[data.user].width = data.end;
    screens[data.user].onscreen.onminiscreen = [{x: data.x, y: data.y}];
    miniscreens[data.user] = [{x: data.x, y: data.y, height: data.height, width: data.end}]
    socket.id = data; // socket stores the username
  })


  socket.on('disconnect', () => {
    //if another user leaves the array has to be resorted.
    //otherwise it could occur that two users have the same user id
    for (let i = socket.id.user; i < counter; i++) {
      position[i - 1] = position[i];
      screens[i - 1] = screens[i];
      //console.log("user change");
      io.emit("userChange", i);
    }
    counter -= 1;
    console.log("users online " + counter)
    //if there are no users online the array is reset
    if (counter == 0) {
      position = [];
    }

  });

});



function updateXposition(user, screen, value) {
  let update = screens[screen].onscreen.users.indexOf(user);
  screens[screen].onscreen.coordinates[update].x += value;
  screens[user].onscreen.onminiscreen[update] = screens[screen].onscreen.coordinates[update];
   position[user].x += value;
  // console.log(screens[user].onscreen.onminiscreen[update].x)
}

function updateYposition(user, screen, value) {
  let update = screens[screen].onscreen.users.indexOf(user);
  screens[screen].onscreen.coordinates[update].y += value;
  screens[user].onscreen.onminiscreen[update] = screens[screen].onscreen.coordinates[update];
  position[user].y += value;
}

function addingCoordinates2miniscreen(user, newscreen, oldscreen, removeindex){
  screens[user].onscreen.onminiscreen = [];
  screens[oldscreen].onscreen.onminiscreen.splice(removeindex, 1);
  miniscreens[user] = [];
   //screens[user].onscreen.onminiscreen = screens[newscreen].onscreen.coordinates
   console.log(screens[user].onscreen.onminiscreen);
  for(let i = 0; i < screens[newscreen].onscreen.coordinates.length; i++){
    //screens[user].onscreen.onminiscreen.push(screens[newscreen].onscreen.coordinates[i]);
   //miniscreens[user].push()
 }
}

function changingScreenRight(data) {
  //calculating new coordinates
  position[data.user].x = position[data.user].x - screens[position[data.user].myscreen].width - 2*size;
  position[data.user].y = (position[data.user].y / screens[position[data.user].myscreen].height) * screens[screens[position[data.user].myscreen].right].height;
  screens[screens[position[data.user].myscreen].right].onscreen.amount += 1; //adding user to new screen
  screens[position[data.user].myscreen].onscreen.amount -= 1;
  let remove = screens[position[data.user].myscreen].onscreen.users.indexOf(data.user);
  //removing user data from screen
  screens[position[data.user].myscreen].onscreen.coordinates.splice(remove, 1);
  screens[position[data.user].myscreen].onscreen.users.splice(remove, 1);
  //adding new user data to screen
  screens[screens[position[data.user].myscreen].right].onscreen.users.push(data.user)
  screens[screens[position[data.user].myscreen].right].onscreen.coordinates.push({ x: position[data.user].x, y: position[data.user].y });
  addingCoordinates2miniscreen(data.user, screens[position[data.user].myscreen].right, position[data.user].myscreen, remove)
  position[data.user].myscreen = screens[position[data.user].myscreen].right
}


function changingScreenLeft(data) {
  position[data.user].x = position[data.user].x + screens[screens[position[data.user].myscreen].left].width + 2*size;
  position[data.user].y = (position[data.user].y / screens[position[data.user].myscreen].height) * screens[screens[position[data.user].myscreen].left].height;
  screens[screens[position[data.user].myscreen].left].onscreen.amount += 1; //adding user to new screen
  screens[position[data.user].myscreen].onscreen.amount -= 1;
  let remove = screens[position[data.user].myscreen].onscreen.users.indexOf(data.user);
  //removing user data from screen
  screens[position[data.user].myscreen].onscreen.coordinates.splice(remove, 1);
  screens[position[data.user].myscreen].onscreen.users.splice(remove, 1);
  //adding new user data to other screen
  screens[screens[position[data.user].myscreen].left].onscreen.users.push(data.user);
  screens[screens[position[data.user].myscreen].left].onscreen.coordinates.push({ x: position[data.user].x, y: position[data.user].y });
  addingCoordinates2miniscreen(data.user, screens[position[data.user].myscreen].left, position[data.user].myscreen, remove);
  position[data.user].myscreen = screens[position[data.user].myscreen].left;
}


server.listen(3000, () => {
  console.log('listening on *:3000');
});























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





  // function addToLeftScreen(data) {
  //   if (!position[data.user].added) {
  //     position[data.user].x2 = screens[screens[position[data.user].myscreen].left].width + position[data.user].x;
  //     position[data.user].y2 = position[data.user].y / screens[position[data.user].myscreen].height * screens[screens[position[data.user].myscreen].left].height
  //     screens[screens[position[data.user].myscreen].left].onscreen.amount += 1;
  //     screens[screens[position[data.user].myscreen].left].onscreen.users.push(data.user);
  //     screens[screens[position[data.user].myscreen].left].onscreen.coordinates.push({ x: position[data.user].x2, y: position[data.user].y2 });
  //     position[data.user].added = true;
  //   } else {
  //     updateXposition(data.user, position[data.user].myscreen, -stepsize);
  //     //change on left screen
  //     //updateXposition in Arrow function, since x2 has to be updated
  //     (data) => {
  //       let screen = screens[position[data.user].myscreen].left;
  //       let update = screens[screen].onscreen.users.indexOf(data.user);
  //       screens[screen].onscreen.coordinates[update].x -= stepsize;
  //       position[user].x2 -= stepsize;
  //       position[user].x -= stepsize;
  //       io.emit(screen, screens[screen].onscreen)
  //     }
  //     //updateXposition(data.user, screens[position[data.user].myscreen].left, -5);
  //   }
  // }

  // function addToRightScreen(data) {
  //   if (!position[data.user].added) {
  //     let indexUser = screens[position[data.user].myscreen].onscreen.users.indexOf(data.user);
  //     position[data.user].x2 = screens[position[data.user].myscreen].onscreen.coordinates[indexUser].x - screens[position[data.user].myscreen].width;
  //     position[data.user].y2 = position[data.user].y / screens[position[data.user].myscreen].height * screens[screens[position[data.user].myscreen].right].height;
  //     screens[screens[position[data.user].myscreen].right].onscreen.amount += 1;
  //     screens[screens[position[data.user].myscreen].right].onscreen.users.push(data.user)
  //     screens[screens[position[data.user].myscreen].right].onscreen.coordinates.push({ x: position[data.user].x2, y: position[data.user].y2 });
  //     position[data.user].added = true;
  //   } else {
  //     //updateXposition(data.user, screens[position[data.user].myscreen].right, +stepsize);
  //     (data) => {
  //       let screen = screens[position[data.user].myscreen].right;
  //       let update = screens[screen].onscreen.users.indexOf(data.user);
  //       screens[screen].onscreen.coordinates[update].x += stepsize;
  //       position[user].x2 += stepsize;
  //       position[user].x += stepsize;
  //       io.emit(screen, screens[screen].onscreen)
  //     }
  //     updateXposition(data.user, position[data.user].myscreen, +stepsize)
  //   }
  // }