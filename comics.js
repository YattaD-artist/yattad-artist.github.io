// ========== 1. Hiệu ứng nền hình vuông trôi ==========
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

// ========== 2. Hiệu ứng menu ==========
(function setupMenuInteraction() {
  const items = Array.from(document.querySelectorAll('.menu a'));
  const menu = document.querySelector('.menu');
  const threshold = 60;

  // Random offset
  items.forEach((el) => {
    el.style.marginLeft = `${Math.random() * 40 - 20}px`;
    el.style.marginTop = `${Math.random() * 30 - 15}px`;
  });
// ========== Hiệu ứng Lóe ==========
function triggerShine() {
  const items = document.querySelectorAll('.menu a');
  items.forEach(item => {
    item.classList.add('shine');
    setTimeout(() => item.classList.remove('shine'), 1000); // xóa sau 1s
  });
  const nextDelay = Math.random() * 8000 + 7000; // 7000–15000ms
  setTimeout(triggerShine, nextDelay);   // Gọi lại sau khoảng ngẫu nhiên từ 7 – 15s
}
document.addEventListener("DOMContentLoaded", () => {// Khởi động sau khi DOM sẵn sàng
  setTimeout(triggerShine, 3000); // khởi động sau 3s
});
  // Hover tạm dừng
  // Hover tạm dừng
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

// ========== 3. Đổi chế độ sáng/tối ==========
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');

  function updateThemeIcon() {
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

  // Gọi ngay khi trang được tải
  applySavedTheme();

// ========== 4. Slideshow truyện PunkgaMerch ==========
(function setupGallery() {
  const link = document.getElementById('punkga-link');
  const overlay = document.getElementById('overlay');
  const deck = document.getElementById('deck');
  const caption = document.getElementById('caption');
  const closeBtn = document.getElementById('closeBtn');
  const restartBtn = document.getElementById('restartBtn');

  const total = 15;
  const images = [];
  let index = 0;
  let transitioning = false;
  let touchStartX = 0;

  const caps = Array.from({ length: total }, (_, i) =>
    i === 0 ? 'Trang Bìa' : `Trang ${i}`
  );
  const sounds = Array.from({ length: 4 }, (_, i) =>
    `assets/sfx/Pictures/Paper${i + 1}.mp3`
  );

  // Load ảnh
  for (let i = 0; i < total; i++) {
    const img = document.createElement('img');
    img.src = `comics/PunkgaMerch/${String(i).padStart(2, '0')}.webp`;
    if (i > 2) img.loading = 'lazy';
    deck.appendChild(img);
    images.push(img);
    img.addEventListener('transitionend', () => {
      if (img.classList.contains('active')) transitioning = false;
    });
  }

  function update() {
    images.forEach((img, i) => {
      img.className = '';
      img.style.zIndex = '';
      if (i === index) {
        img.classList.add('active');
        img.style.zIndex = '30';
      } else if (i < index) {
        img.classList.add('left');
        img.style.zIndex = String(5 + i);
      } else {
        img.classList.add('right');
        img.style.zIndex = String(5 - (i - index));
      }
    });
    caption.textContent = caps[index];
    restartBtn.style.display = index === total - 1 ? 'block' : 'none';
  }

  function playSound() {
    const audio = new Audio(
      sounds[Math.floor(Math.random() * sounds.length)]
    );
    audio.playbackRate = 1.5;
    audio.play().catch(() => {});
  }

  function show() {
    index = 0;
    transitioning = false;
    overlay.style.display = 'flex';
    update();
  }

  function hide() {
    overlay.style.display = 'none';
    transitioning = false;
  }

  function next() {
    if (!transitioning && index < total - 1) {
      playSound();
      transitioning = true;
      index++;
      update();
    }
  }

  function prev() {
    if (!transitioning && index > 0) {
      playSound();
      transitioning = true;
      index--;
      update();
    }
  }

  function restart() {
    if (!transitioning) {
      index = 0;
      update();
    }
  }

  // Sự kiện
  link.addEventListener('click', show);
  closeBtn.addEventListener('click', hide);
  restartBtn.addEventListener('click', restart);

  overlay.addEventListener('click', (e) => {
    const rect = overlay.getBoundingClientRect();
    if (e.clientX > rect.left + rect.width / 2 + 50) next();
    else if (e.clientX < rect.left + rect.width / 2 - 50) prev();
  });

  overlay.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  });

  overlay.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      diff < 0 ? next() : prev();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (overlay.style.display === 'flex' && !transitioning) {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'Escape') hide();
    }
  });
})();
