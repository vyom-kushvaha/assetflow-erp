const { getDb } = require('../config/database');

const reportModel = {
  getAssetStatusUtilization() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT status, COUNT(*) AS count,
               ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assets WHERE status != 'DISPOSED')), 2) AS percentage
        FROM assets
        WHERE status != 'DISPOSED'
        GROUP BY status
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getMostUsedAssets() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT b.asset_id, a.asset_tag, a.name AS asset_name, COUNT(*) AS booking_count
        FROM bookings b
        JOIN assets a ON b.asset_id = a.id
        GROUP BY b.asset_id
        ORDER BY booking_count DESC
        LIMIT 5
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getIdleAssets() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT id, asset_tag, name AS asset_name, status, location
        FROM assets
        WHERE status = 'AVAILABLE'
          AND id NOT IN (SELECT DISTINCT asset_id FROM bookings WHERE status IN ('UPCOMING', 'ONGOING'))
          AND id NOT IN (SELECT DISTINCT asset_id FROM allocations WHERE status = 'ACTIVE')
        LIMIT 10
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getMaintenanceFrequency() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT m.asset_id, a.asset_tag, a.name AS asset_name, COUNT(*) AS request_count
        FROM maintenance_requests m
        JOIN assets a ON m.asset_id = a.id
        GROUP BY m.asset_id
        ORDER BY request_count DESC
        LIMIT 5
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getDepartmentAllocationSummary() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT d.name AS department_name, COUNT(a.id) AS asset_count
        FROM departments d
        LEFT JOIN assets a ON a.department_id = d.id AND a.status = 'ALLOCATED'
        GROUP BY d.id
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getBookingHeatmap() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      // Returns counts grouped by day of week
      const query = `
        SELECT strftime('%w', start_time) AS day_of_week, COUNT(*) AS count
        FROM bookings
        GROUP BY day_of_week
        ORDER BY day_of_week ASC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getNearingRetirement() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      // Assets older than 3 years (useful lifespan limit for MVP check)
      const query = `
        SELECT id, asset_tag, name AS asset_name, acquisition_date, status
        FROM assets
        WHERE acquisition_date IS NOT NULL
          AND date(acquisition_date) <= date('now', '-3 years')
        LIMIT 10
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getUnderMaintenance() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT id, asset_tag, name AS asset_name, location, condition
        FROM assets
        WHERE status = 'UNDER_MAINTENANCE'
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getOverdueReturns() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT al.id, al.expected_return_date,
               a.asset_tag, a.name AS asset_name,
               u.name AS user_name, u.email AS user_email
        FROM allocations al
        JOIN assets a ON al.asset_id = a.id
        LEFT JOIN users u ON al.allocated_to_user_id = u.id
        WHERE al.status = 'ACTIVE'
          AND date(al.expected_return_date) < date('now')
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getAuditDiscrepancy() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT f.id, f.result, f.notes, f.checked_at,
               c.name AS cycle_name,
               a.asset_tag, a.name AS asset_name
        FROM audit_findings f
        JOIN audit_cycles c ON f.audit_cycle_id = c.id
        JOIN assets a ON f.asset_id = a.id
        WHERE f.result IN ('MISSING', 'DAMAGED')
          AND c.status = 'CLOSED'
        ORDER BY f.id DESC
        LIMIT 10
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
};

module.exports = reportModel;
