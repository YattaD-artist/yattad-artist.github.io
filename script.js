// === Trạng thái và dữ liệu cơ bản ===
let state = "idle";
let direction = "";
let isMoving = false;
let idleFrame = 0;
let moveFrame = 0;

const frameSize = 62;
const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1], "U": [0, -1], "L": [-1, 0], "R": [1, 0]
};

const character = document.getElementById("character");
const container = document.querySelector(".centered");
const title = document.querySelector(".title-row h1");

let posX = 0;
let posY = 0;

// === Đặt nhân vật ở bên trái chữ YattaD khi vừa load ===
function placeInitialBlock() {
  const titleRect = title.getBoundingClientRect();
  posX = titleRect.left - frameSize - 8;
  posY = titleRect.top;
  character.style.left = `${posX}px`;
  character.style.top = `${posY}px`;
  character.style.width = `${frameSize}px`;
  character.style.height = `${frameSize}px`;
}
placeInitialBlock();

// === Preload tất cả sprite trước khi chạy ===
function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { Idle: 16, Walk: 16, Run: 8 };
  let loaded = 0, total = 0;

  folders.forEach(folder => {
    directions.forEach(dir => {
      const prefix = folder + dir;
      total += counts[folder];
      for (let i = 0; i < counts[folder]; i++) {
        const frameStr = folder === "Run" ? `${i}` : `${i.toString().padStart(2, '0')}`;
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = img.onerror = () => { if (++loaded >= total) callback(); };
      }
    });
  });
}

// === Cập nhật hình ảnh nhân vật theo trạng thái ===
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;
  let index = (state === "run") ? moveFrame % 8 : (state === "idle" ? idleFrame : moveFrame % 16);
  const frameStr = (state === "run") ? `${index}` : index.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

// === Kiểm tra va chạm với viền màn hình hoặc phần chữ ===
function checkCollision(dx, dy) {
  const nextX = posX + dx, nextY = posY + dy;
  const charRect = { left: nextX, top: nextY, right: nextX + frameSize, bottom: nextY + frameSize };
  if (charRect.left < 0 || charRect.right > innerWidth || charRect.top < 0 || charRect.bottom > innerHeight) return true;
  const textRect = container.getBoundingClientRect();
  return !(charRect.right < textRect.left || charRect.left > textRect.right || charRect.bottom < textRect.top || charRect.top > textRect.bottom);
}

// === Di chuyển mượt theo từng frame ===
function smoothMove(dx, dy, onFinish, mode) {
  const total = mode === "run" ? 8 : 16;
  const speed = mode === "run" ? 35 : 70;
  let cur = 0;
  const stepX = dx / total, stepY = dy / total;
  function step() {
    if (cur >= total) return onFinish();
    posX += stepX; posY += stepY;
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;
    moveFrame = cur; updateSprite(); cur++;
    setTimeout(step, speed);
  }
  step();
}

// === Khi nhân vật bắt đầu rời đi, chữ "YattaD" sẽ trượt về giữa ===
function centerTitleAfterMove() {
  title.classList.add("moving-center");
}

// === Logic điều khiển bước đi của nhân vật ===
function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;
  direction = directions[Math.floor(Math.random() * 4)];
  moveFrame = 1;
  updateSprite();
  centerTitleAfterMove();

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
    const dx = vx * frameSize, dy = vy * frameSize;
    if (checkCollision(dx, dy)) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      scheduleNextAction();
      return;
    }
    moveFrame = 0;
    smoothMove(dx, dy, next, mode);
    stepCount++;
  }

  next();
}

// === Lên lịch hành động tiếp theo (ngẫu nhiên) ===
function scheduleNextAction() {
  setTimeout(() => {
    const chance = Math.random(), steps = 1 + Math.floor(Math.random() * 3);
    if (chance < 0.2) {
      state = "idle"; idleFrame = 0; updateSprite(); scheduleNextAction();
    } else if (chance < 0.65) startMove(steps, "walk");
    else startMove(steps, "run");
  }, 1000 + Math.random() * 2500);
}

// === Cập nhật frame idle liên tục mỗi 200ms ===
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// === Khởi động sau preload + delay 5s ===
updateSprite();
preloadImages(() => setTimeout(scheduleNextAction, 5000));

// === Bật âm thanh click menu ===
document.addEventListener("click", () => {
  const dummy = new Audio("assets/sfx/Click.mp3");
  dummy.volume = 0; dummy.play().catch(() => {});
}, { once: true });

const clickSound = new Audio("assets/sfx/Click.mp3");
clickSound.volume = 0.3;

document.querySelectorAll('.menu a').forEach(link => {
  link.addEventListener('click', () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(err => {
      console.warn("Âm thanh không phát được:", err);
    });
  });
});
