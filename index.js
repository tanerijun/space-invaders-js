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
    this.speed = 5;
    this.rotation = 0;

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

  #draw() {
    ctx.save();

    // Rotate player (for tilt effect)
    ctx.translate(this.position.x + this.width / 2, this.position.y + this.height / 2); // makes the middle of player (0, 0)
    ctx.rotate(this.rotation);
    ctx.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2); // revert to original coord system

    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
    ctx.restore();
  }

  update() {
    if (!this.image) {
      return;
    }
    this.#draw();
    this.position.x += this.velocity.x;
  }

  moveLeft() {
    this.velocity.x = -this.speed;
    this.rotation = -0.15;
  }

  moveRight() {
    this.velocity.x = this.speed;
    this.rotation = 0.15;
  }

  stop() {
    this.velocity.x = 0;
    this.rotation = 0;
  }
}

class Game {
  constructor() {
    this.player = new Player();
    this.playerSpeed = 5;
    this.keys = {
      ArrowLeft: {
        pressed: false,
      },
      ArrowRight: {
        pressed: false,
      },
    };

    window.addEventListener("keydown", ({ key }) => {
      switch (key) {
        case "ArrowLeft":
          this.keys.ArrowLeft.pressed = true;
          break;
        case "ArrowRight":
          this.keys.ArrowRight.pressed = true;
          break;
        case "z":
          console.log("z");
          break;
      }
    });

    window.addEventListener("keyup", ({ key }) => {
      switch (key) {
        case "ArrowLeft":
          this.keys.ArrowLeft.pressed = false;
          break;
        case "ArrowRight":
          this.keys.ArrowRight.pressed = false;
          break;
        case "z":
          console.log("z");
          break;
      }
    });

    this.loop = this.loop.bind(this);
  }

  loop() {
    requestAnimationFrame(this.loop);

    // Set background to black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.player.update();

    const bothKeysArePressed = this.keys.ArrowLeft.pressed && this.keys.ArrowRight.pressed;
    if (!bothKeysArePressed && this.keys.ArrowLeft.pressed && this.player.position.x >= 0) {
      this.player.moveLeft();
    } else if (
      !bothKeysArePressed &&
      this.keys.ArrowRight.pressed &&
      this.player.position.x + this.player.width <= canvas.width
    ) {
      this.player.moveRight();
    } else {
      this.player.stop();
    }
  }
}

const game = new Game();
game.loop();
