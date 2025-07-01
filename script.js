// script.js - NPC di chuyển ngẫu nhiên với hoạt ảnh mượt và khớp hướng

// Trạng thái và thông tin nhân vật
let state = "idle";
let direction = ""; // "", U, L, R
let isMoving = false;

let idleFrame = 0;
let moveFrame = 0;

const FRAME_SIZE = 62;
const character = document.getElementById("character");
const textContainer = document.getElementById("text-container");

const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1],
  "U": [0, -1],
  "L": [-1, 0],
  "R": [1, 0]
};

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;
character.style.left = `${posX}px`;
character.style.top = `${posY}px`;
character.style.width = `${FRAME_SIZE}px`;
character.style.height = `${FRAME_SIZE}px`;

// Cập nhật hình ảnh theo trạng thái và hướng
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Idle, Walk, Run
  const base = folder + direction;
  const frame = state === "run" ? moveFrame % 8 : (state === "idle" ? idleFrame : moveFrame % 16);
  const frameStr = state === "run" ? frame.toString() : frame.toString().padStart(2, "0");
  const path = `assets/character/${folder}/${base}${frameStr}.png`;
  character.src = path;
}

// Kiểm tra va chạm với viền hoặc phần chữ
function checkCollision(dx, dy) {
  const nextX = posX + dx;
  const nextY = posY + dy;
  const rect = { left: nextX, top: nextY, right: nextX + FRAME_SIZE, bottom: nextY + FRAME_SIZE };
  const bounds = { width: window.innerWidth, height: window.innerHeight };

  if (rect.left < 0 || rect.right > bounds.width || rect.top < 0 || rect.bottom > bounds.height) return true;
  const textRect = textContainer.getBoundingClientRect();
  return !(
    rect.right < textRect.left || rect.left > textRect.right ||
    rect.bottom < textRect.top || rect.top > textRect.bottom
  );
}

// Di chuyển mượt từng bước
function smoothMove(dx, dy, onFinish, mode) {
  const total = mode === "run" ? 8 : 16;
  const speed = mode === "run" ? 35 : 70;
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

// Bắt đầu đi hoặc chạy một số bước
function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;
  moveFrame = 0;

  direction = directions[Math.floor(Math.random() * directions.length)];
  updateSprite(); // đảm bảo đổi sprite đúng trước khi di chuyển

  const [vx, vy] = dirVectors[direction];
  let stepCount = 0;

  function next() {
    if (stepCount >= steps) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
      return;
    }

    const dx = vx * FRAME_SIZE;
    const dy = vy * FRAME_SIZE;

    if (checkCollision(dx, dy)) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
      return;
    }

    smoothMove(dx, dy, next, mode);
    stepCount++;
  }

  next();
}

// Hẹn giờ hành động kế tiếp
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

// Vòng lặp đứng yên
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

updateSprite();
setTimeout(scheduleNextAction, 3000);
