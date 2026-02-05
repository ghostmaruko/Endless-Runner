const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const GROUND_Y = 250;
const GRAVITY = 0.6;

// ---------- Player ----------
class Player {
  constructor(game) {
    this.game = game;
    this.width = 40;
    this.height = 40;
    this.x = 80;
    this.y = GROUND_Y - this.height;
    this.velocityY = 0;
    this.isJumping = false;
  }

  jump() {
    if (this.isJumping || this.game.gameOver) return;

    this.velocityY = -12;
    this.isJumping = true;
  }

  update() {
    this.velocityY += GRAVITY;
    this.y += this.velocityY;

    if (this.y >= GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.velocityY = 0;
      this.isJumping = false;
    }
  }

  draw() {
    ctx.fillStyle = "#222";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// ---------- Obstacle ----------
class Obstacle {
  constructor(speed) {
    this.width = 30;
    this.height = 30;
    this.x = canvas.width;
    this.y = GROUND_Y - this.height;
    this.speed = speed;
  }

  update() {
    this.x -= this.speed;
  }

  draw() {
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }
}

// ---------- Game ----------
class Game {
  constructor() {
    this.resetGame();
    this.bindEvents();
    requestAnimationFrame(() => this.loop());
  }

  resetGame() {
    this.player = new Player(this);
    this.obstacles = [];
    this.speed = 5;
    this.score = 0;
    this.gameOver = false;

    this.spawnTimer = 0;
    this.nextSpawnTime = this.randomSpawnTime();
  }

  bindEvents() {
    // SPACE → jump
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        this.player.jump();
      }
    });

    // TAP / CLICK
    canvas.addEventListener("pointerdown", () => {
      if (this.gameOver) {
        this.resetGame();
        return;
      }
      this.player.jump();
    });
  }

  randomSpawnTime() {
    // tra 60 e 150 frame
    return Math.floor(Math.random() * 90) + 60;
  }

  spawnObstacle() {
    this.obstacles.push(new Obstacle(this.speed));

    // spawn multiplo (cluster)
    if (Math.random() < 0.35) {
      const extraGap = Math.random() * 40 + 30;
      const extra = new Obstacle(this.speed);
      extra.x += extraGap;
      this.obstacles.push(extra);
    }
  }

  update() {
    if (this.gameOver) return;

    this.player.update();

    this.spawnTimer++;
    if (this.spawnTimer >= this.nextSpawnTime) {
      this.spawnObstacle();
      this.spawnTimer = 0;
      this.nextSpawnTime = this.randomSpawnTime();
    }

    this.obstacles.forEach((obs) => obs.update());
    this.obstacles = this.obstacles.filter((obs) => !obs.isOffScreen());

    this.checkCollisions();

    this.score++;
    if (this.score % 500 === 0) {
      this.speed += 0.3;
    }
  }

  checkCollisions() {
    for (const obs of this.obstacles) {
      if (
        this.player.x < obs.x + obs.width &&
        this.player.x + this.player.width > obs.x &&
        this.player.y < obs.y + obs.height &&
        this.player.y + this.player.height > obs.y
      ) {
        this.gameOver = true;
        break;
      }
    }
  }

  drawGround() {
    ctx.strokeStyle = "#555";
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();
  }

  drawScore() {
    ctx.fillStyle = "#000";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${this.score}`, 20, 30);
  }

  drawGameOverOverlay() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, 120);

    ctx.font = "18px Arial";
    ctx.fillText("Tap or click to restart", canvas.width / 2, 160);

    ctx.textAlign = "left";
  }

  loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.update();

    this.drawGround();
    this.player.draw();
    this.obstacles.forEach((obs) => obs.draw());
    this.drawScore();

    if (this.gameOver) {
      this.drawGameOverOverlay();
    }

    requestAnimationFrame(() => this.loop());
  }
}

// ---------- Start ----------
new Game();
