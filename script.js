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
const menu = document.querySelector(".menu-vertical");
const logoText = document.getElementById("logo-text");
const logoRow = document.getElementById("logo-row");

let posX = 0;
let posY = 0;

function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 };
  let loaded = 0, total = 0;

  folders.forEach(folder => {
    directions.forEach(dir => {
      const prefix = folder + dir;
      total += counts[folder];
      for (let i = 0; i < counts[folder]; i++) {
        const frameStr = folder === "Run" ? `${i}` : i.toString().padStart(2, "0");
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = img.onerror = () => {
          loaded++;
          if (loaded === total) callback();
        };
      }
    });
  });
}

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const base = folder + direction;
  const idx = state === "run"
    ? moveFrame % 8
    : state === "idle"
      ? idleFrame
      : moveFrame % 16;
  const frame = state === "run"
    ? `${idx}`
    : idx.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${base}${frame}.png`;
}

function rectsOverlap(r1, r2) {
  return !(r1.right < r2.left ||
           r1.left > r2.right ||
           r1.bottom < r2.top ||
           r1.top > r2.bottom);
}

function checkCollision(dx, dy) {
  const next = {
    left: posX + dx,
    top: posY + dy,
    right: posX + dx + frameSize,
    bottom: posY + dy + frameSize
  };

  const bounds = { width: window.innerWidth, height: window.innerHeight };
  if (next.left < 0 || next.top < 0 ||
      next.right > bounds.width || next.bottom > bounds.height) {
    return true;
  }

  const menuRect = menu.getBoundingClientRect();
  if (rectsOverlap(next, menuRect)) return true;

  return false;
}

function smoothMove(dx, dy, onFinish, mode) {
  const frames = mode === "run" ? 8 : 16;
  const speed = mode === "run" ? 35 : 70;
  let i = 0;
  const stepX = dx / frames;
  const stepY = dy / frames;

  function step() {
    if (i >= frames) return onFinish();
    posX += stepX;
    posY += stepY;
    character.style.transform = `translate(${posX}px, ${posY}px)`;
    moveFrame = i;
    updateSprite();
    i++;
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
  let count = 0;

  function next() {
    if (count >= steps) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      return realignLogo();
    }
    const dx = vx * frameSize;
    const dy = vy * frameSize;
    if (checkCollision(dx, dy)) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      return realignLogo();
    }
    smoothMove(dx, dy, next, mode);
    count++;
  }
  next();
}

function scheduleNextAction() {
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
  }, 1000 + Math.random() * 2500);
}

// Cân chỉnh lại logo sau khi nhân vật rời đi
function realignLogo() {
  logoRow.style.justifyContent = "center";
  logoRow.style.gap = "0px";
  logoText.style.transition = "transform 0.8s ease";
  character.style.opacity = "0";
  setTimeout(() => {
    scheduleNextAction();
  }, 1500);
}

// Idle animation
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Vị trí khởi đầu
window.onload = () => {
  const logoRect = logoRow.getBoundingClientRect();
  posX = 0;
  posY = 0;
  character.style.transform = `translate(${posX}px, ${posY}px)`;
  character.style.opacity = "1";
  updateSprite();
  preloadImages(scheduleNextAction);
};
