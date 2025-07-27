// app.js
const express = require('express');
const multer  = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const UPLOAD_DIR = path.join(__dirname, 'Concepts');

// đảm bảo thư mục tồn tại
if (!fs.existsSync(UPLOAD_DIR)){
  fs.mkdirSync(UPLOAD_DIR);
}

// cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // lưu tên theo grid index: ví dụ index_05.webp
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

app.use(express.static('public'));       // serve front-end trong /public
app.use('/Concepts', express.static(UPLOAD_DIR));  // serve ảnh upload

// endpoint upload
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ success: true, filename: req.file.filename });
});

// endpoint trả về danh sách ảnh
app.get('/images', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: err });
    res.json(files);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));
