const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

function fullScreenCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

fullScreenCanvas();

window.addEventListener("resize", fullScreenCanvas);

class Player {
  constructor() {
    this.position = {
      x: 200,
      y: 200,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    // this.image
    this.width = 100;
    this.height = 100;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

const player = new Player();
player.draw();
