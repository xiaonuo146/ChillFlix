const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, bookingController.createBooking); 
router.post('/', bookingController.createBooking);
router.post('/confirm-payment', bookingController.confirmPayment);
router.get('/my', protect, bookingController.getMyBookings);
router.get('/my', bookingController.getMyBookings);
router.get('/ticket/:code', bookingController.getTicket);
router.patch('/cancel/:code', bookingController.cancelBooking);

module.exports = router;