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
const siteTitle = document.getElementById("site-title");
const textContainer = document.getElementById("text-container");

let posX, posY;
let initialX, initialY;

function centerCharacterNextToTitle() {
  const titleRect = siteTitle.getBoundingClientRect();
  const centerX = titleRect.left - frameSize - 16;
  const centerY = titleRect.top + titleRect.height / 2 - frameSize / 2;

  posX = centerX;
  posY = centerY;
  initialX = posX;
  initialY = posY;

  character.style.left = `${posX}px`;
  character.style.top = `${posY}px`;
  character.style.width = `${frameSize}px`;
  character.style.height = `${frameSize}px`;
}

function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 };
  let loaded = 0;
  let total = 0;

  for (const folder of folders) {
    for (const dir of directions) {
      const prefix = folder + dir;
      const count = counts[folder];
      total += count;
      for (let i = 0; i < count; i++) {
        const frameStr = folder === "Run" ? `${i}` : `${i.toString().padStart(2, "0")}`;
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = img.onerror = () => {
          loaded++;
          if (loaded === total) callback();
        };
      }
    }
  }
}

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const base = folder + direction;
  let frameIndex = (state === "run") ? moveFrame % 8 : (state === "idle" ? idleFrame : moveFrame % 16);
  const frameStr = (state === "run") ? `${frameIndex}` : frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${base}${frameStr}.png`;
}

function checkCollision(dx, dy) {
  const nextX = posX + dx;
  const nextY = posY + dy;
  const charBox = { left: nextX, top: nextY, right: nextX + frameSize, bottom: nextY + frameSize };
  const bounds = { width: window.innerWidth, height: window.innerHeight };

  // 24px padding boundary
  if (
    charBox.left < 24 || charBox.right > bounds.width - 24 ||
    charBox.top < 24 || charBox.bottom > bounds.height - 24
  ) return true;

  const textRect = textContainer.getBoundingClientRect();
  return !(
    charBox.right < textRect.left ||
    charBox.left > textRect.right ||
    charBox.bottom < textRect.top ||
    charBox.top > textRect.bottom
  );
}

function smoothMove(dx, dy, onFinish, mode) {
  const total = (mode === "run") ? 8 : 16;
  const speed = (mode === "run") ? 35 : 70;
  let current = 0;
  const stepX = dx / total;
  const stepY = dy / total;

  function step() {
    if (current >= total) return onFinish();
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

    if (!siteTitle.classList.contains("slide-to-center") && movedAwayFromStart()) {
      siteTitle.classList.add("slide-to-center");
    }

    moveFrame = 0;
    smoothMove(dx, dy, nextStep, mode);
    stepCount++;
  }

  nextStep();
}

function movedAwayFromStart() {
  const dx = Math.abs(posX - initialX);
  const dy = Math.abs(posY - initialY);
  return dx > 10 || dy > 10;
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

// Vòng lặp Idle
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Khởi động
preloadImages(() => {
  centerCharacterNextToTitle();
  updateSprite();
  setTimeout(scheduleNextAction, 3000);
});
