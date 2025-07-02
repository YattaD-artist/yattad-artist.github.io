let state = "idle";
let direction = "";
let isMoving = false;

let idleFrame = 0;
let moveFrame = 0;

const frameSize = 62;
const boundaryMargin = 24;
const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1],
  "U": [0, -1],
  "L": [-1, 0],
  "R": [1, 0]
};

const character = document.getElementById("character");
const textContainer = document.getElementById("intro-block");
const title = document.getElementById("title");

let posX = character.offsetLeft;
let posY = character.offsetTop;

character.style.left = `${posX}px`;
character.style.top = `${posY}px`;
character.style.position = "absolute";

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
        const frameStr = folder === "Run" ? `${i}` : i.toString().padStart(2, "0");
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = () => { if (++loaded >= total) callback(); };
        img.onerror = () => { if (++loaded >= total) callback(); };
      }
    }
  }
}

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;
  let frameIndex = state === "run" ? moveFrame % 8 : (state === "idle" ? idleFrame : moveFrame % 16);
  let frameStr = state === "run" ? `${frameIndex}` : frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

function checkCollision(dx, dy) {
  const nextX = posX + dx;
  const nextY = posY + dy;
  const charRect = {
    left: nextX,
    top: nextY,
    right: nextX + frameSize,
    bottom: nextY + frameSize
  };

  const screen = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  if (
    charRect.left < boundaryMargin ||
    charRect.right > screen.width - boundaryMargin ||
    charRect.top < boundaryMargin ||
    charRect.bottom > screen.height - boundaryMargin
  ) return true;

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

    if (current === 1) title.classList.add("moving-center"); // chỉ khi bắt đầu di chuyển thật
    current++;
    setTimeout(step, speed);
  }

  step();
}

function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;
  direction = ["U", "L"][Math.floor(Math.random() * 2)];
  moveFrame = 0;
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

// Idle loop
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Bắt đầu
updateSprite();
preloadImages(() => {
  setTimeout(() => {
    startMove(1, "walk");
  }, 3000); // idle chờ 3s
});
