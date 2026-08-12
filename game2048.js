const boardEl = document.getElementById('board2048');
const scoreEl2048 = document.getElementById('score2048');
const bestTileEl = document.getElementById('bestTile');
const overlay2048 = document.getElementById('overlay2048');
const restart2048Btn = document.getElementById('restart2048');
const start2048Btn = document.getElementById('start2048');
const startOverlay2048 = document.getElementById('startOverlay2048');

let board;
let score2048;
let gameOver2048;
let boardBg;
let tileLayer;
let started2048 = false;

const colors = {
  0: '#132017',
  2: '#e5ffef',
  4: '#cbffd8',
  8: '#b3ffc8',
  16: '#9effba',
  32: '#88ffaa',
  64: '#6df592',
  128: '#5ae27f',
  256: '#45d56f',
  512: '#34c15f',
  1024: '#2db456',
  2048: '#25a84f'
};

function ensureBoardChrome() {
  if (boardBg && tileLayer) return;

  boardBg = document.createElement('div');
  boardBg.className = 'board-bg';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    boardBg.appendChild(cell);
  }

  tileLayer = document.createElement('div');
  tileLayer.className = 'tile-layer';

  boardEl.innerHTML = '';
  boardEl.append(boardBg, tileLayer);
}

function emptyBoard() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function randomEmptyCell() {
  const empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) empty.push({ r, c });
    }
  }
  if (!empty.length) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

function addRandomTile() {
  const cell = randomEmptyCell();
  if (!cell) return;
  board[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
}

function slide(row) {
  const filtered = row.filter((n) => n !== 0);
  const merged = [];

  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      const value = filtered[i] * 2;
      merged.push(value);
      score2048 += value;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < 4) merged.push(0);
  return merged;
}

function cloneBoard(b) {
  return b.map((row) => [...row]);
}

function boardsEqual(a, b) {
  return a.every((row, r) => row.every((v, c) => v === b[r][c]));
}

function moveLeft() {
  board = board.map((row) => slide(row));
}

function moveRight() {
  board = board.map((row) => slide([...row].reverse()).reverse());
}

function transpose() {
  board = board[0].map((_, c) => board.map((row) => row[c]));
}

function makeMove(direction) {
  const before = cloneBoard(board);

  if (direction === 'left') moveLeft();
  if (direction === 'right') moveRight();
  if (direction === 'up') {
    transpose();
    moveLeft();
    transpose();
  }
  if (direction === 'down') {
    transpose();
    moveRight();
    transpose();
  }

  if (!boardsEqual(before, board)) {
    addRandomTile();
    render();
    checkGameOver();
  }
}

function checkGameOver() {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return;
      if (c < 3 && board[r][c] === board[r][c + 1]) return;
      if (r < 3 && board[r][c] === board[r + 1][c]) return;
    }
  }
  gameOver2048 = true;
  const earned = PixelPartyShop.awardGamePoints(score2048);
  overlay2048.textContent = earned ? `NO MOVES LEFT · +${earned} SHOP POINT${earned === 1 ? '' : 'S'}` : 'NO MOVES LEFT';
  overlay2048.classList.add('show');
}

function tileColor(value) {
  return colors[value] || '#1bde61';
}

function getBoardMetrics() {
  const rect = tileLayer.getBoundingClientRect();
  const gap = 10;
  const size = (rect.width - gap * 3) / 4;
  return { size, gap };
}

function buildTiles() {
  const tiles = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const value = board[r][c];
      if (value !== 0) tiles.push({ value, r, c });
    }
  }
  return tiles;
}

function render() {
  ensureBoardChrome();
  const { size, gap } = getBoardMetrics();
  const currentTiles = buildTiles();
  tileLayer.innerHTML = '';

  let highest = 0;
  currentTiles.forEach((tile) => {
    highest = Math.max(highest, tile.value);

    const tileEl = document.createElement('div');
    tileEl.className = 'tile2048';

    tileEl.textContent = tile.value;
    tileEl.style.background = tileColor(tile.value);
    tileEl.style.color = tile.value >= 128 ? '#06220f' : '#10301a';
    tileEl.style.width = `${size}px`;
    tileEl.style.height = `${size}px`;

    const toX = tile.c * (size + gap);
    const toY = tile.r * (size + gap);
    tileEl.style.transform = `translate3d(${toX}px, ${toY}px, 0)`;

    tileLayer.appendChild(tileEl);
  });

  scoreEl2048.textContent = score2048;
  bestTileEl.textContent = highest;
}

function reset2048() {
  board = emptyBoard();
  score2048 = 0;
  gameOver2048 = false;
  overlay2048.classList.remove('show');
  overlay2048.textContent = 'NO MOVES LEFT';
  addRandomTile();
  addRandomTile();
  render(false);
}

function start2048Game() {
  started2048 = true;
  startOverlay2048.classList.add('hidden');
  reset2048();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }

  if (event.key.toLowerCase() === 'r') {
    if (!started2048) return;
    reset2048();
    return;
  }

  if (!started2048 || gameOver2048) return;

  const keyMap = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down'
  };

  const move = keyMap[event.key];
  if (move) {
    event.preventDefault();
    makeMove(move);
  }
});

restart2048Btn.addEventListener('click', () => {
  if (!started2048) return;
  reset2048();
});

start2048Btn.addEventListener('click', start2048Game);
window.addEventListener('resize', render);

board = emptyBoard();
score2048 = 0;
gameOver2048 = false;
render();
