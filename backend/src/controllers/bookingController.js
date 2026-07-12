const bookingService = require('../services/bookingService');

const bookingController = {
  async createBooking(req, res, next) {
    try {
      const { assetId, startTime, endTime, purpose, departmentId } = req.body;
      const bookedBy = req.session ? req.session.userId : 1; // Default to admin userId 1 if session unavailable

      if (!assetId || !startTime || !endTime) {
        return res.status(400).json({
          error: {
            message: 'Asset ID, start time, and end time are required.',
            status: 400
          }
        });
      }

      const booking = await bookingService.createBooking({
        assetId: parseInt(assetId, 10),
        bookedBy,
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        startTime,
        endTime,
        purpose
      });

      res.status(201).json({
        message: 'Resource booked successfully',
        booking
      });
    } catch (err) {
      next(err);
    }
  },

  async getBookings(req, res, next) {
    try {
      const bookings = await bookingService.getBookings();
      res.status(200).json({
        bookings
      });
    } catch (err) {
      next(err);
    }
  },

  async cancelBooking(req, res, next) {
    try {
      const { id } = req.params;
      await bookingService.cancelBooking(parseInt(id, 10));
      res.status(200).json({
        message: 'Booking cancelled successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async rescheduleBooking(req, res, next) {
    try {
      const { id } = req.params;
      const { startTime, endTime } = req.body;

      if (!startTime || !endTime) {
        return res.status(400).json({
          error: {
            message: 'Start time and end time are required for rescheduling.',
            status: 400
          }
        });
      }

      await bookingService.reschedule(parseInt(id, 10), { startTime, endTime });
      res.status(200).json({
        message: 'Booking rescheduled successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = bookingController;
