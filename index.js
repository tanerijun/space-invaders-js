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
    this.velocity = {
      x: 0,
      y: 0,
    };

    const image = new Image();
    image.src = "assets/image/spaceship.png";
    image.onload = () => {
      const scale = 0.15;
      this.image = image;
      this.width = this.image.width * scale;
      this.height = this.image.height * scale;
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20,
      };
    };
  }

  draw() {
    if (!this.image) {
      return;
    }
    // ctx.fillStyle = "red";
    // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }
}

class Game {
  constructor() {
    this.player = new Player();

    this.loop = this.loop.bind(this);
  }

  loop() {
    requestAnimationFrame(this.loop);

    // Set background to black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.player.draw();
  }
}

const game = new Game();
game.loop();
