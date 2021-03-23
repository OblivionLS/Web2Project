<template>
  <div>
    <!--
      <canvas
      ref="game"
      id="game"
      width="640"
      height="480"
      style="border: 1px solid black"
    ></canvas>
      -->
    <canvas
      id="canvas"
      style="width: 100%; height: 100%; position: absolute; top: 0px"
    ></canvas>
  </div>
</template>

<script>
import io from "socket.io-client";
import P5 from "p5";
let p5socket;
console.log(process.env);
p5socket = io.connect(process.env.VUE_APP_WS_HOST);


let user;
let screen;
let colors = ['rgba(107, 255, 245, 0.58)', 'rgba(255, 91, 36, 0.58)', 'rgba(113, 255, 97, 0.64)']

export default {
  name: "Block",
  data() {
    return {
      socket: {},
      context: {},
      position: {
        x: 0,
        y: 0,
      },
    };
  },

  created() {
    // this.socket = io("http://localhost:3000");
  },

  async mounted() {
    //event listener to know when the player moves
    document.addEventListener("keydown", (e) => {
      this.moving(e);
    });

    //Getting data which user each player is and what screen he's on.
    p5socket.on("user", function (data) {
      user = data;
      screen = data;
      p5socket.emit("screenDef", {
        x: 200,
        y: 200,
        end: window.innerWidth,
        height: window.innerHeight,
        user: user,
      });
      
      startP5();
    });


    //p5 Implementation

    function startP5() {
      new P5(function (p5) {
        let trail = 10; //ellipse size
        let size = 30;
        let graphics;

        //p5 setup method
        p5.setup = () => {
          p5.createCanvas(window.innerWidth, window.innerHeight);
          p5.background(200);
          p5.noStroke();
          graphics = p5.createGraphics(window.innerWidth, window.innerHeight);
          //p5socket.on('position', p5.draw);
          //console.log("screen is: " + screen);
          p5socket.on(screen, p5.draw);
          console.log("setup complete");
        };

        //p5 draw method
        p5.draw = (position) => {
          p5.background(150);
          graphics.fill(colors[1]);
          graphics.noStroke();
          graphics.ellipse(position.x, position.y, trail);
          p5.image(graphics, 0, 0);
          p5.fill("rgb(255,0,0)");
          p5.ellipse(position.x, position.y, size);
          //console.log(position.x + " : x positions y : " + position.y)
        };
      });
    }
  },

  methods: {
    move(direction) {
      p5socket.emit("move", { data: direction, user: user, screen: screen });
      //console.log(screen);
    },

    moving(e) {
      //console.log("in moving method 2");
      switch (e.which) {
        case 38:
          this.move("up");
          break;
        case 39:
          this.move("right");
          break;
        case 37:
          this.move("left");
          break;
        case 40:
          this.move("down");
          break;
      }
    },
  },
};
</script>

<style scoped>
</style>
