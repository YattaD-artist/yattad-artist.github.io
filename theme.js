// theme.js
(function setupThemeToggle() {
  function init() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

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

    applySavedTheme();
  }

  // Đợi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
