// Trạng thái nhân vật: idle, walk, run
let state = "idle";
let direction = ""; // "", U, L, R
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
const container = document.querySelector('.centered');
const title = document.querySelector('.title-row h1');

let posX = 0;
let posY = 0;

// Đặt ban đầu character và title-group nằm chính giữa
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

// Preload toàn bộ sprite rồi mới chạy NPC
function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 };
  let loaded = 0, total = 0;
  folders.forEach(folder => {
    directions.forEach(dir => {
      const prefix = folder + dir;
      total += counts[folder];
      for (let i = 0; i < counts[folder]; i++) {
        const frameStr = folder === "Run"
          ? `${i}`
          : `${i.toString().padStart(2, '0')}`;
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = img.onerror = () => {
          if (++loaded >= total) callback();
        };
      }
    });
  });
}

// Cập nhật sprite theo trạng thái/hướng/frame
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;
  let frameIndex, frameStr;
  if (state === "run") {
    frameIndex = moveFrame % 8;
    frameStr = `${frameIndex}`;
  } else {
    frameIndex = state === "idle" ? idleFrame : moveFrame % 16;
    frameStr = frameIndex.toString().padStart(2, "0");
  }
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

// Kiểm tra va chạm
function checkCollision(dx, dy) {
  const nextX = posX + dx, nextY = posY + dy;
  const charRect = { left: nextX, top: nextY, right: nextX + frameSize, bottom: nextY + frameSize };
  if (charRect.left < 0 || charRect.right > innerWidth ||
      charRect.top < 0 || charRect.bottom > innerHeight) return true;
  const textRect = container.getBoundingClientRect();
  return !(charRect.right < textRect.left ||
           charRect.left > textRect.right ||
           charRect.bottom < textRect.top ||
           charRect.top > textRect.bottom);
}

// Di chuyển mượt
function smoothMove(dx, dy, onFinish, mode) {
  const total = mode === "run" ? 8 : 16;
  const speed = mode === "run" ? 35 : 70;
  let cur = 0;
  const stepX = dx / total, stepY = dy / total;
  function step() {
    if (cur >= total) { onFinish(); return; }
    posX += stepX; posY += stepY;
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;
    moveFrame = cur; updateSprite();
    cur++;
    setTimeout(step, speed);
  }
  step();
}

// Đưa title về giữa sau khi NPC bắt đầu đi
function centerTitleAfterMove() {
  title.classList.add("moving-center");
}

// Bắt đầu di chuyển NPC
function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;
  direction = directions[Math.floor(Math.random()*4)];
  moveFrame = 1; updateSprite();
  centerTitleAfterMove();
  const [vx, vy] = dirVectors[direction];
  let count = 0;
  function next() {
    if (count >= steps) {
      isMoving = false; state="idle"; idleFrame=0; updateSprite(); scheduleNextAction();
      return;
    }
    const dx = vx*frameSize, dy = vy*frameSize;
    if (checkCollision(dx, dy)) {
      isMoving=false; state="idle"; idleFrame=0; updateSprite(); scheduleNextAction();
      return;
    }
    moveFrame=0; smoothMove(dx,dy,next,mode);
    count++;
  }
  next();
}

// Lên lịch hành động kế tiếp
function scheduleNextAction() {
  setTimeout(() => {
    const r = Math.random(), steps = 1 + Math.floor(Math.random()*3);
    if (r<0.2) { state="idle"; idleFrame=0; updateSprite(); scheduleNextAction(); }
    else if (r<0.65) startMove(steps,"walk"); else startMove(steps,"run");
  }, 1000+Math.random()*2500);
}

// Loop idle animation
setInterval(() => {
  if (state==="idle") {
    idleFrame = (idleFrame+1)%16;
    updateSprite();
  }
}, 200);

// Khởi chạy sau preload (5s initial)
updateSprite();
preloadImages(() => setTimeout(scheduleNextAction, 5000));
