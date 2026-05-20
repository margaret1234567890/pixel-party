const snakeCanvas = document.getElementById('snakeCanvas');
const sctx = snakeCanvas.getContext('2d');
const snakeScoreEl = document.getElementById('snakeScore');
const snakeBestEl = document.getElementById('snakeBest');
const snakeOverlay = document.getElementById('snakeOverlay');
const restartSnakeBtn = document.getElementById('restartSnake');
const pauseSnakeBtn = document.getElementById('pauseSnake');
const startSnakeBtn = document.getElementById('startSnake');
const snakeStartOverlay = document.getElementById('snakeStartOverlay');

const GRID_SIZE = 28;
const TILE = snakeCanvas.width / GRID_SIZE;

let snake;
let food;
let dir;
let nextDir;
let score;
let best = Number(localStorage.getItem('pixelPartySnakeBest') || 0);
let running;
let snakeStarted = false;
let snakePaused = false;

function placeFood() {
  while (true) {
    const pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    if (!snake.some((segment) => segment.x === pos.x && segment.y === pos.y)) return pos;
  }
}

function setPauseButtonLabel() {
  pauseSnakeBtn.textContent = snakePaused ? 'RESUME' : 'PAUSE';
}

function resetSnake() {
  snake = [
    { x: 12, y: 14 },
    { x: 11, y: 14 },
    { x: 10, y: 14 }
  ];
  dir = { x: 1, y: 0 };
  nextDir = { ...dir };
  score = 0;
  running = snakeStarted;
  snakePaused = false;
  snakeOverlay.classList.remove('show');
  food = placeFood();
  snakeScoreEl.textContent = score;
  snakeBestEl.textContent = best;
  setPauseButtonLabel();
}

function drawSnake() {
  sctx.fillStyle = '#08110c';
  sctx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  sctx.strokeStyle = '#143020';
  sctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    sctx.beginPath();
    sctx.moveTo(i * TILE, 0);
    sctx.lineTo(i * TILE, snakeCanvas.height);
    sctx.stroke();
    sctx.beginPath();
    sctx.moveTo(0, i * TILE);
    sctx.lineTo(snakeCanvas.width, i * TILE);
    sctx.stroke();
  }

  snake.forEach((segment, i) => {
    sctx.fillStyle = i === 0 ? '#d9ffea' : '#7dffae';
    sctx.fillRect(segment.x * TILE + 2, segment.y * TILE + 2, TILE - 4, TILE - 4);
  });

  sctx.fillStyle = '#ff6e86';
  sctx.fillRect(food.x * TILE + 3, food.y * TILE + 3, TILE - 6, TILE - 6);
}

function step() {
  if (!running || snakePaused) {
    drawSnake();
    return;
  }

  dir = nextDir;
  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= GRID_SIZE ||
    head.y >= GRID_SIZE ||
    snake.some((segment) => segment.x === head.x && segment.y === head.y)
  ) {
    running = false;
    snakeOverlay.classList.add('show');
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    if (score > best) {
      best = score;
      localStorage.setItem('pixelPartySnakeBest', String(best));
    }
    snakeScoreEl.textContent = score;
    snakeBestEl.textContent = best;
    food = placeFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function toggleSnakePause() {
  if (!snakeStarted || !running) return;
  snakePaused = !snakePaused;
  setPauseButtonLabel();
}

function startSnakeGame() {
  snakeStarted = true;
  snakeStartOverlay.classList.add('hidden');
  resetSnake();
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'p') {
    toggleSnakePause();
    return;
  }

  if (key === 'r') {
    if (!snakeStarted) {
      startSnakeGame();
      return;
    }
    resetSnake();
    return;
  }

  if (!snakeStarted || !running || snakePaused) return;

  if (event.key === 'ArrowUp' && dir.y !== 1) nextDir = { x: 0, y: -1 };
  if (event.key === 'ArrowDown' && dir.y !== -1) nextDir = { x: 0, y: 1 };
  if (event.key === 'ArrowLeft' && dir.x !== 1) nextDir = { x: -1, y: 0 };
  if (event.key === 'ArrowRight' && dir.x !== -1) nextDir = { x: 1, y: 0 };
});

restartSnakeBtn.addEventListener('click', () => {
  if (!snakeStarted) {
    startSnakeGame();
    return;
  }
  resetSnake();
});

pauseSnakeBtn.addEventListener('click', toggleSnakePause);
startSnakeBtn.addEventListener('click', startSnakeGame);

resetSnake();
setPauseButtonLabel();
drawSnake();
setInterval(step, 95);
