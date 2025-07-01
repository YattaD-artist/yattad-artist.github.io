// script.js

const character = document.getElementById("character");
const textContainer = document.getElementById("text-container");

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;

let state = "idle";         // Các trạng thái: idle, walk
let direction = "";         // Hướng di chuyển: "", U, L, R
let isMoving = false;

let idleFrame = 0;
let moveFrame = 0;

const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1],    // Xuống
  "U": [0, -1],  // Lên
  "L": [-1, 0],  // Trái
  "R": [1, 0]    // Phải
};

character.style.left = `${posX}px`;
character.style.top = `${posY}px`;

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Idle, Walk
  const dirSuffix = direction; // "", U, L, R
  const baseName = folder + dirSuffix;
  const totalFrames = 16;
  const frameIndex = state === "idle" ? idleFrame : moveFrame % totalFrames;
  const frameStr = frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
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

function smoothMove(dx, dy, onFinish) {
  const totalFrames = 16;
  const speed = 70;
  let current = 0;
  const stepX = dx / totalFrames;
  const stepY = dy / totalFrames;

  function step() {
    if (current >= totalFrames) {
      onFinish(); // Chỉ gọi khi đã hoàn tất 1 vòng animation
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

function startMove(steps) {
  if (isMoving) return;
  isMoving = true;
  state = "walk";
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
    smoothMove(dx, dy, () => {
      stepCount++;
      nextStep();
    });
  }

  nextStep();
}

function scheduleNextAction() {
  const delay = 1000 + Math.random() * 2500;
  setTimeout(() => {
    const chance = Math.random();
    const steps = 1 + Math.floor(Math.random() * 3);
    if (chance < 0.3) {
      state = "idle";
      idleFrame = 0;
      updateSprite();

      // Chờ kết thúc 1 vòng idle animation (16 frame * 200ms)
      setTimeout(() => {
        scheduleNextAction();
      }, 3200);
    } else {
      startMove(steps);
    }
  }, delay);
}

// Idle loop animation
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

updateSprite();
scheduleNextAction();
