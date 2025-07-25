// ========== 1. Hiệu ứng nền hình vuông trôi ==========
(function createFloatingSquares() {
  const container = document.getElementById('floating-pattern');
  const count = 60;
  const used = new Set();

  for (let i = 0; i < count; i++) {
    const sq = document.createElement('div');
    sq.classList.add('square');

    let left, bottom, key;
    do {
      left = Math.floor(Math.random() * 95);
      bottom = Math.floor(Math.random() * 60);
      key = `${left}-${bottom}`;
    } while (used.has(key));

    used.add(key);
    const size = 20 + Math.random() * 20;
    sq.style.left = `${left}vw`;
    sq.style.bottom = `${bottom}vh`;
    sq.style.width = `${size}px`;
    sq.style.height = `${size}px`;
    sq.style.animationDuration = `${12 + Math.random() * 10}s`;
    container.appendChild(sq);
  }
})();

// ========== 2. Đổi chế độ sáng/tối ==========
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');

  function updateThemeIcon() {
    themeIcon.className = document.body.classList.contains('light-mode')
      ? 'fa-solid fa-eye'
      : 'fa-solid fa-eye';
  }

  function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    updateThemeIcon();
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
  });

  // Gọi ngay khi trang được tải
  applySavedTheme();
const character = document.getElementById('character');
const instruction = document.getElementById('instruction');
const textContainer = document.getElementById('text-container');
const frameSize = 62;
let pos = {
  x: window.innerWidth * 0.04,
  y: textContainer.getBoundingClientRect().bottom + 20
};

let direction = '';
let moveFrame = 0;
let idleFrame = 0;
let state = 'idle';
let spacePressed = false;
let lastDirection = '';
const keysHeld = new Set();
let instructionHidden = false;

const speedPerFrame = { walk: 2, run: 4 };
const frameRates = { idle: 200, walk: 100, run: 80 };

const keyToVector = {
  'ArrowUp': { dx: 0, dy: -1, dir: 'U' },
  'ArrowDown': { dx: 0, dy: 1, dir: '' },
  'ArrowLeft': { dx: -1, dy: 0, dir: 'L' },
  'ArrowRight': { dx: 1, dy: 0, dir: 'R' }
};

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Đã sao chép: ${text}`);
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;
  const frameStr = (state === 'run') ? `${moveFrame % 8}` :
                   (state === 'idle' ? idleFrame : moveFrame % 16).toString().padStart(2, '0');
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

function preloadImages(callback) {
  const folders = { Idle: 16, Walk: 16, Run: 8 };
  const directions = ['', 'U', 'L', 'R'];
  let loaded = 0, total = 0;

  for (const folder in folders) {
    for (const dir of directions) {
      const count = folders[folder];
      for (let i = 0; i < count; i++) {
        const frameStr = folder === 'Run' ? `${i}` : i.toString().padStart(2, '0');
        const src = `assets/character/${folder}/${folder}${dir}${frameStr}.png`;
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => {
          loaded++;
          if (loaded === total) callback();
        };
        total++;
      }
    }
  }
}

let lastFrameTime = 0;
let animTimer = 0;

function gameLoop(timestamp) {
  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;
  animTimer += delta;

  let moved = false;
  let dx = 0, dy = 0;

  for (let key of keysHeld) {
    if (keyToVector[key]) {
      const vec = keyToVector[key];
      dx = vec.dx;
      dy = vec.dy;
      direction = vec.dir;
      lastDirection = direction;
      moved = true;
      break;
    }
  }

  if (moved) {
    if (!instructionHidden) {
      instruction.classList.add('hidden');
      instructionHidden = true;
    }

    state = spacePressed ? 'run' : 'walk';
    const speed = speedPerFrame[state];
    pos.x += dx * speed;
    pos.y += dy * speed;
    character.style.left = pos.x + 'px';
    character.style.top = pos.y + 'px';

    if (animTimer >= frameRates[state]) {
      moveFrame++;
      updateSprite();
      animTimer = 0;
    }
  } else {
    state = 'idle';
    direction = lastDirection;
    if (animTimer >= frameRates.idle) {
      idleFrame = (idleFrame + 1) % 16;
      updateSprite();
      animTimer = 0;
    }
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') spacePressed = true;
  if (keyToVector[e.key]) {
    keysHeld.add(e.key);
    e.preventDefault();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'Space') spacePressed = false;
  if (keyToVector[e.key]) {
    keysHeld.delete(e.key);
    e.preventDefault();
  }
});

character.style.left = pos.x + 'px';
character.style.top = pos.y + 'px';

preloadImages(() => {
  updateSprite();
  requestAnimationFrame(gameLoop);
});
