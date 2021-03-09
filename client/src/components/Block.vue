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
p5socket = io.connect('http://localhost:3000');

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

  mounted() {
    document.addEventListener("keydown", (e) => {
      this.moving(e);
    });

    //p5 Implementation
    new P5(function (p5) {
      let size = 30; //ellipse size

       //p5 setup method
      p5.setup = () => {
        p5.createCanvas(window.innerWidth, window.innerHeight);
        p5.background(30);
        p5.strokeWeight(20)
        p5.stroke(255,0,0);
        p5socket.on('position', p5.draw);
        console.log("setup complete")
      };
      //p5 draw method
      p5.draw = (position) => {
        p5.ellipse(position.x, position.y, size);
        console.log(position.x + " : x positions y : " + position.y)
      };

  },);

    p5socket.emit("screenDef", {x:200, y:200, end: window.innerWidth})

  },

  methods: {
    move(direction) {
      p5socket.emit("move", direction);
    },

    moving(e) {
      console.log("in moving method 2");
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
