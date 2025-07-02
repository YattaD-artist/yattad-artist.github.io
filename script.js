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
const characterWrapper = document.getElementById("character-wrapper");
const title = document.getElementById("main-title");
const textContainer = document.getElementById("text-container");

let posX = 0;
let posY = 0;

function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 };
  let loaded = 0;
  let total = 0;

  for (const folder of folders) {
    for (const dir of directions) {
      const prefix = folder + dir;
      const count = counts[folder];
      total += count;
      for (let i = 0; i < count; i++) {
        const frameStr = folder === "Run" ? `${i}` : `${i.toString().padStart(2, "0")}`;
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = () => {
          loaded++;
          if (loaded >= total) callback();
        };
        img.onerror = () => {
          console.warn("Failed to load:", img.src);
          loaded++;
          if (loaded >= total) callback();
        };
      }
    }
  }
}

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;
  let frameIndex, frameStr;

  if (state === "run") {
    frameIndex = moveFrame % 8;
    frameStr = `${frameIndex}`;
  } else {
    frameIndex = (state === "idle" ? idleFrame : moveFrame % 16);
    frameStr = frameIndex.toString().padStart(2, "0");
  }

  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

function checkCollision(dx, dy) {
  const nextX = posX + dx;
  const nextY = posY + dy;
  const charRect = { left: nextX, top: nextY, right: nextX + frameSize, bottom: nextY + frameSize };
  const bounds = { width: window.innerWidth, height: window.innerHeight };

  if (charRect.left < 0 || charRect.right > bounds.width || charRect.top < 0 || charRect.bottom > bounds.height)
    return true;

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
    if (current >= totalFrames) { onFinish(); return; }
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

function centerTitleAfterMove() {
  title.classList.add("moving-center");
}

function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;

  // Ưu tiên chọn hướng đi lên hoặc sang trái khi di chuyển lần đầu
  if (!title.classList.contains("moving-center")) {
    direction = Math.random() < 0.5 ? "U" : "L";
  } else {
    direction = directions[Math.floor(Math.random() * directions.length)];
  }

  moveFrame = 1;
  updateSprite();

  // Khi bắt đầu di chuyển lần đầu tiên, tách nhân vật ra khỏi flow layout và ghi nhớ vị trí ban đầu
  if (!title.classList.contains("moving-center")) {
    const rect = character.getBoundingClientRect();
    posX = rect.left + window.scrollX;
    posY = rect.top + window.scrollY;

    character.style.position = "absolute";
    character.style.left = `${posX}px`;
    character.style.top = `${posY}px`;

    document.body.appendChild(character);
    centerTitleAfterMove();
  }

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

    const dx = vx * frameSize;
    const dy = vy * frameSize;
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
preloadImages(() => {
  // Ngay sau preload, nhân vật di chuyển luôn
  const steps = 1 + Math.floor(Math.random() * 2); // Chỉ 1-2 bước đầu tiên
  startMove(steps, Math.random() < 0.5 ? "walk" : "run");
});

document.addEventListener("click", () => {
  const dummy = new Audio("assets/sfx/Click.mp3");
  dummy.volume = 0;
  dummy.play().catch(() => {});
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
