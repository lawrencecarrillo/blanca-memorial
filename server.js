const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure directories exist
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
const MEMORIES_FILE = path.join(__dirname, 'memories.json');
const GALLERY_FILE = path.join(__dirname, 'gallery.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(MEMORIES_FILE)) fs.writeFileSync(MEMORIES_FILE, '[]');
if (!fs.existsSync(GALLERY_FILE)) fs.writeFileSync(GALLERY_FILE, '[]');

// Multer config for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Images only'));
  }
});

// Helper functions
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch(e) { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ── MEMORIES API ──────────────────────────────────────────────

// GET all memories
app.get('/api/memories', (req, res) => {
  res.json(readJSON(MEMORIES_FILE));
});

// POST new memory
app.post('/api/memories', (req, res) => {
  const { name, relation, text } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'Name and message are required.' });
  const memories = readJSON(MEMORIES_FILE);
  const entry = {
    id: Date.now(),
    name: name.slice(0, 100),
    relation: (relation || '').slice(0, 150),
    text: text.slice(0, 2000),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
  memories.unshift(entry);
  writeJSON(MEMORIES_FILE, memories);
  res.status(201).json(entry);
});

// ── GALLERY API ───────────────────────────────────────────────

// GET all gallery photos
app.get('/api/gallery', (req, res) => {
  res.json(readJSON(GALLERY_FILE));
});

// POST new photo to gallery
app.post('/api/gallery', upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  const gallery = readJSON(GALLERY_FILE);
  const entry = {
    id: Date.now(),
    filename: req.file.filename,
    url: '/uploads/' + req.file.filename,
    caption: (req.body.caption || '').slice(0, 200),
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  };
  gallery.push(entry);
  writeJSON(GALLERY_FILE, gallery);
  res.status(201).json(entry);
});

// DELETE a gallery photo
app.delete('/api/gallery/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let gallery = readJSON(GALLERY_FILE);
  const photo = gallery.find(p => p.id === id);
  if (!photo) return res.status(404).json({ error: 'Not found' });
  // Remove file from disk
  const filePath = path.join(UPLOADS_DIR, photo.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  gallery = gallery.filter(p => p.id !== id);
  writeJSON(GALLERY_FILE, gallery);
  res.json({ success: true });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Blanca Galvan Memorial running on port ${PORT}`);
});
