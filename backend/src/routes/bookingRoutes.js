const express = require('express');
const bookingController = require('../controllers/bookingController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/bookings', isAuthenticated, bookingController.getBookings);
router.post('/bookings', isAuthenticated, bookingController.createBooking);
router.post('/bookings/:id/cancel', isAuthenticated, bookingController.cancelBooking);
router.put('/bookings/:id/reschedule', isAuthenticated, bookingController.rescheduleBooking);

module.exports = router;
