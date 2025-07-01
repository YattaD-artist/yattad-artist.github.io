// Tự động điều khiển NPC di chuyển ngẫu nhiên với animation đồng bộ
const character = document.getElementById("character");
const directions = ["U", "D", "L", "R"];
const dirVectors = {
  U: [0, -1],
  D: [0, 1],
  L: [-1, 0],
  R: [1, 0]
};

let posX = window.innerWidth / 2;
let posY = window.innerHeight / 2;
let currentState = "Idle"; // Idle, Walk, Run
let currentDir = "D";
let frameIndex = 0;
let moving = false;
let distanceRemaining = 0;
let frameTimer = 0;
let speed = 2; // px per frame (Walk)

function updateSprite() {
  const folder = currentState;
  let frameStr =
    currentState === "Run"
      ? frameIndex.toString()
      : frameIndex.toString().padStart(2, "0");
  const path = `assets/character/${folder}/${folder}${currentDir}${frameStr}.png`;
  character.src = path;
}

function startMove(dir, type = "Walk") {
  currentDir = dir;
  currentState = type;
  frameIndex = 0;
  frameTimer = 0;
  distanceRemaining = 62;
  speed = type === "Run" ? 4 : 2;
  updateSprite();
  moving = true;
}

function gameLoop() {
  if (moving) {
    const [dx, dy] = dirVectors[currentDir];
    let step = Math.min(speed, distanceRemaining);
    posX += dx * step;
    posY += dy * step;
    distanceRemaining -= step;

    frameTimer += step;
    let frameThreshold = currentState === "Run" ? 8 : 4;
    if (frameTimer >= frameThreshold) {
      frameTimer = 0;
      frameIndex = (frameIndex + 1) % (currentState === "Run" ? 8 : 16);
      updateSprite();
    }

    if (distanceRemaining <= 0) {
      moving = false;
      currentState = "Idle";
      frameIndex = 0;
      updateSprite();
      scheduleNextMove();
    }
  } else {
    // Idle frame chuyển đổi mỗi 200ms
    idleFrameTicker++;
    if (idleFrameTicker >= 12) {
      idleFrameTicker = 0;
      frameIndex = (frameIndex + 1) % 16;
      updateSprite();
    }
  }

  character.style.left = `${posX}px`;
  character.style.top = `${posY}px`;
  requestAnimationFrame(gameLoop);
}

let idleFrameTicker = 0;

function scheduleNextMove() {
  setTimeout(() => {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const moveType = Math.random() < 0.3 ? "Run" : "Walk";
    startMove(dir, moveType);
  }, 1000 + Math.random() * 1500);
}

window.addEventListener("DOMContentLoaded", () => {
  character.style.position = "absolute";
  character.style.width = "62px";
  character.style.height = "62px";
  character.style.left = `${posX}px`;
  character.style.top = `${posY}px`;
  updateSprite();
  scheduleNextMove();
  requestAnimationFrame(gameLoop);
});
