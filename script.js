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

// Cập nhật hình ảnh sprite theo trạng thái và hướng
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Idle, Walk, Run
  const dirSuffix = direction; // "", U, L, R
  const baseName = folder + dirSuffix; // Idle, WalkU, RunL, v.v.
  const totalFrames = state === "run" ? 8 : 16;
  const frameIndex = state === "idle" ? idleFrame : moveFrame % totalFrames;
  const frameStr = frameIndex.toString();
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

// Kiểm tra va chạm nhân vật với biên hoặc phần tử văn bản
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

// Hoạt họa khi đang di chuyển (walk/run)
function startAnimationLoop() {
  function loop() {
    if (!isMoving) return;
    moveFrame++;
    updateSprite();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

// Di chuyển mượt theo từng bước, với tốc độ tùy theo trạng thái
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

    current++;
    setTimeout(step, speed);
  }

  step();
}

// Bắt đầu di chuyển trong vài bước, với hành vi cụ thể (walk hoặc run)
function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;
  moveFrame = 0;
  startAnimationLoop();

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

// Hẹn giờ tự động chuyển hành động
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

// Vòng lặp cho trạng thái đứng yên
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

updateSprite();
scheduleNextAction();
