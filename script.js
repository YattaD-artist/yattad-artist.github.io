let state="idle", direction="", isMoving=false, hasMoved=false;
let idleFrame=0, moveFrame=0;
const frameSize=62;
const directions=["","U","L","R"];
const dirVectors={"":[0,1],"U":[0,-1],"L":[-1,0],"R":[1,0]};
const character=document.getElementById("character");
const logoText=document.getElementById("logo-text");
const logoBlock=document.getElementById("logo-block");
let posX=0, posY=0;

// Preload sprite images
function preloadImages(callback){
  const folders=["Idle","Walk","Run"];
  const counts={Idle:16,Walk:16,Run:8};
  let loaded=0, total=0;
  folders.forEach(f=>{
    directions.forEach(d=>{
      total+=counts[f];
      for(let i=0;i<counts[f];i++){
        const frameStr=f==="Run"?`${i}`:i.toString().padStart(2,"0");
        const img=new Image();
        img.src=`assets/character/${f}${d}/${f}${d}${frameStr}.png`;
        img.onload=img.onerror=()=>{
          if(++loaded===total) callback();
        }
      }
    });
  });
}

// Cập nhật sprite theo state
function updateSprite(){
  const folder=state.charAt(0).toUpperCase()+state.slice(1);
  const base=folder+direction;
  const idx=state==="run"?moveFrame%8:state==="idle"?idleFrame:moveFrame%16;
  const frame=state==="run"?`${idx}`:idx.toString().padStart(2,"0");
  character.src=`assets/character/${folder}${direction}/${base}${frame}.png`;
}

// Kiểm tra va chạm hộp chữ + menu + logo
function rectsOverlap(r1,r2){
  return !(r1.right<r2.left||r1.left>r2.right||r1.bottom<r2.top||r1.top>r2.bottom);
}
function checkCollision(dx,dy){
  const next={left:posX+dx,top:posY+dy,right:posX+dx+frameSize,bottom:posY+dy+frameSize};
  const b={width:window.innerWidth,height:window.innerHeight};
  if(next.left<0||next.top<0||next.right>b.width||next.bottom>b.height)return true;
  if(rectsOverlap(next,document.querySelector(".menu-vertical").getBoundingClientRect()))return true;
  if(rectsOverlap(next,logoText.getBoundingClientRect()))return true;
  return false;
}

// Di chuyển mượt từng step
function smoothMove(dx,dy,onFinish,mode){
  const frames=mode==="run"?8:16, speed=mode==="run"?35:70;
  let i=0,stepX=dx/frames,stepY=dy/frames;
  function step(){
    if(i>=frames)return onFinish();
    posX+=stepX; posY+=stepY;
    character.style.transform=`translate(${posX}px,${posY}px)`;
    moveFrame=i++;
    updateSprite();
    setTimeout(step,speed);
  }
  step();
}

// Bắt đầu hành động
function startMove(steps,mode){
  if(isMoving)return;
  isMoving=true;
  state=mode;
  direction=directions[Math.floor(Math.random()*directions.length)];
  moveFrame=1; updateSprite();
  const [vx,vy]=dirVectors[direction];
  let count=0;
  function next(){
    if(count>=steps){
      isMoving=false; state="idle"; idleFrame=0; updateSprite();
      return scheduleNextAction();
    }
    const dx=vx*frameSize,dy=vy*frameSize;
    if(checkCollision(dx,dy)){
      isMoving=false;state="idle";idleFrame=0;updateSprite();
      return scheduleNextAction();
    }
    smoothMove(dx,dy,next,mode);
    count++;
    if(!hasMoved&&Math.abs(posX)>frameSize){
      hasMoved=true;
      logoBlock.style.left="50%"; // Khi nhân vật cách 1 ô, logo-text sẽ căn giữa
    }
  }
  next();
}

// Lên lịch hành động tiếp theo
function scheduleNextAction(){
  setTimeout(()=>{
    const chance=Math.random(),steps=1+Math.floor(Math.random()*3);
    if(chance<0.2){
      state="idle";idleFrame=0;updateSprite();scheduleNextAction();
    } else if(chance<0.65){
      startMove(steps,"walk");
    } else startMove(steps,"run");
  },3000); // Khởi động sau 3s
}

// Idle frame cycling
setInterval(()=>{
  if(state==="idle"){
    idleFrame=(idleFrame+1)%16;
    updateSprite();
  }
},200);

// Thực thi khi load xong
window.onload=()=>{
  preloadImages(()=>{
    // Đặt nhân vật sát bên trái chữ logo
    const rect=logoText.getBoundingClientRect();
    posX=rect.left-frameSize-16;
    posY=rect.top;
    character.style.transform=`translate(${posX}px,${posY}px)`;
    character.style.visibility="visible";
    updateSprite();
    scheduleNextAction();
  });
};
