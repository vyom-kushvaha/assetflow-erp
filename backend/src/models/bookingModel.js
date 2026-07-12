const { getDb } = require('../config/database');

const bookingModel = {
  createBooking({
    assetId,
    bookedBy,
    departmentId = null,
    startTime,
    endTime,
    purpose = null
  }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO bookings (
          asset_id, booked_by, department_id, start_time, end_time, purpose, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'UPCOMING')
      `;
      db.run(
        query,
        [
          assetId,
          bookedBy,
          departmentId || null,
          startTime,
          endTime,
          purpose || null
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            asset_id: assetId,
            booked_by: bookedBy,
            department_id: departmentId,
            start_time: startTime,
            end_time: endTime,
            purpose,
            status: 'UPCOMING'
          });
        }
      );
    });
  },

  findAllBookings() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT b.id, b.asset_id, b.booked_by, b.department_id, b.start_time, b.end_time,
               b.status, b.purpose, b.created_at, b.updated_at,
               a.asset_tag, a.name AS asset_name, a.location AS asset_location,
               u.name AS user_name, u.email AS user_email,
               d.name AS department_name
        FROM bookings b
        JOIN assets a ON b.asset_id = a.id
        JOIN users u ON b.booked_by = u.id
        LEFT JOIN departments d ON b.department_id = d.id
        ORDER BY b.start_time ASC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM bookings WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  findBookingsByAssetId(assetId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      // Only check conflicts against bookings that are NOT CANCELLED
      const query = `
        SELECT * FROM bookings 
        WHERE asset_id = ? AND status IN ('UPCOMING', 'ONGOING', 'COMPLETED')
      `;
      db.all(query, [assetId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  updateBookingStatus(id, status) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = 'UPDATE bookings SET status = ?, updated_at = datetime(\'now\') WHERE id = ?';
      db.run(query, [status, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  },

  rescheduleBooking(id, { startTime, endTime }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE bookings
        SET start_time = ?, end_time = ?, status = 'UPCOMING', updated_at = datetime('now')
        WHERE id = ?
      `;
      db.run(query, [startTime, endTime, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
};

module.exports = bookingModel;
