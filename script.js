// Lấy tham chiếu đến phần tử nhân vật và vùng chứa văn bản
const character = document.getElementById("character");
const textContainer = document.getElementById("text-container");

// Tọa độ hiện tại của nhân vật
let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;

// Trạng thái và hướng của nhân vật
let state = "idle";         // Các trạng thái: idle, walk, run
let direction = "";         // Các hướng: "" (xuống), U, L, R
let isMoving = false;

// Frame cho từng loại animation
let idleFrame = 0;
let moveFrame = 0;

// Các hướng có thể và vector tương ứng
const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1],
  "U": [0, -1],
  "L": [-1, 0],
  "R": [1, 0]
};

// Cập nhật vị trí hiển thị nhân vật
character.style.left = `${posX}px`;
character.style.top = `${posY}px`;

// Hàm cập nhật hình ảnh nhân vật dựa vào trạng thái và hướng
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Idle, Walk, Run
  const dirSuffix = direction;
  const baseName = folder + dirSuffix;
  const totalFrames = state === "run" ? 8 : 16;
  const frameIndex = state === "idle" ? idleFrame : moveFrame % totalFrames;
  const frameStr = frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

// Kiểm tra va chạm nhân vật với biên và vùng chứa văn bản
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

// Di chuyển mượt với animation hoàn chỉnh cho mỗi bước
function smoothMove(dx, dy, onFinish, mode) {
  const totalFrames = mode === "run" ? 8 : 16;
  const speed = mode === "run" ? 35 : 70; // Run nhanh gấp đôi walk
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

// Bắt đầu di chuyển trong trạng thái chỉ định (walk/run)
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

// Lập lịch hành động tiếp theo ngẫu nhiên
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
    } else if (chance < 0.7) {
      startMove(steps, "walk");
    } else {
      startMove(steps, "run");
    }
  }, delay);
}

// Animation vòng lặp cho trạng thái Idle
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Khởi động lần đầu
updateSprite();
scheduleNextAction();
