const character = document.getElementById("character");
const textContainer = document.getElementById("text-container");

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;

let state = "idle";         // idle, walk
let direction = "";         // "", U, L, R
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

// Đặt vị trí ban đầu cho nhân vật
character.style.left = `${posX}px`;
character.style.top = `${posY}px`;

// Hàm cập nhật hình ảnh Sprite dựa trên trạng thái hiện tại
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Idle hoặc Walk
  const dirSuffix = direction; // "", U, L, R
  const baseName = folder + dirSuffix;
  const totalFrames = 16; // Idle và Walk đều có 16 frame
  const frameIndex = state === "idle" ? idleFrame : moveFrame % totalFrames;
  const frameStr = frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

// Kiểm tra va chạm với lề màn hình và vùng văn bản
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

// Di chuyển mượt từng bước theo hướng chỉ định
function smoothMove(dx, dy, onFinish) {
  const totalFrames = 16;
  const speed = 70;
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

// Bắt đầu di chuyển theo số bước chỉ định
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
    smoothMove(dx, dy, nextStep);
    stepCount++;
  }

  nextStep();
}

// Lập lịch hành động tiếp theo: idle hoặc walk
function scheduleNextAction() {
  const delay = 1000 + Math.random() * 2500;
  const chance = Math.random();

  if (chance < 0.3) {
    // Cho nhân vật "đứng suy nghĩ" trong một khoảng thời gian
    state = "idle";
    idleFrame = 0;
    updateSprite();

    setTimeout(() => {
      scheduleNextAction();
    }, delay);
  } else {
    // Di chuyển ngẫu nhiên từ 1 đến 3 bước
    setTimeout(() => {
      const steps = 1 + Math.floor(Math.random() * 3);
      startMove(steps);
    }, delay);
  }
}

// Vòng lặp lặp lại khi idle để nhân vật không bị "đơ"
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Khởi động
updateSprite();
scheduleNextAction();
