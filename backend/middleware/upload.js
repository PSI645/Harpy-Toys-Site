// backend/middleware/upload.js
// Configuração do multer para upload de imagens de produtos
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../uploads");

// Garante que a pasta existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // produto_<timestamp>_<random>.<ext>  — sem espaços nem caracteres especiais
    const ext  = path.extname(file.originalname).toLowerCase();
    const nome = `produto_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, nome);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png|webp|gif/;
  const extOk  = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = tiposPermitidos.test(file.mimetype);

  if (extOk && mimeOk) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens são permitidas (jpeg, png, webp, gif)."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
