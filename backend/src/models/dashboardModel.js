const { getDb } = require('../config/database');

const dashboardModel = {
  /**
   * Fetch Live KPIs based on role filters
   */
  getStats({ role, userId, departmentId }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      
      let assetFilter = '';
      let bookingFilter = '';
      let transferFilter = '';
      let allocFilter = '';
      const params = [];

      if (role === 'DEPT_HEAD' && departmentId) {
        assetFilter = ' AND department_id = ?';
        bookingFilter = ' AND department_id = ?';
        transferFilter = ` AND asset_id IN (SELECT id FROM assets WHERE department_id = ?)`;
        allocFilter = ' AND (allocated_to_department_id = ? OR allocated_to_user_id IN (SELECT id FROM users WHERE department_id = ?))';
        params.push(departmentId);
      } else if (role === 'EMPLOYEE') {
        assetFilter = ' AND id IN (SELECT asset_id FROM allocations WHERE allocated_to_user_id = ? AND status = \'ACTIVE\')';
        bookingFilter = ' AND booked_by = ?';
        transferFilter = ' AND (requested_by = ? OR requested_to_user_id = ?)';
        allocFilter = ' AND allocated_to_user_id = ?';
        params.push(userId);
      }

      // We will perform a multi-query or run queries sequentially. Since SQLite is in-process, we can run them concurrently using Promise.all
      const queryRun = (sql, sqlParams) => {
        return new Promise((res, rej) => {
          db.get(sql, sqlParams, (err, row) => {
            if (err) return rej(err);
            res(row ? row.count : 0);
          });
        });
      };

      const queries = {
        available: queryRun(`SELECT COUNT(*) AS count FROM assets WHERE status = 'AVAILABLE' ${role !== 'ADMIN' ? 'AND 1=0' : ''}`, []), // Available pool is global (Admin only sees or filtered)
        allocated: queryRun(`SELECT COUNT(*) AS count FROM assets WHERE status = 'ALLOCATED' ${assetFilter}`, params),
        maintenance: queryRun(`SELECT COUNT(*) AS count FROM assets WHERE status = 'UNDER_MAINTENANCE' ${assetFilter}`, params),
        lost: queryRun(`SELECT COUNT(*) AS count FROM assets WHERE status = 'LOST' ${assetFilter}`, params),
        bookings: queryRun(`SELECT COUNT(*) AS count FROM bookings WHERE status IN ('UPCOMING', 'ONGOING') ${bookingFilter}`, params.length > 1 ? [userId] : params),
        transfers: queryRun(`SELECT COUNT(*) AS count FROM transfer_requests WHERE status = 'REQUESTED' ${transferFilter}`, params.length > 1 ? [userId, userId] : params),
        overdue: queryRun(`
          SELECT COUNT(*) AS count FROM allocations 
          WHERE status = 'ACTIVE' 
            AND expected_return_date IS NOT NULL 
            AND date(expected_return_date) < date('now')
            ${allocFilter}
        `, params.length > 1 ? [userId] : params),
        upcoming: queryRun(`
          SELECT COUNT(*) AS count FROM allocations 
          WHERE status = 'ACTIVE' 
            AND expected_return_date IS NOT NULL 
            AND date(expected_return_date) >= date('now')
            ${allocFilter}
        `, params.length > 1 ? [userId] : params)
      };

      Promise.all(Object.values(queries))
        .then((results) => {
          const keys = Object.keys(queries);
          const stats = {};
          keys.forEach((key, index) => {
            stats[key] = results[index];
          });
          resolve(stats);
        })
        .catch(reject);
    });
  },

  /**
   * Fetch recent activity logs
   */
  getRecentActivities({ limit = 10, role, userId, departmentId }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = `
        SELECT l.*, u.name AS user_name, u.email AS user_email
        FROM activity_logs l
        LEFT JOIN users u ON l.user_id = u.id
      `;
      const params = [];

      if (role === 'DEPT_HEAD' && departmentId) {
        query += ' WHERE l.user_id IN (SELECT id FROM users WHERE department_id = ?)';
        params.push(departmentId);
      } else if (role === 'EMPLOYEE') {
        query += ' WHERE l.user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY l.id DESC LIMIT ?';
      params.push(limit);

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  /**
   * Fetch upcoming returns list
   */
  getUpcomingReturnsList({ role, userId, departmentId }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = `
        SELECT al.id, al.allocation_date, al.expected_return_date, al.status,
               a.asset_tag, a.name AS asset_name,
               u.name AS user_name, u.email AS user_email
        FROM allocations al
        JOIN assets a ON al.asset_id = a.id
        LEFT JOIN users u ON al.allocated_to_user_id = u.id
        WHERE al.status = 'ACTIVE' AND al.expected_return_date IS NOT NULL
      `;
      const params = [];

      if (role === 'DEPT_HEAD' && departmentId) {
        query += ' AND (al.allocated_to_department_id = ? OR u.department_id = ?)';
        params.push(departmentId, departmentId);
      } else if (role === 'EMPLOYEE') {
        query += ' AND al.allocated_to_user_id = ?';
        params.push(userId);
      }

      query += ' ORDER BY al.expected_return_date ASC LIMIT 5';

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // =========================================================================
  // NOTIFICATIONS MODEL SECTION
  // =========================================================================

  getNotifications(userId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.all(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC',
        [userId],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        }
      );
    });
  },

  markNotificationAsRead(id, userId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run(
        'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
        [id, userId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  },

  markAllNotificationsAsRead(userId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run(
        'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
        [userId],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  },

  // =========================================================================
  // ACTIVITY LOGS SYSTEM LAYER
  // =========================================================================

  getActivityLogs({ userFilter, entityFilter, startDate }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = `
        SELECT l.*, u.name AS user_name, u.email AS user_email
        FROM activity_logs l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (userFilter) {
        query += ' AND (LOWER(u.name) LIKE LOWER(?) OR LOWER(u.email) LIKE LOWER(?))';
        params.push(`%${userFilter}%`, `%${userFilter}%`);
      }

      if (entityFilter) {
        query += ' AND LOWER(l.entity_type) = LOWER(?)';
        params.push(entityFilter);
      }

      if (startDate) {
        query += ' AND date(l.created_at) >= date(?)';
        params.push(startDate);
      }

      query += ' ORDER BY l.id DESC';

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
};

module.exports = dashboardModel;
