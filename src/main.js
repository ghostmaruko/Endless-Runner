// ======================
// CANVAS SETUP
// ======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ======================
// GAME DIMENSIONS
// ======================
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// ======================
// GROUND & PHYSICS
// ======================
const GROUND_Y = 350;
const GRAVITY = 0.6;
const JUMP_FORCE = -15;

// ======================
// GAME STATE
// ======================
const GameState = {
  PLAYING: "playing",
  GAME_OVER: "game_over",
};

let currentState = GameState.PLAYING;

// ======================
// SCORE
// ======================
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

// ======================
// PLAYER
// ======================
const player = {
  x: 50,
  y: GROUND_Y,
  width: 50,
  height: 50,
  velocityY: 0,
  isJumping: false,
};

// ======================
// OBSTACLES
// ======================
const obstacles = [];

const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 60;
const OBSTACLE_SPEED = 6;

let obstacleSpawnTimer = 0;
const OBSTACLE_SPAWN_INTERVAL = 1500; // ms

// ======================
// GAME LOOP
// ======================
let lastTime = 0;

function gameLoop(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

// ======================
// UPDATE
// ======================
function update(deltaTime) {
  if (currentState !== GameState.PLAYING) return;

  // ---- SCORE ----
  score += deltaTime * 0.01;

  // ---- PLAYER PHYSICS ----
  player.velocityY += GRAVITY;
  player.y += player.velocityY;

  if (player.y > GROUND_Y) {
    player.y = GROUND_Y;
    player.velocityY = 0;
    player.isJumping = false;
  }

  // ---- OBSTACLE SPAWN ----
  obstacleSpawnTimer += deltaTime;
  if (obstacleSpawnTimer > OBSTACLE_SPAWN_INTERVAL) {
    spawnObstacle();
    obstacleSpawnTimer = 0;
  }

  // ---- OBSTACLE MOVEMENT ----
  obstacles.forEach((obstacle) => {
    obstacle.x -= obstacle.speed;
  });

  // ---- COLLISION CHECK ----
  obstacles.forEach((obstacle) => {
    if (isColliding(player, obstacle)) {
      currentState = GameState.GAME_OVER;

      const finalScore = Math.floor(score);
      if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem("highScore", highScore);
      }
    }
  });

  // ---- CLEANUP OFF-SCREEN ----
  for (let i = obstacles.length - 1; i >= 0; i--) {
    if (obstacles[i].x + obstacles[i].width < 0) {
      obstacles.splice(i, 1);
    }
  }
}

// ======================
// DRAW
// ======================
function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // ---- SCORE UI ----
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${Math.floor(score)}`, 20, 30);
  ctx.fillText(`High Score: ${highScore}`, 20, 55);

  // ---- GAME OVER OVERLAY ----
  if (currentState === GameState.GAME_OVER) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "white";
    ctx.font = "36px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2);

    ctx.font = "18px Arial";
    ctx.fillText(
      "Press SPACE or click to restart",
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2 + 40,
    );
    return;
  }

  // ---- GROUND ----
  ctx.strokeStyle = "white";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y + player.height);
  ctx.lineTo(GAME_WIDTH, GROUND_Y + player.height);
  ctx.stroke();

  // ---- PLAYER ----
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // ---- OBSTACLES ----
  obstacles.forEach((obstacle) => {
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

// ======================
// INPUT
// ======================
document.addEventListener("keydown", (e) => {
  if (currentState === GameState.GAME_OVER) {
    restartGame();
    return;
  }

  if ((e.code === "Space" || e.code === "ArrowUp") && !player.isJumping) {
    jump();
  }
});

document.addEventListener("mousedown", () => {
  if (currentState === GameState.GAME_OVER) {
    restartGame();
    return;
  }

  if (!player.isJumping) {
    jump();
  }
});

function jump() {
  player.velocityY = JUMP_FORCE;
  player.isJumping = true;
}

// ======================
// RESTART GAME
// ======================
function restartGame() {
  obstacles.length = 0;
  obstacleSpawnTimer = 0;

  player.y = GROUND_Y;
  player.velocityY = 0;
  player.isJumping = false;

  score = 0;
  currentState = GameState.PLAYING;
}

// ======================
// OBSTACLE FACTORY
// ======================
function spawnObstacle() {
  const difficulty = Math.floor(score / 100);

  const obstacle = {
    x: GAME_WIDTH,
    y: GROUND_Y + (player.height - OBSTACLE_HEIGHT),
    width: OBSTACLE_WIDTH,
    height: OBSTACLE_HEIGHT,
    speed: OBSTACLE_SPEED + difficulty,
  };

  obstacles.push(obstacle);
}

// ======================
// COLLISION DETECTION
// ======================
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
