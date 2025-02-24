document.addEventListener("DOMContentLoaded", function () {
    const menuItems = document.querySelectorAll(".menu-item");
    const centerX = 150; // Tọa độ trung tâm (bán kính 150px)
    const centerY = 150;
    const radius = 120; // Bán kính vòng tròn

    menuItems.forEach((item, index) => {
        // Góc ngẫu nhiên từ 0 đến 360 độ
        const angle = Math.random() * 2 * Math.PI;
        
        // Tính vị trí theo công thức đường tròn
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        item.style.left = `${x}px`;
        item.style.top = `${y}px`;
    });
});
