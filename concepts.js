// concepts.js
const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'Concepts');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Cấu hình lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    cb(null, file.originalname); // giữ nguyên tên file khi upload
  }
});
const upload = multer({ storage });

// Phục vụ file tĩnh
app.use(express.static(__dirname));
app.use('/Concepts', express.static(UPLOAD_DIR));

// API tải ảnh lên
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ success: true, filename: req.file.filename });
});

// API trả về danh sách ảnh đã upload
app.get('/images', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err });
    res.json(files);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Đã chạy tại http://localhost:${PORT}`);
});
