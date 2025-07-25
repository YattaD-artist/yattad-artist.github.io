// theme.js
(function setupThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  if (!themeToggle) return;

  const themeIcon = themeToggle.querySelector('i');

  function updateThemeIcon() {
    // Giữ nguyên icon, bạn có thể mở rộng nếu muốn thay đổi về sau
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
