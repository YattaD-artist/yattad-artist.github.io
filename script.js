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

let posX = 0;
let posY = 0;

function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 };
  let loaded = 0;
  let total = 0;

  for (const folder of folders) {
    for (const dir of directions) {
      const suffix = dir;
      const prefix = folder + suffix;
      const count = counts[folder];
      total += count;
      for (let i = 0; i < count; i++) {
        const frameStr = folder === "Run" ? `${i}` : `${i.toString().padStart(2, "0")}`;
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = () => {
          loaded++;
          if (loaded >= total) callback();
        };
        img.onerror = () => {
          console.warn("Failed to load: ", img.src);
          loaded++;
          if (loaded >= total) callback();
        };
      }
    }
  }
}

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;

  let frameIndex, frameStr;

  if (state === "run") {
    frameIndex = moveFrame % 8;
    frameStr = `${frameIndex}`;
  } else {
    frameIndex = (state === "idle" ? idleFrame : moveFrame % 16);
    frameStr = frameIndex.toString().padStart(2, "0");
  }

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

setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Khi toàn bộ trang tải xong
window.onload = () => {
  const heading = document.querySelector('h1');
  const headingRect = heading.getBoundingClientRect();
  const headingComputedStyle = window.getComputedStyle(heading);
  const headingWidth = parseFloat(headingComputedStyle.width);

  const headingCenterX = headingRect.left + headingRect.width / 2;
  const headingLeft = headingCenterX - headingWidth / 2;

  posX = headingLeft - 96;
  posY = headingRect.top;

  character.style.left = `${posX}px`;
  character.style.top = `${posY}px`;
  character.style.width = `${frameSize}px`;
  character.style.height = `${frameSize}px`;
  character.style.visibility = "visible";

  updateSprite();
  preloadImages(() => {
    scheduleNextAction();
  });
};
