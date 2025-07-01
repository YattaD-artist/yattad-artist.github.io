let character = document.getElementById("character");

let position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let velocity = { x: 0, y: 0 };

const frameCounts = {
  Idle: 16,
  Walk: 16,
  Run: 8
};

const frameDigits = {
  Idle: 2,
  Walk: 2,
  Run: 1
};

let direction = "D"; // D = Down, U = Up, L = Left, R = Right
let currentState = "Idle";
let frame = 0;
let frameTime = 0;
let idleTimeout = null;

const speed = {
  Idle: 0,
  Walk: 2,
  Run: 4
};

function padFrameNumber(num, digits) {
  return String(num).padStart(digits, '0');
}

function updateCharacterAnimation(deltaTime) {
  frameTime += deltaTime;

  const frameDuration = currentState === "Run" ? 80 : 160;

  if (frameTime >= frameDuration) {
    frame = (frame + 1) % frameCounts[currentState];
    frameTime = 0;

    const frameStr = padFrameNumber(frame, frameDigits[currentState]);
    let src = `assets/character/${currentState}/${currentState}${direction}${frameStr}.png`;

    // Nếu không có hướng (Idle trạng thái đứng yên), dùng mặc định
    if (currentState === "Idle" && !["U", "D", "L", "R"].includes(direction)) {
      src = `assets/character/Idle/Idle00.png`;
    }

    character.src = src;
  }
}

function updatePosition() {
  position.x += velocity.x;
  position.y += velocity.y;
  character.style.left = position.x + "px";
  character.style.top = position.y + "px";

  // Khi không còn di chuyển, tự về lại Idle
  if (velocity.x === 0 && velocity.y === 0 && currentState !== "Idle") {
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
      currentState = "Idle";
      frame = 0;
    }, 100);
  }
}

let lastTime = performance.now();

function gameLoop(currentTime) {
  let deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  updatePosition();
  updateCharacterAnimation(deltaTime);

  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      velocity.y = -speed.Run;
      direction = "U";
      currentState = "Run";
      break;
    case "ArrowDown":
      velocity.y = speed.Run;
      direction = "D";
      currentState = "Run";
      break;
    case "ArrowLeft":
      velocity.x = -speed.Run;
      direction = "L";
      currentState = "Run";
      break;
    case "ArrowRight":
      velocity.x = speed.Run;
      direction = "R";
      currentState = "Run";
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "ArrowDown":
      velocity.y = 0;
      break;
    case "ArrowLeft":
    case "ArrowRight":
      velocity.x = 0;
      break;
  }

  // Nếu cả hai trục đều bằng 0 thì chuẩn bị chuyển Idle
  if (velocity.x === 0 && velocity.y === 0) {
    idleTimeout = setTimeout(() => {
      currentState = "Idle";
      frame = 0;
    }, 100);
  }
});
