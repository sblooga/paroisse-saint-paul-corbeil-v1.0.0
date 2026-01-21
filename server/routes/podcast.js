const express = require('express');
const prisma = require('../db');

const router = express.Router();

const buildCloudinaryAudioUrl = (publicId) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME manquant');
  }
  const hasExt = /\.(mp3|m4a|wav|ogg)$/i.test(publicId);
  const suffix = hasExt ? '' : '.mp3';
  return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}${suffix}`;
};

// Liste publique des homélies (slug, title, cloudinaryPublicId)
router.get('/', async (req, res) => {
  try {
    const homilies = await prisma.homily.findMany({
      select: { id: true, slug: true, title: true, cloudinaryPublicId: true },
      distinct: ['slug'],
      orderBy: { createdAt: 'desc' }
    });
    res.json(homilies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const homily = await prisma.homily.findUnique({
      where: { slug: req.params.slug }
    });

    if (!homily) {
      return res.status(404).json({ error: 'Homélie introuvable' });
    }

    const audioUrl = buildCloudinaryAudioUrl(homily.cloudinaryPublicId);
    return res.redirect(302, audioUrl);
  } catch (error) {
    console.error('Erreur /podcast/:slug', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
