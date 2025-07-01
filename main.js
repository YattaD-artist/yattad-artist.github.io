// ====== Cấu hình Hằng số ======
const CHARACTER_SIZE = 48;
const FRAME_COUNT = 16;
const STEP_DURATION = 70; // ms cho Walk
const RUN_STEP_DURATION = 35; // ms cho Run
const SPRITE_FOLDER = 'assets/character';
const DIRECTIONS = ['', 'U', 'L', 'R'];

// ====== Biến trạng thái ======
let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;
let frame = 0;
let state = 'idle'; // idle, walk, run
let direction = '';
let isMoving = false;

// ====== Truy cập DOM ======
const character = document.getElementById('character');
const textContainer = document.getElementById('text-container');

if (!character || !textContainer) throw new Error('Thiếu phần tử DOM');

// ====== Hướng di chuyển ======
const dirVectors = {
  '': [0, 1],
  'U': [0, -1],
  'L': [-1, 0],
  'R': [1, 0],
};

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1); // Walk, Idle, Run
  const suffix = direction;
  const frameStr = frame.toString().padStart(2, '0');
  character.src = `${SPRITE_FOLDER}/${folder}/${folder}${suffix}${frameStr}.png`;
}

function checkCollision(dx, dy) {
  const futureX = posX + dx;
  const futureY = posY + dy;

  const charRect = {
    left: futureX,
    top: futureY,
    right: futureX + CHARACTER_SIZE,
    bottom: futureY + CHARACTER_SIZE,
  };

  const screen = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  if (
    charRect.left < 0 || charRect.right > screen.width ||
    charRect.top < 0 || charRect.bottom > screen.height
  ) return true;

  const textRect = textContainer.getBoundingClientRect();
  const overlap = !(
    charRect.right < textRect.left ||
    charRect.left > textRect.right ||
    charRect.bottom < textRect.top ||
    charRect.top > textRect.bottom
  );

  return overlap;
}

function smoothWalkStep(dx, dy, duration, onFinish) {
  const totalFrames = Math.ceil(duration / 16);
  let current = 0;
  const stepSizeX = dx / totalFrames;
  const stepSizeY = dy / totalFrames;

  function step() {
    if (current >= totalFrames) return onFinish();

    posX += stepSizeX;
    posY += stepSizeY;
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;

    frame = current % FRAME_COUNT;
    updateSprite();
    current++;
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function startMove(steps, moveType = 'walk') {
  if (isMoving) return;
  isMoving = true;

  const [vx, vy] = dirVectors[direction];
  let stepCount = 0;
  const duration = moveType === 'run' ? RUN_STEP_DURATION : STEP_DURATION;

  // Chuyển hướng trước 1 nhịp idle
  state = 'idle';
  frame = 0;
  updateSprite();

  setTimeout(() => {
    state = moveType;
    updateSprite();

    function next() {
      if (stepCount >= steps) {
        isMoving = false;
        state = 'idle';
        frame = 0;
        updateSprite();
        scheduleNextAction();
        return;
      }

      const dx = vx * CHARACTER_SIZE;
      const dy = vy * CHARACTER_SIZE;

      if (checkCollision(dx, dy)) {
        isMoving = false;
        state = 'idle';
        frame = 0;
        updateSprite();
        scheduleNextAction();
        return;
      }

      smoothWalkStep(dx, dy, duration, () => {
        stepCount++;
        next();
      });
    }

    next();
  }, 100);
}

function chooseAction() {
  const r = Math.random();

  // 60% đi bộ, 20% chạy, 20% đứng yên
  if (r < 0.6) {
    const steps = 1 + Math.floor(Math.random() * 3);
    startMove(steps, 'walk');
  } else if (r < 0.8) {
    const steps = 1 + Math.floor(Math.random() * 2);
    startMove(steps, 'run');
  } else {
    state = 'idle';
    frame = 0;
    updateSprite();
    scheduleNextAction();
  }
}

function scheduleNextAction() {
  const delay = (direction === 'U')
    ? 1000 + Math.random() * 800 // Giảm delay nếu nhìn lên
    : 1500 + Math.random() * 3000;

  setTimeout(() => {
    direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    chooseAction();
  }, delay);
}

// Cập nhật sprite idle từng frame
function idleAnimationLoop() {
  if (state === 'idle') {
    frame = (frame + 1) % FRAME_COUNT;
    updateSprite();
  }
  requestAnimationFrame(idleAnimationLoop);
}

// ====== Khởi tạo ======
character.style.left = `${posX}px`;
character.style.top = `${posY}px`;
updateSprite();
scheduleNextAction();
requestAnimationFrame(idleAnimationLoop);

// ====== Lắng nghe resize để giữ nhân vật trong khung ======
window.addEventListener('resize', () => {
  posX = Math.min(posX, window.innerWidth - CHARACTER_SIZE);
  posY = Math.min(posY, window.innerHeight - CHARACTER_SIZE);
  character.style.left = `${posX}px`;
  character.style.top = `${posY}px`;
});
