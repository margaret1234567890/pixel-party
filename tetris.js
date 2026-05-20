const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const linesEl = document.getElementById('lines');
const levelEl = document.getElementById('level');
const overlay = document.getElementById('tetrisOverlay');
const restartBtn = document.getElementById('restartTetris');
const pauseBtn = document.getElementById('pauseTetris');
const startBtn = document.getElementById('startTetris');
const startOverlay = document.getElementById('tetrisStartOverlay');

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;
const COLORS = [null, '#78ffb8', '#b8a5ff', '#ffb36b', '#75f6ff', '#ffe66f', '#ff7cab', '#8cff76'];

const SHAPES = [
  [],
  [[1, 1, 1, 1]],
  [[2, 0, 0], [2, 2, 2]],
  [[0, 0, 3], [3, 3, 3]],
  [[4, 4], [4, 4]],
  [[0, 5, 5], [5, 5, 0]],
  [[0, 6, 0], [6, 6, 6]],
  [[7, 7, 0], [0, 7, 7]]
];

let board;
let piece;
let score;
let lines;
let level;
let dropCounter;
let dropInterval;
let lastTime;
let gameOver;
let isPlaying = false;
let isPaused = false;

function makeBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * 7) + 1;
  const shape = SHAPES[type].map((row) => [...row]);
  return {
    x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
    y: 0,
    shape
  };
}

function collide(b, p) {
  for (let y = 0; y < p.shape.length; y++) {
    for (let x = 0; x < p.shape[y].length; x++) {
      if (p.shape[y][x] !== 0) {
        const ny = p.y + y;
        const nx = p.x + x;
        if (nx < 0 || nx >= COLS || ny >= ROWS || (ny >= 0 && b[ny][nx] !== 0)) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[piece.y + y][piece.x + x] = value;
      }
    });
  });
}

function clearLines() {
  let cleared = 0;
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x] === 0) continue outer;
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    cleared++;
    y++;
  }

  if (cleared > 0) {
    const scoreTable = [0, 100, 300, 500, 800];
    score += scoreTable[cleared] * level;
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(120, 800 - (level - 1) * 60);
    updateStats();
  }
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
}

function rotatePiece() {
  const original = piece.shape;
  piece.shape = rotate(piece.shape);

  let offset = 1;
  while (collide(board, piece)) {
    piece.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (Math.abs(offset) > piece.shape[0].length) {
      piece.shape = original;
      return;
    }
  }
}

function spawnPiece() {
  piece = randomPiece();
  if (collide(board, piece)) {
    gameOver = true;
    overlay.classList.add('show');
  }
}

function hardDrop() {
  while (!collide(board, piece)) piece.y++;
  piece.y--;
  lockPiece();
}

function lockPiece() {
  merge();
  clearLines();
  spawnPiece();
}

function updateStats() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
  ctx.strokeStyle = '#06110b';
  ctx.lineWidth = 2;
  ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
}

function drawGrid() {
  ctx.strokeStyle = '#1b3324';
  ctx.lineWidth = 1;
  for (let x = 0; x <= COLS; x++) {
    ctx.beginPath();
    ctx.moveTo(x * BLOCK, 0);
    ctx.lineTo(x * BLOCK, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= ROWS; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * BLOCK);
    ctx.lineTo(canvas.width, y * BLOCK);
    ctx.stroke();
  }
}

function ghostY() {
  const testPiece = {
    x: piece.x,
    y: piece.y,
    shape: piece.shape
  };
  while (!collide(board, testPiece)) {
    testPiece.y++;
  }
  return testPiece.y - 1;
}

function drawGhostPiece() {
  if (!isPlaying || gameOver || isPaused) return;
  const gy = ghostY();
  ctx.fillStyle = '#9df9b833';
  ctx.strokeStyle = '#9df9b877';
  ctx.lineWidth = 1.5;
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (!value) return;
      const px = (piece.x + x) * BLOCK;
      const py = (gy + y) * BLOCK;
      ctx.fillRect(px, py, BLOCK, BLOCK);
      ctx.strokeRect(px, py, BLOCK, BLOCK);
    });
  });
}

function draw() {
  ctx.fillStyle = '#08110c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) drawCell(x, y, COLORS[value]);
    });
  });

  drawGhostPiece();

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) drawCell(piece.x + x, piece.y + y, COLORS[value]);
    });
  });
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;

  if (isPlaying && !isPaused && !gameOver) {
    dropCounter += delta;
    if (dropCounter > dropInterval) {
      piece.y++;
      if (collide(board, piece)) {
        piece.y--;
        lockPiece();
      }
      dropCounter = 0;
    }
  }

  draw();
  requestAnimationFrame(update);
}

function move(dir) {
  piece.x += dir;
  if (collide(board, piece)) piece.x -= dir;
}

function softDrop() {
  piece.y++;
  if (collide(board, piece)) {
    piece.y--;
    lockPiece();
  }
  dropCounter = 0;
}

function setPauseButtonLabel() {
  pauseBtn.textContent = isPaused ? 'RESUME' : 'PAUSE';
}

function togglePause() {
  if (!isPlaying || gameOver) return;
  isPaused = !isPaused;
  dropCounter = 0;
  setPauseButtonLabel();
}

function resetGame() {
  board = makeBoard();
  score = 0;
  lines = 0;
  level = 1;
  dropCounter = 0;
  dropInterval = 800;
  lastTime = 0;
  gameOver = false;
  isPaused = false;
  overlay.classList.remove('show');
  spawnPiece();
  updateStats();
  setPauseButtonLabel();
}

function startGame() {
  isPlaying = true;
  startOverlay.classList.add('hidden');
  resetGame();
}

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (key === 'p') {
    togglePause();
    return;
  }

  if (!isPlaying) return;

  if (gameOver) {
    if (key === 'r') resetGame();
    return;
  }

  if (isPaused) return;

  if (event.key === 'ArrowLeft') move(-1);
  else if (event.key === 'ArrowRight') move(1);
  else if (event.key === 'ArrowDown') softDrop();
  else if (event.key === 'ArrowUp') rotatePiece();
  else if (event.code === 'Space') hardDrop();
  else if (key === 'r') resetGame();
});

restartBtn.addEventListener('click', () => {
  if (!isPlaying) {
    startGame();
    return;
  }
  resetGame();
});

pauseBtn.addEventListener('click', togglePause);
startBtn.addEventListener('click', startGame);

board = makeBoard();
piece = randomPiece();
score = 0;
lines = 0;
level = 1;
setPauseButtonLabel();
updateStats();
draw();
update();
