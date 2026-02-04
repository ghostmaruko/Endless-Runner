// =====================
// Canvas Setup
// =====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// =====================
// Constants
// =====================
const GROUND_Y = 300;

const GRAVITY = 0.6;
const JUMP_FORCE = -15;

const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 60;

const OBSTACLE_TYPES = {
  GROUND: "ground",
  AIR: "air",
};

const AIR_OBSTACLE_HEIGHT = 40;
const AIR_OBSTACLE_Y_OFFSET = 120;

// =====================
// Game State
// =====================
let lastTime = 0;
let obstacleTimer = 0;
let difficultyTimer = 0;

let score = 0;
let gameOver = false;

const obstacles = [];

// =====================
// Difficulty Scaling
// =====================
let obstacleSpeed = 6;
let spawnInterval = 1500;

const MAX_OBSTACLE_SPEED = 15;
const MIN_SPAWN_INTERVAL = 600;

const updateDifficulty = (deltaTime) => {
  difficultyTimer += deltaTime;

  if (difficultyTimer >= 5000) {
    obstacleSpeed = Math.min(obstacleSpeed + 0.5, MAX_OBSTACLE_SPEED);
    spawnInterval = Math.max(spawnInterval - 100, MIN_SPAWN_INTERVAL);
    difficultyTimer = 0;
  }
};

// =====================
// Player
// =====================
const player = {
  x: 50,
  y: GROUND_Y,
  width: 50,
  height: 50,
  velocityY: 0,
  isJumping: false,

  update() {
    this.velocityY += GRAVITY;
    this.y += this.velocityY;

    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.velocityY = 0;
      this.isJumping = false;
    }
  },

  draw() {
    ctx.fillStyle = "white";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  },

  jump() {
    if (!this.isJumping && !gameOver) {
      this.velocityY = JUMP_FORCE;
      this.isJumping = true;
    }
  },
};

// =====================
// Obstacles
// =====================
const spawnObstacle = () => {
  const type = Math.random() < 0.7 ? OBSTACLE_TYPES.GROUND : OBSTACLE_TYPES.AIR;

  const obstacle =
    type === OBSTACLE_TYPES.GROUND
      ? {
          type,
          x: GAME_WIDTH,
          y: GROUND_Y + (player.height - OBSTACLE_HEIGHT),
          width: OBSTACLE_WIDTH,
          height: OBSTACLE_HEIGHT,
          passed: false,
        }
      : {
          type,
          x: GAME_WIDTH,
          y: GROUND_Y - AIR_OBSTACLE_Y_OFFSET,
          width: OBSTACLE_WIDTH,
          height: AIR_OBSTACLE_HEIGHT,
          passed: false,
        };

  obstacles.push(obstacle);
};

const updateObstacles = (deltaTime) => {
  obstacleTimer += deltaTime;

  if (obstacleTimer >= spawnInterval) {
    spawnObstacle();
    obstacleTimer = 0;
  }

  obstacles.forEach((obstacle) => {
    obstacle.x -= obstacleSpeed;

    // score when passed
    if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
      obstacle.passed = true;
      score++;
    }

    // collision
    if (checkCollision(player, obstacle)) {
      gameOver = true;
    }
  });

  // cleanup (SAFE)
  while (obstacles.length && obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
  }
};

const drawObstacles = () => {
  obstacles.forEach((obstacle) => {
    ctx.fillStyle =
      obstacle.type === OBSTACLE_TYPES.GROUND
        ? "red"
        : "orange";

    ctx.fillRect(
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  });
};


// =====================
// Collision
// =====================
const checkCollision = (a, b) => {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
};

// =====================
// UI
// =====================
const drawGround = () => {
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + player.height);
  ctx.lineTo(GAME_WIDTH, GROUND_Y + player.height);
  ctx.stroke();
};

const drawScore = () => {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 20, 30);
};

const drawGameOver = () => {
  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.fillText("GAME OVER", 260, 180);

  ctx.font = "18px Arial";
  ctx.fillText("Refresh to restart", 300, 220);

  ctx.font = "14px Arial";
  ctx.fillText(`Speed: ${obstacleSpeed.toFixed(1)}`, 20, 55);
};

// =====================
// Game Loop
// =====================
const update = (deltaTime) => {
  if (gameOver) return;

  player.update();
  updateDifficulty(deltaTime);
  updateObstacles(deltaTime);
};

const draw = () => {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  drawGround();
  player.draw();
  drawObstacles();
  drawScore();

  if (gameOver) {
    drawGameOver();
  }
};

const gameLoop = (timestamp) => {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);

// =====================
// Input
// =====================
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    player.jump();
  }
});

document.addEventListener("mousedown", () => {
  player.jump();
});
