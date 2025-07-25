// ===========================================
// PHẦN HIỆU ỨNG: MẪU HÌNH, MENU, GIAO DIỆN
// ===========================================

/**
 * 1. Hiệu ứng các khối vuông bay lơ lửng (trang trí nền)
 */
(function createFloatingSquares() {
  const container = document.getElementById('floating-pattern');
  const count = 60;
  const used = new Set();

  for (let i = 0; i < count; i++) {
    const sq = document.createElement('div');
    sq.classList.add('square');

    let left, bottom, key;
    do {
      left = Math.floor(Math.random() * 95);
      bottom = Math.floor(Math.random() * 60);
      key = `${left}-${bottom}`;
    } while (used.has(key));

    used.add(key);
    const size = 20 + Math.random() * 20;
    sq.style.left = `${left}vw`;
    sq.style.bottom = `${bottom}vh`;
    sq.style.width = `${size}px`;
    sq.style.height = `${size}px`;
    sq.style.animationDuration = `${12 + Math.random() * 10}s`;
    container.appendChild(sq);
  }
})();

/**
 * 2. Tạm dừng animation khi di chuột gần các mục menu
 */
(function setupMenuInteraction() {
  const items = Array.from(document.querySelectorAll('.menu a'));
  const menu = document.querySelector('.menu');
  const threshold = 60;

  items.forEach((el) => {
    el.style.marginLeft = `${Math.random() * 40 - 20}px`;
    el.style.marginTop = `${Math.random() * 30 - 15}px`;
  });

  menu.addEventListener('mousemove', (e) => {
    items.forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.hypot(
        e.clientX - (r.left + r.width / 2),
        e.clientY - (r.top + r.height / 2)
      );
      el.style.animationPlayState = d < threshold ? 'paused' : 'running';
    });
  });

  menu.addEventListener('mouseleave', () => {
    items.forEach((el) => {
      el.style.animationPlayState = 'running';
    });
  });
})();

/**
 * 3. Chuyển đổi chế độ nền sáng/tối (Dark/Light Mode)
 */
(function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;
  const themeIcon = themeToggle.querySelector('i');

  function updateThemeIcon() {
    if (!themeIcon) return;
    themeIcon.className = document.body.classList.contains('light-mode')
      ? 'fa-solid fa-eye'
      : 'fa-solid fa-eye';
  }

  function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    updateThemeIcon();
  }

  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcon();
  });

  applySavedTheme();
})();


// ==================================================
// PHẦN CHÍNH: ĐIỀU KHIỂN NHÂN VẬT TRUNG TÂM MÀN HÌNH
// ==================================================

// ====== 1. Khởi tạo trạng thái nhân vật và hướng di chuyển ======

let state = "idle";          // Trạng thái: idle | walk | run
let direction = "";          // Hướng: "", "U", "L", "R"
let isMoving = false;        // Cờ kiểm tra đang di chuyển
let idleFrame = 0;           // Frame đang hiển thị khi idle
let moveFrame = 0;           // Frame đang hiển thị khi di chuyển

const frameSize = 62;        // Kích thước 1 frame hình
const directions = ["", "U", "L", "R"];
const dirVectors = {
  "": [0, 1],
  "U": [0, -1],
  "L": [-1, 0],
  "R": [1, 0]
};

// ====== 2. Khởi tạo phần tử DOM và vị trí ban đầu ======

const character = document.getElementById("character");
const textContainer = document.getElementById("text-container");

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2 + 100;

character.style.left = `${posX}px`;
character.style.top = `${posY}px`;
character.style.width = `${frameSize}px`;
character.style.height = `${frameSize}px`;

// ====== 3. Tải trước toàn bộ ảnh động ======

function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 };
  let loaded = 0, total = 0;

  for (const folder of folders) {
    for (const dir of directions) {
      const prefix = folder + dir;
      const count = counts[folder];
      total += count;

      for (let i = 0; i < count; i++) {
        const frameStr = folder === "Run" ? `${i}` : i.toString().padStart(2, "0");
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;
        img.onload = img.onerror = () => {
          if (++loaded === total) callback();
        };
      }
    }
  }
}

// ====== 4. Cập nhật hình ảnh tương ứng theo trạng thái hiện tại ======

function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);
  const baseName = folder + direction;
  const frameIndex = state === "run" ? moveFrame % 8 : (state === "idle" ? idleFrame : moveFrame % 16);
  const frameStr = state === "run" ? `${frameIndex}` : frameIndex.toString().padStart(2, "0");
  character.src = `assets/character/${folder}/${baseName}${frameStr}.png`;
}

// ====== 5. Kiểm tra va chạm với ranh giới màn hình và phần tử chữ ======

function checkCollision(dx, dy) {
  const nextX = posX + dx;
  const nextY = posY + dy;
  const charRect = { left: nextX, top: nextY, right: nextX + frameSize, bottom: nextY + frameSize };
  const bounds = { width: window.innerWidth, height: window.innerHeight };

  if (charRect.left < 0 || charRect.right > bounds.width || charRect.top < 0 || charRect.bottom > bounds.height) {
    return true;
  }

  const textRect = textContainer.getBoundingClientRect();
  return !(
    charRect.right < textRect.left ||
    charRect.left > textRect.right ||
    charRect.bottom < textRect.top ||
    charRect.top > textRect.bottom
  );
}

// ====== 6. Thực hiện di chuyển mượt từng bước nhỏ ======

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

// ====== 7. Bắt đầu chuỗi di chuyển liên tục theo bước ======

function startMove(steps, mode) {
  if (isMoving) return;
  isMoving = true;
  state = mode;
  direction = directions[Math.floor(Math.random() * directions.length)];
  moveFrame = 1;
  updateSprite();

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

// ====== 8. Lập kế hoạch hành động tiếp theo cho nhân vật ======

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

// ====== 9. Cập nhật hoạt ảnh khi ở trạng thái idle ======

setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// ====== 10. Khởi động toàn bộ quy trình ======

updateSprite();
preloadImages(() => {
  scheduleNextAction();
});
