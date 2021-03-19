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
//let myposition;
let onscreenPositions = [];

p5socket.on("userChange", (data) => {
  if (user > data) {
    console.log("user was user num: " + user);
    user = user - 1;
    console.log("user changed to: " + user);
  }
});

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

  async mounted() {
    //event listener to know when the player moves
    document.addEventListener("keydown", (e) => {
      this.moving(e);
    });

    //Getting data which user each player is and what screen he's on.
    p5socket.on("user", function (data) {
      user = data;
      console.log("user: " + user);
      screen = data;
      // myposition = { x: 200, y: 200 };
      onscreenPositions = [{ x: 200, y: 200 }];
      p5socket.emit("screenDef", {
        x: 200,
        y: 200,
        end: window.innerWidth,
        height: window.innerHeight,
        user: user,
      });
      console.log(onscreenPositions);
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
        //let background = "rgba(30,30,30,0.2)";

        //p5 setup method
        p5.setup = () => {
          p5.createCanvas(window.innerWidth, window.innerHeight);
          p5.background(30);
          p5.noStroke();
          p5.frameRate(10);
          p5.colorMode(p5.HSB, 255);
          p5.angleMode(p5.DEGREES);
          p5.fill("rgb(255,0,0)");
          graphics = p5.createGraphics(window.innerWidth, window.innerHeight);
          graphics.noStroke();
          graphics.colorMode(p5.HSB, 255);
          p5socket.on(screen, p5.drawing); //calling on drawing method from socket
          console.log("setup complete");
          p5.initGraphics();
        };

        //only called when the object is moved
        p5.drawing = (position) => {
          onscreenPositions = position.coordinates;
          screen = position.screen;
          p5.animation();
        };

        p5.draw = () => {
          p5.animation();
        };

        p5.animation = () => {
          graphics.fill(colors[1]);
          //graphics.noStroke();
          //p5.background(30);
          p5.tint(255, 50);
          p5.image(graphics, 0, 0);
          for (let i = 0; i < onscreenPositions.length; i++) {
            graphics.ellipse(
              onscreenPositions[i].x,
              onscreenPositions[i].y,
              trail
            );
            p5.wobble(20, onscreenPositions[i].x, onscreenPositions[i].y);
          }
        };
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

        p5.initGraphics = () => {
          p5.triangleField();
          p5.noisy();
          p5.image(graphics, 0, 0);
        }

        let inc = 0.1;
        p5.noisy = () => {
          let distx = 20;
          let disty = 20;
          let yoff = 0;
          for (let y = 0; y < window.innerHeight; y += disty) {
            let xoff = 0;
            for (let x = 0; x < window.innerWidth; x += distx) {
              let r = p5.noise(xoff, yoff) * 50;
              graphics.fill(r, 30, 30);
              graphics.ellipse(x, y, p5.noise(xoff, yoff) * 10);

              xoff += inc;
            }
            yoff += inc;
          }
        };

        let sizegraphics;
        let yoff = 0;
        p5.triangleField = () => {
          inc = 0.1;
          let distx = window.innerWidth / 20;
          let disty = window.innerHeight/20;
          sizegraphics = 10 * distx;
          for (let y = -disty; y < window.innerHeight + disty; y += disty) {
            let xoff = 0;
            for (let x = -distx; x < window.innerWidth + distx; x += distx) {
              let r = 220 + p5.noise(xoff, yoff) * 20;
              let d = 190 - p5.noise(xoff, yoff) * 200;
              let w = 150 + p5.noise(xoff, yoff) * 100;
              graphics.fill(r, w, d);
              //ellipse(x,y, noise(xoff, yoff)* 10);
              let y1 = y - p5.noise(xoff, yoff);
              let x2 = x + p5.noise(xoff, yoff) * sizegraphics;
              let y2 = y + p5.noise(xoff, yoff) * sizegraphics;
              let x3 = x - p5.noise(xoff, yoff) * sizegraphics;
              let y3 =
                y + p5.noise(xoff, yoff) + disty * p5.noise(yoff, xoff) * 2;
              graphics.triangle(x, y1, x2, y2, x3, y3);

              xoff += inc;
            }
            yoff += inc;
          }
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
