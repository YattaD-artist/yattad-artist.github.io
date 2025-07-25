// ======= theme.js =======
(function handleTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle?.querySelector('i');

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

  // Gọi khi trang được tải
  applySavedTheme();

  // Gán sự kiện nếu có nút toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      const isLight = document.body.classList.contains('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      updateThemeIcon();
    });
  }
})();
