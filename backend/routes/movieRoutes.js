const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/trending', movieController.getTrending);
router.get('/:id/credits', movieController.getCredits);
router.get('/:id/similar', movieController.getSimilar);
router.get('/:id/trailer', movieController.getTrailer);
router.get('/:id', movieController.getDetail);

module.exports = router;