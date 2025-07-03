// ===== TRẠNG THÁI VÀ HƯỚNG DI CHUYỂN =====
let state = "idle";         // Trạng thái hiện tại: 'idle', 'walk', 'run'
let direction = "";         // Hướng di chuyển hiện tại: "", "U", "L", "R"
let isMoving = false;       // Cờ kiểm tra xem nhân vật đang di chuyển hay không

let idleFrame = 0;          // Frame hiện tại cho trạng thái idle (đứng yên)
let moveFrame = 0;          // Frame hiện tại cho trạng thái di chuyển
let hasMoved = false;       // Kiểm tra nhân vật đã từng di chuyển chưa (để kích hoạt dịch chuyển logo)

const frameSize = 62;       // Kích thước mỗi bước đi
const directions = ["", "U", "L", "R"]; // Các hướng có thể di chuyển
const dirVectors = {
  "": [0, 1],   // Mặc định đứng yên đi xuống
  "U": [0, -1], // Lên
  "L": [-1, 0], // Trái
  "R": [1, 0]   // Phải
};

// ===== LẤY THAM CHIẾU PHẦN TỬ =====
const character = document.getElementById("character");   // Nhân vật chính
const menu = document.querySelector(".menu-vertical");    // Menu cố định trái
const logoText = document.getElementById("logo-text");    // Logo chữ YattaD
const logoBlock = document.getElementById("logo-block");  // Khối chứa nhân vật + chữ logo

let posX = 0;    // Vị trí nhân vật theo trục X
let posY = 0;    // Vị trí nhân vật theo trục Y

// ===== TIỀN TẢI TẤT CẢ HÌNH ẢNH SPRITE =====
function preloadImages(callback) {
  const folders = ["Idle", "Walk", "Run"];
  const counts = { "Idle": 16, "Walk": 16, "Run": 8 }; // Số frame mỗi trạng thái
  let loaded = 0, total = 0;

  folders.forEach(folder => {
    directions.forEach(dir => {
      const prefix = folder + dir;
      total += counts[folder];

      for (let i = 0; i < counts[folder]; i++) {
        const frameStr = folder === "Run" ? `${i}` : i.toString().padStart(2, "0");
        const img = new Image();
        img.src = `assets/character/${folder}/${prefix}${frameStr}.png`;

        img.onload = img.onerror = () => {
          loaded++;
          if (loaded === total) callback();
        };
      }
    });
  });
}

// ===== CẬP NHẬT ẢNH SPRITE THEO TRẠNG THÁI & FRAME =====
function updateSprite() {
  const folder = state.charAt(0).toUpperCase() + state.slice(1);  // Capitalize: 'idle' -> 'Idle'
  const base = folder + direction;

  const idx = state === "run"
    ? moveFrame % 8
    : state === "idle"
      ? idleFrame
      : moveFrame % 16;

  const frame = state === "run"
    ? `${idx}`
    : idx.toString().padStart(2, "0");

  character.src = `assets/character/${folder}/${base}${frame}.png`;
}

// ===== KIỂM TRA VA CHẠM GIỮA HAI HÌNH CHỮ NHẬT =====
function rectsOverlap(r1, r2) {
  return !(r1.right < r2.left ||
           r1.left > r2.right ||
           r1.bottom < r2.top ||
           r1.top > r2.bottom);
}

// ===== KIỂM TRA VA CHẠM TRƯỚC KHI DI CHUYỂN =====
function checkCollision(dx, dy) {
  const next = {
    left: posX + dx,
    top: posY + dy,
    right: posX + dx + frameSize,
    bottom: posY + dy + frameSize
  };

  const bounds = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Kiểm tra chạm biên
  if (next.left < 0 || next.top < 0 || next.right > bounds.width || next.bottom > bounds.height) {
    return true;
  }

  // Kiểm tra chạm menu bên trái
  const menuRect = menu.getBoundingClientRect();
  if (rectsOverlap(next, menuRect)) return true;

  // Kiểm tra chạm chữ YattaD (logo)
  const logoRect = logoText.getBoundingClientRect();
  if (rectsOverlap(next, logoRect)) return true;

  return false;
}

// ===== DI CHUYỂN MƯỢT TỪNG BƯỚC =====
function smoothMove(dx, dy, onFinish, mode) {
  const frames = mode === "run" ? 8 : 16;
  const speed = mode === "run" ? 35 : 70;
  let i = 0;

  const stepX = dx / frames;
  const stepY = dy / frames;

  function step() {
    if (i >= frames) return onFinish();

    posX += stepX;
    posY += stepY;
    character.style.transform = `translate(${posX}px, ${posY}px)`;

    moveFrame = i;
    updateSprite();
    i++;
    setTimeout(step, speed);
  }

  step();
}

// ===== BẮT ĐẦU DI CHUYỂN THEO BƯỚC =====
function startMove(steps, mode) {
  if (isMoving) return;

  isMoving = true;
  state = mode;
  direction = directions[Math.floor(Math.random() * directions.length)];
  moveFrame = 1;
  updateSprite();

  const [vx, vy] = dirVectors[direction];
  let count = 0;

  function next() {
    if (count >= steps) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      return scheduleNextAction();
    }

    const dx = vx * frameSize;
    const dy = vy * frameSize;

    // Nếu va chạm – đứng yên
    if (checkCollision(dx, dy)) {
      isMoving = false;
      state = "idle";
      idleFrame = 0;
      updateSprite();
      return scheduleNextAction();
    }

    // Di chuyển từng bước
    smoothMove(dx, dy, next, mode);
    count++;

    // Nếu lần đầu tiên di chuyển – căn giữa logo
    if (!hasMoved && Math.abs(posX) > 150) {
      hasMoved = true;
      centerLogoBlock();
    }
  }

  next();
}

// ===== TỰ ĐỘNG CHỌN HÀNH ĐỘNG TIẾP THEO =====
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

// ===== CĂN GIỮA KHỐI LOGO (KHI NHÂN VẬT RỜI ĐI) =====
function centerLogoBlock() {
  logoBlock.style.left = "50%";  // Căn giữa bằng CSS
}

// ===== CẬP NHẬT FRAME KHI IDLE =====
setInterval(() => {
  if (state === "idle") {
    idleFrame = (idleFrame + 1) % 16;
    updateSprite();
  }
}, 200);

// ===== KHỞI TẠO KHI LOAD TRANG =====
window.onload = () => {
  preloadImages(() => {
    logoBlock.style.left = "calc(50% - 150px)"; // Logo + nhân vật đứng lệch trái ban đầu
    character.style.transform = `translate(${posX}px, ${posY}px)`; // Đặt vị trí nhân vật ban đầu
    updateSprite();     // Hiển thị sprite idle
    scheduleNextAction(); // Bắt đầu hành vi tự động
  });
};
