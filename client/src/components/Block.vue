<template>
  <div>
    <canvas
      ref="game"
      id="canvas"
      width="640"
      height="480"
      style="border: 1px solid black"
    ></canvas>
  </div>
</template>

<script>
import io from "socket.io-client";
// let headers = new Headers({
//     origin: "http://localhost:8080",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true
//   })

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
    this.socket = io("http://localhost:3000");
  },

  mounted() {
    this.context = document.getElementById("canvas").getContext("2d");
    this.context.fillStyle = "#FF0000";
    //console.log(this.context);
    //this.context.fillRect(20, 20, 20, 20);
    this.socket.on("position", (data) => {
      this.position = data;
      //console.log("before drawing rectangle");
      this.context.clearRect(
        0,
        0,
        document.getElementById("canvas"),
        document.getElementById("canvas").height
      );
      this.context.fillRect(this.position.x, this.position.y, 20, 20);
    });

    document.addEventListener("keydown", (e) => {
      this.moving(e);
    });
  },

  methods: {
    // move: function (direction) {
    //   console.log("function called");
    //   this.socket.emit("move", direction);
    // },
    move(direction) {
      this.socket.emit("move", direction);
    },

    moving(e) {
      console.log("in moving method 2")
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
