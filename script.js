let state = "idle";
let direction = "";
let isMoving = false;
let hasMoved = false;

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
const heading = document.getElementById("title-heading");
const textContainer = document.getElementById("text-container");

let posX = 0;
let posY = 0;
character.style.visibility = "hidden";
character.style.position = "absolute";
character.style.width = `${frameSize}px`;
character.style.height = `${frameSize}px`;

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
      next.right > bounds.width || next.bottom > bounds.height) return true;

  const menuRect = menu.getBoundingClientRect();
  if (rectsOverlap(next, menuRect)) return true;

  const titleRect = heading.getBoundingClientRect();
  if (rectsOverlap(next, titleRect)) return true;

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
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;
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

  if (!hasMoved) {
    hasMoved = true;
    centerTitle(); // Trigger slide-in effect
  }

  function next() {
    if (count >= steps) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      return scheduleNextAction();
    }

    const dx = vx * frameSize;
    const dy = vy * frameSize;

    if (checkCollision(dx, dy)) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      return scheduleNextAction();
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

// Chuyển tiêu đề về giữa sau khi nhân vật di chuyển
function centerTitle() {
  heading.style.transform = `translateX(${window.innerWidth / 2 - heading.getBoundingClientRect().left - heading.offsetWidth / 2}px)`;
}

setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

window.onload = () => {
  const hr = heading.getBoundingClientRect();
  posX = hr.left - 96;
  posY = hr.bottom + 8;

  character.style.left = `${posX}px`;
  character.style.top = `${posY}px`;
  character.style.visibility = "visible";

  updateSprite();
  preloadImages(scheduleNextAction);
};
