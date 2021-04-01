<template>
  <div>
    <canvas
      id="canvas"
      style="
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0px;
        z-index: 0;
      "
    ></canvas>
    <canvas
      id="miniscreen"
      style="
        width: 35%;
        height: 40%;
        position: absolute;
        bottom: 1em;
        right: 1em;
        z-index: 5;
        border: solid;
        border-color: rgba(150, 150, 150, 0.89);
      "
    ></canvas>
  </div>
</template>

<script>
import io from "socket.io-client";
import P5 from "p5";
import gsap from "gsap";
let p5socket;
p5socket = io.connect(process.env.VUE_APP_WS_HOST);
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
  "rgba(235, 30, 143, 0.58)",
];
let wobbleColors = [
  "rgb(107, 255, 245)",
  "rgba(235, 74, 20, 1)",
  "rgb(113, 255, 97)",
  "rgba(159, 50, 110, 1)",
];
let background_miniscreen = "rgba(0, 0, 0, 0.5)";

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
    let screenChanged = false;
    let miniscreen = document.getElementById("miniscreen");
    miniscreen.height = window.innerHeight * 0.4;
    miniscreen.width = window.innerWidth * 0.35;
    let ctx = miniscreen.getContext("2d");
    ctx.fillStyle = background_miniscreen;
    ctx.fillRect(0, 0, miniscreen.width, miniscreen.height);

    //event listener to know when the player moves
    document.addEventListener("keydown", (e) => {
      this.moving(e);
      miniscreenScaling();
    });

    p5socket.on("screenChanged", (data)=>{
      console.log("screen Changed was called.");
      if(user == data.user){
        screen = data.onscreen;
        screenChanged = true;
      }
    })
    function miniscreenScaling() {
      if (user != screen && screenChanged) {
        console.log("from small to big.")
        gsap.from(miniscreen, {
          height: "40%",
          width: "35%",
        });
        gsap.to(miniscreen, {
          height: "65%",
          width: "65%",
          duration: 1,
        })
        miniscreen.height = window.innerHeight * 0.6;
        miniscreen.width = window.innerWidth * 0.6;
        ctx.fillStyle = background_miniscreen;
        ctx.fillRect(0, 0, miniscreen.width, miniscreen.height);
        screenChanged = false;
      } else if(screenChanged) {
        console.log("from big to small.")
        gsap.from(miniscreen, {
          height: "65%",
          width: "65%",
        });
        gsap.to(miniscreen, {
          height: "40%",
          width: "35%",
          duration: 1,
        })
        miniscreen.height = window.innerHeight * 0.4;
        miniscreen.width = window.innerWidth * 0.35;
        ctx.fillStyle = background_miniscreen;
        ctx.fillRect(0, 0, miniscreen.width, miniscreen.height);
        screenChanged = false;
      }
    }

    //Getting data which user each player is and what screen he's on.
    p5socket.on("user", function (data) {
      user = data;
      screen = data;
      onscreenPositions = [{ x: 200, y: 200 }];
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
        let size = 40;
        let graphics;
        let xoff = 1;
        let roff = 30; //noise radius along the circle lines
        let xn = 5;

        //p5 setup method
        p5.setup = () => {
          p5.createCanvas(window.innerWidth, window.innerHeight);
          p5.background(30);
          p5.noStroke();
          p5.frameRate(10);
          p5.colorMode(p5.HSB, 255);
          p5.angleMode(p5.DEGREES);
          p5.fill(wobbleColors[0]);
          graphics = p5.createGraphics(window.innerWidth, window.innerHeight);
          graphics.noStroke();
          graphics.colorMode(p5.HSB, 255);
          p5socket.on(screen, p5.drawing); //calling on drawing method from socket
          p5.initGraphics();
        };

        //only called when the object is moved
        p5.drawing = (position) => {
          onscreenPositions = position.coordinates;
          p5.animation();
        };

        p5.draw = () => {
          p5.animation();
        };

        p5socket.on("miniscreen", animateMiniscreen);
        function animateMiniscreen(position) {
          ctx.fillStyle = background_miniscreen;
          ctx.clearRect(0, 0, miniscreen.width, miniscreen.height);
          ctx.fillRect(0, 0, miniscreen.width, miniscreen.height);
          ctx.fillStyle = wobbleColors[0];
          for (let i = 0; i < position[user].length - 1; i++) {
            let screenIndex = position[user].length - 1;
            let minix =
              (position[user][i].x / position[user][screenIndex].width) *
              miniscreen.width;
            let miniy =
              (position[user][i].y / position[user][screenIndex].height) *
              miniscreen.height;
            ctx.beginPath();
            ctx.arc(minix, miniy, 10, 0, 2 * Math.PI);
            ctx.fill();
          }
        }

        p5.animation = () => {
          graphics.fill(colors[0]);
          //p5.tint(255, 50);   //ist eine performance bremse :(
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
          let rn = 10;
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
          graphics.background(30);
          p5.triangleField();
          p5.noisy();
          p5.image(graphics, 0, 0);
        };

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
          let disty = window.innerHeight / 20;
          sizegraphics = 10 * distx;
          for (let y = -disty; y < window.innerHeight + disty; y += disty) {
            let xoff = 0;
            for (let x = -distx; x < window.innerWidth + distx; x += distx) {
              let r = 220 + p5.noise(xoff, yoff) * 20;
              let d = 150 - p5.noise(xoff, yoff) * 200;
              let w = 40 + p5.noise(xoff, yoff) * 100;
              graphics.fill(r, w, d);
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
    },

    moving(e) {
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
