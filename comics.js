const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'Concepts');

// Tạo thư mục nếu chưa có
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Cấu hình lưu file (giữ nguyên tên gốc)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // req.body.index do client gửi lên
    const idx = req.body.index;
    const name = `${idx}_${file.originalname}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Phục vụ file tĩnh
app.use(express.static(__dirname));
app.use('/Concepts', express.static(UPLOAD_DIR));

// API upload
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ success: true, filename: req.file.filename });
});

// API danh sách hình
// API upload
app.post('/upload', upload.single('image'), (req, res) => {
  // trả về filename và index
  res.json({ success: true, filename: req.file.filename, index: req.body.index });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Đã chạy tại http://localhost:${PORT}`);
});
