document.addEventListener("DOMContentLoaded", function () {
    const menuItems = document.querySelectorAll(".menu-item");
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2 + 50; // Đẩy xuống một chút

    menuItems.forEach(item => {
        const angle = Math.random() * Math.PI * 2; // Góc ngẫu nhiên (0 - 360 độ)
        const radius = 120 + Math.random() * 150; // Khoảng cách từ tiêu đề (120px - 200px)
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
    });
});
