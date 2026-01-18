const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('[upload] Cloudinary non configuré. Les endpoints renverront 500.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: process.env.CLOUDINARY_FOLDER || 'paroisse-saint-paul',
    resource_type: 'image',
    format: file.mimetype.split('/')[1],
    transformation: [{ width: 1600, crop: 'limit' }]
  })
});

const upload = multer({ storage });

// Upload d'une image
router.post('/', requireAuth, requireRole('ADMIN'), upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier reçu' });
  }
  res.status(201).json({
    url: req.file.path,
    publicId: req.file.filename
  });
});

// Suppression d'une image par publicId
router.delete('/:publicId', requireAuth, requireRole('ADMIN'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({ message: 'Suppression non effectuée', result });
    }
    res.status(200).json({ message: 'Supprimé', result: result.result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
