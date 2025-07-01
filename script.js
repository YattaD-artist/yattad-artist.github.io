// Trạng thái nhân vật: idle, walk, run
let state = "idle";
let direction = ""; // "", U, L, R
let isMoving = false;

let idleFrame = 0;
let moveFrame = 0;

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

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Idle, Walk, Run
  const baseName = folder + direction; // Idle, WalkU, RunL, v.v.

  let totalFrames, frameIndex, frameStr;

  if (state === "run") {
    totalFrames = 8;
    frameIndex = moveFrame % totalFrames;
    frameStr = frameIndex.toString(); // Run0.png → Run7.png
  } else {
    totalFrames = 16;
    frameIndex = (state === "idle" ? idleFrame : moveFrame % totalFrames);
    frameStr = frameIndex.toString().padStart(2, "0"); // 00 → 15
  }

  const spritePath = `assets/character/${folder}/${baseName}${frameStr}.png`;
  console.log("Sprite path:", spritePath);
  character.src = spritePath;
  character.onerror = () => console.error("Không tìm thấy sprite:", spritePath);
}

function checkCollision(dx, dy) {
  const nextX = posX + dx;
  const nextY = posY + dy;

  const charRect = {
    left: nextX,
    top: nextY,
    right: nextX + 48,
    bottom: nextY + 48
  };

  const bounds = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  if (
    charRect.left < 0 || charRect.right > bounds.width ||
    charRect.top < 0 || charRect.bottom > bounds.height
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
    if (current >= totalFrames) {
      onFinish();
      return;
    }

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
  moveFrame = 0;

  direction = directions[Math.floor(Math.random() * directions.length)];
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

    const dx = vx * 48;
    const dy = vy * 48;

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
    direction = directions[Math.floor(Math.random() * directions.length)];
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

updateSprite();

// Đợi 3 giây trước khi bắt đầu hành động để đảm bảo mọi tài nguyên được tải
setTimeout(() => {
  scheduleNextAction();
}, 3000);
