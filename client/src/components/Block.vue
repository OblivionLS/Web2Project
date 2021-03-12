<template>
  <div>
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
p5socket = io.connect(process.env.VUE_APP_WS_HOST);
let myposition;

let user;
let screen;
let colors = [
  "rgba(107, 255, 245, 0.58)",
  "rgba(255, 91, 36, 0.58)",
  "rgba(113, 255, 97, 0.64)",
];

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
      myposition = { x: 200, y: 200 };
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
        let size = 50;
        let graphics;
        let xoff = 1;
        let roff = 30; //noise radius along the circle lines
        let xn = 5;

        //background color
        let background = "rgba(30,30,30,0.2)";

        //p5 setup method
        p5.setup = () => {
          p5.createCanvas(window.innerWidth, window.innerHeight);
          p5.background(30);
          p5.noStroke();
          p5.frameRate(15);
          p5.colorMode(p5.HSB, 255);
          p5.angleMode(p5.DEGREES);
          p5.fill("rgb(255,0,0)");
          graphics = p5.createGraphics(window.innerWidth, window.innerHeight);
          p5socket.on(screen, p5.drawing);
          console.log("setup complete");
        };

        //only called when the object is moved
        p5.drawing = (position) => {
          myposition = { x: position.x, y: position.y };
          
          p5.animation();

          //console.log(position.x + " : x positions y : " + position.y)
        };

        p5.draw = () => {
          p5.animation();
        };

        p5.animation = () => {
          graphics.fill(colors[1]);
          graphics.noStroke();
          graphics.ellipse(myposition.x, myposition.y, trail);
          p5.background(background);
          p5.image(graphics, 0, 0);

          p5.wobble(20, myposition.x, myposition.y);
        }

        //circle noise animation of whos it
        p5.wobble = (n, cx, cy) => {
          let xs = cx;
          let ys = cy;
          let rn = 5;
          let r = size;

          p5.beginShape();
          for (let i = 0; i < n; i++) {
            let rt = p5.map(p5.noise(xoff), 0, 1, r - roff, r + roff);
            let a = 360 / n;
            let x = xs + rt * p5.cos(i * a);
            let y = ys + rt * p5.sin(i * a);

            p5.vertex(x, y);

            xoff = xn + rn * p5.sin(i * a);
          }
          xn += 0.05;
          p5.endShape(p5.CLOSE);
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
