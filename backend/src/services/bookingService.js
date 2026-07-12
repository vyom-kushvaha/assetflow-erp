const bookingModel = require('../models/bookingModel');
const assetModel = require('../models/assetModel');

const bookingService = {
  async createBooking({ assetId, bookedBy, departmentId, startTime, endTime, purpose }) {
    // 1. Verify asset exists
    const asset = await assetModel.findById(assetId);
    if (!asset) {
      const err = new Error(`Asset ID ${assetId} not found.`);
      err.status = 404;
      throw err;
    }

    // 2. Enforce constraint: only bookable assets can be booked
    if (asset.is_bookable !== 1) {
      const err = new Error(`Asset "${asset.name}" is not marked as bookable.`);
      err.status = 400;
      throw err;
    }

    // 3. Time Validation: End Time must be after Start Time
    if (new Date(startTime) >= new Date(endTime)) {
      const err = new Error('End time must be strictly after start time.');
      err.status = 400;
      throw err;
    }

    // 4. Overlap validation: half-open intervals
    const existingBookings = await bookingModel.findBookingsByAssetId(assetId);
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    for (const b of existingBookings) {
      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();

      // Half-open overlap condition: start1 < end2 AND end1 > start2
      if (newStart < bEnd && newEnd > bStart) {
        const err = new Error(`Overlapping booking conflict: This asset is already booked from ${b.start_time} to ${b.end_time}.`);
        err.status = 400;
        throw err;
      }
    }

    // 5. Create Booking
    return await bookingModel.createBooking({
      assetId,
      bookedBy,
      departmentId,
      startTime,
      endTime,
      purpose
    });
  },

  async getBookings() {
    return await bookingModel.findAllBookings();
  },

  async cancelBooking(id) {
    const booking = await bookingModel.findById(id);
    if (!booking) {
      const err = new Error(`Booking ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (booking.status === 'CANCELLED') {
      const err = new Error('Booking is already cancelled.');
      err.status = 400;
      throw err;
    }

    return await bookingModel.updateBookingStatus(id, 'CANCELLED');
  },

  async reschedule(id, { startTime, endTime }) {
    const booking = await bookingModel.findById(id);
    if (!booking) {
      const err = new Error(`Booking ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (booking.status === 'CANCELLED') {
      const err = new Error('Cannot reschedule a cancelled booking.');
      err.status = 400;
      throw err;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      const err = new Error('End time must be after start time.');
      err.status = 400;
      throw err;
    }

    // Check overlap with other bookings (excluding this booking itself)
    const existing = await bookingModel.findBookingsByAssetId(booking.asset_id);
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();

    for (const b of existing) {
      if (b.id === parseInt(id, 10)) continue; // Skip itself

      const bStart = new Date(b.start_time).getTime();
      const bEnd = new Date(b.end_time).getTime();

      if (newStart < bEnd && newEnd > bStart) {
        const err = new Error(`Overlapping booking conflict: Asset is already booked from ${b.start_time} to ${b.end_time}.`);
        err.status = 400;
        throw err;
      }
    }

    return await bookingModel.rescheduleBooking(id, { startTime, endTime });
  }
};

module.exports = bookingService;
