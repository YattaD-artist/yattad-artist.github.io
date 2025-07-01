const character = document.getElementById("character");
const textContainer = document.getElementById("text-container");

// Vị trí khởi đầu của nhân vật
let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;

let state = "idle";         // Trạng thái: idle hoặc walk
let direction = "";         // "", U, L, R
let isMoving = false;

let idleFrame = 0;
let moveFrame = 0;

const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1],   // xuống
  "U": [0, -1], // lên
  "L": [-1, 0], // trái
  "R": [1, 0]   // phải
};

// Cập nhật vị trí ban đầu của nhân vật
character.style.left = `${posX}px`;
character.style.top = `${posY}px`;

// Hàm cập nhật sprite tương ứng với hành động & hướng
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Idle, Walk
  const dirSuffix = direction; // "", U, L, R
  const baseName = folder + dirSuffix;
  const totalFrames = 16;
  const frameIndex = state === "idle" ? idleFrame : moveFrame % totalFrames;
  const frameStr = frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

// Kiểm tra va chạm (biên hoặc text container)
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

  // Va chạm với màn hình
  if (
    charRect.left < 0 || charRect.right > bounds.width ||
    charRect.top < 0 || charRect.bottom > bounds.height
  ) return true;

  // Va chạm với vùng nội dung
  const textRect = textContainer.getBoundingClientRect();
  return !(
    charRect.right < textRect.left ||
    charRect.left > textRect.right ||
    charRect.bottom < textRect.top ||
    charRect.top > textRect.bottom
  );
}

// Di chuyển mượt từng bước một
function smoothMove(dx, dy, onFinish) {
  const totalFrames = 16;
  const speed = 70;
  let currentFrame = 0;

  const stepX = dx / totalFrames;
  const stepY = dy / totalFrames;

  function step() {
    if (currentFrame >= totalFrames) {
      onFinish(); // Kết thúc di chuyển
      return;
    }

    // Di chuyển vị trí
    posX += stepX;
    posY += stepY;
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;

    // Cập nhật frame hoạt hình
    moveFrame = currentFrame;
    updateSprite();

    currentFrame++;
    setTimeout(step, speed);
  }

  step();
}

function startMove(steps) {
  if (isMoving) return;

  isMoving = true;
  state = "walk";
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

    // Kiểm tra va chạm trước khi bước
    if (checkCollision(dx, dy)) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
      return;
    }

    smoothMove(dx, dy, () => {
      stepCount++;
      nextStep(); // bước tiếp theo
    });
  }

  nextStep();
}


// Lập lịch hành động tiếp theo: Idle hoặc Walk
function scheduleNextAction() {
  const delay = 1000 + Math.random() * 2500;
  setTimeout(() => {
    const chance = Math.random();
    const steps = 1 + Math.floor(Math.random() * 3);
    if (chance < 0.3) {
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
    } else {
      startMove(steps);
    }
  }, delay);
}

// Lặp khung idle mỗi 200ms
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// Khởi động
updateSprite();
scheduleNextAction();
