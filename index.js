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

class Projectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 3;
  }

  #draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.#draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.position = position;

    const image = new Image();
    image.src = "assets/image/invader.png";
    image.onload = () => {
      this.image = image;
      this.width = this.image.width;
      this.height = this.image.height;
    };
  }

  #draw() {
    ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height);
  }

  update({ velocity }) {
    if (!this.image) {
      return;
    }

    this.#draw();
    this.position.x += velocity.x;
    this.position.y += velocity.y;
  }

  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: { x: this.position.x + this.width / 2, y: this.position.y + this.height + 5 },
        velocity: { x: 0, y: 3 },
      }),
    );
  }
}

class EnemyGrid {
  constructor() {
    this.position = {
      x: 0,
      y: 0,
    };
    this.velocity = {
      x: 1,
      y: 0,
    };
    this.invaders = [];
    this.isCleared = false;

    const size = 30;
    const columns = Math.floor(Math.random() * 10 + 6);
    const rows = Math.floor(Math.random() * 5 + 3);

    this.width = size * columns;
    this.height = size * rows;

    for (let x = 0; x < this.width; x += size) {
      for (let y = 0; y < this.height; y += size) {
        this.invaders.push(new Invader({ position: { x, y } }));
      }
    }
  }

  update({ projectiles, invaderProjectiles, particles }) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x <= 0 || this.position.x + this.width > canvas.width) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y += 0.05;
    }

    this.invaders.forEach((invader, i) => {
      invader.update({ velocity: this.velocity });

      if (Math.random() * 100 > 99.95) {
        invader.shoot(invaderProjectiles);
      }

      projectiles.forEach((projectile, j) => {
        if (
          projectile.position.x + projectile.radius >= invader.position.x &&
          projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
          projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
          projectile.position.y + projectile.radius >= invader.position.y
        ) {
          setTimeout(() => {
            const invaderFound = this.invaders.find((invader2) => invader2 === invader);
            const projectileFound = projectiles.find((projectile2) => projectile2 == projectile);

            // Remove invader and projectile
            if (invaderFound && projectileFound) {
              this.invaders.splice(i, 1);
              projectiles.splice(j, 1);
            }

            // Add explosion effect
            Particle.createParticles({ container: particles, object: invader });
          }, 0);
        }
      });
    });

    if (this.invaders.length === 0) {
      this.isCleared = true;
    }
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.width = 3;
    this.height = 10;
  }

  #draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.#draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Particle {
  constructor({ position, velocity, radius, color, fades = true }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
    this.fades = fades;
  }

  #draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }

  update() {
    this.#draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.fades) {
      this.opacity -= 0.01;
      this.opacity = Math.max(0, this.opacity); // ReLU because -opacity is not transparent
    }
  }

  static createParticles({ container, object, color }) {
    for (let i = 0; i < 15; i++) {
      container.push(
        new Particle({
          position: {
            x: object.position.x + object.width / 2,
            y: object.position.y + object.height / 2,
          },
          velocity: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
          },
          radius: Math.random() * 3,
          color: color || "#BAA0DE",
        }),
      );
    }
  }
}

class Game {
  constructor() {
    this.player = new Player();
    this.projectiles = [];
    this.invaderProjectiles = [];
    this.enemyGrids = [];
    this.particles = [];
    this.isProjectileFired = false;

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
          if (!this.isProjectileFired) {
            this.#spawnProjectile();
            this.isProjectileFired = true;
          }
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
          this.isProjectileFired = false;
          break;
      }
    });

    // Add background stars
    for (let i = 0; i < canvas.width * 0.025; i++) {
      this.particles.push(
        new Particle({
          position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
          },
          velocity: {
            x: 0,
            y: 0.2,
          },
          radius: Math.random() * 3,
          color: "white",
          fades: false,
        }),
      );
    }

    this.loop = this.loop.bind(this);
  }

  loop() {
    requestAnimationFrame(this.loop);

    // Set background to black
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.player.update();

    this.particles.forEach((particle, i) => {
      // Reposition star particles when they go off screen
      if (particle.position.y - particle.radius >= canvas.height) {
        particle.position.x = Math.random() * canvas.width;
        particle.position.y = Math.random() * canvas.height;
      }

      // Remove explosion particle that's done
      if (particle.opacity <= 0) {
        setTimeout(() => {
          this.particles.splice(i, 1);
        }, 0);
      }
      particle.update();
    });

    this.enemyGrids.forEach((grid, i) => {
      grid.update({
        projectiles: this.projectiles,
        invaderProjectiles: this.invaderProjectiles,
        particles: this.particles,
      });
      if (grid.isCleared) {
        this.enemyGrids.splice(i, 1);
      }
    });

    if (
      this.enemyGrids.length === 0 ||
      this.enemyGrids.at(-1).position.y > canvas.height / 2 - Math.floor(Math.random() * 150)
    ) {
      this.enemyGrids.push(new EnemyGrid());
    }

    this.projectiles.forEach((projectile, i) => {
      if (projectile.position.y + projectile.radius <= 0) {
        setTimeout(() => {
          this.projectiles.splice(i, 1);
        }, 0);
      } else {
        projectile.update();
      }
    });

    this.invaderProjectiles.forEach((projectile, i) => {
      if (projectile.position.y >= canvas.height) {
        setTimeout(() => {
          this.invaderProjectiles.splice(i, 1);
        }, 0);
      } else {
        projectile.update();
      }

      // Projectile hits player
      if (
        projectile.position.y + projectile.height >= this.player.position.y &&
        projectile.position.x + projectile.width > this.player.position.x &&
        projectile.position.x < this.player.position.x + this.player.width
      ) {
        setTimeout(() => {
          this.invaderProjectiles.splice(i, 1);
        }, 0);

        // Explosion effect
        Particle.createParticles({
          container: this.particles,
          object: this.player,
          color: "white",
        });
      }
    });

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

  #spawnProjectile() {
    this.projectiles.push(
      new Projectile({
        position: {
          x: this.player.position.x + this.player.width / 2,
          y: this.player.position.y - 10,
        },
        velocity: { x: 0, y: -10 },
      }),
    );
  }
}

const game = new Game();
game.loop();
