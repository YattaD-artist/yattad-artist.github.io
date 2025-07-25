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

