// ======== Hiệu ứng nền hình vuông bay =========
const pattern = document.getElementById('floating-pattern');
for (let i = 0; i < 25; i++) {
  const sq = document.createElement('div');
  sq.className = 'square';
  sq.style.left = `${Math.random() * 100}vw`;
  sq.style.top = `${Math.random() * 100}vh`;
  const size = 20 + Math.random() * 40;
  sq.style.width = `${size}px`;
  sq.style.height = `${size}px`;
  sq.style.animationDuration = `${4 + Math.random() * 6}s`;
  pattern.appendChild(sq);
}

// ======== Theme Toggle & Persistence =========
const themeToggle = document.querySelector('.theme-toggle');
const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
  document.body.classList.add('light-mode');
}
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

// ======== Điều khiển nhân vật pixel =========
let state = "idle";
let direction = "";
let isMoving = false;
let idleFrame = 0;
let moveFrame = 0;

const frameSize = 62;
const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1],
  "U": [0, -1],
  "L": [-1, 0],
  "R": [1, 0]
};

const character = document.getElementById("character");
const textContainer = document.getElementById("text-container");

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;
character.style.left = `${posX}px`;
character.style.top = `${posY}px`;
character.style.width = `${frameSize}px`;
character.style.height = `${frameSize}px`;

function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 };
  let loaded = 0, total = 0;

  for (const folder of folders) {
    for (const dir of directions) {
      const prefix = folder + dir;
      const count = counts[folder];
      total += count;
      for (let i = 0; i < count; i++) {
        const frameStr = folder === "Run" ? `${i}` : i.toString().padStart(2, "0");
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = img.onerror = () => {
          if (++loaded === total) callback();
        };
      }
    }
  }
}

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;
  const frameIndex = state === "run" ? moveFrame % 8 : (state === "idle" ? idleFrame : moveFrame % 16);
  const frameStr = state === "run" ? `${frameIndex}` : frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

function checkCollision(dx, dy) {
  const nextX = posX + dx;
  const nextY = posY + dy;
  const charRect = { left: nextX, top: nextY, right: nextX + frameSize, bottom: nextY + frameSize };
  const bounds = { width: window.innerWidth, height: window.innerHeight };
  if (charRect.left < 0 || charRect.right > bounds.width || charRect.top < 0 || charRect.bottom > bounds.height) return true;
  const textRect = textContainer.getBoundingClientRect();
  return !(
    charRect.right < textRect.left ||
    charRect.left > textRect.right ||
    charRect.bottom < textRect.top ||
    charRect.top > textRect.bottom
  );
}

function smoothMove(dx, dy, onFinish, mode) {
  const totalFrames = mode === "run" ? 8 : 16;
  const speed = mode === "run" ? 35 : 70;
  let current = 0;
  const stepX = dx / totalFrames;
  const stepY = dy / totalFrames;

  function step() {
    if (current >= totalFrames) { onFinish(); return; }
    posX += stepX;
    posY += stepY;
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;
    moveFrame = current;
    updateSprite();
    current++;
    setTimeout(step, speed);
  }

  step();
}

function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;
  direction = directions[Math.floor(Math.random() * directions.length)];
  moveFrame = 1;
  updateSprite();

  const [vx, vy] = dirVectors[direction];
  let stepCount = 0;

  function nextStep() {
    if (stepCount >= steps) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
      return;
    }

    const dx = vx * frameSize;
    const dy = vy * frameSize;
    if (checkCollision(dx, dy)) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
      return;
    }

    moveFrame = 0;
    smoothMove(dx, dy, nextStep, mode);
    stepCount++;
  }

  nextStep();
}

function scheduleNextAction() {
  const delay = 1000 + Math.random() * 2500;
  setTimeout(() => {
    const chance = Math.random();
    const steps = 1 + Math.floor(Math.random() * 3);
    if (chance < 0.2) {
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
    } else if (chance < 0.65) {
      startMove(steps, "walk");
    } else {
      startMove(steps, "run");
    }
  }, delay);
}

// Idle animation loop
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Initial boot
updateSprite();
preloadImages(() => {
  scheduleNextAction();
});
