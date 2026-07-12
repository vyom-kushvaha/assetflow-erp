const { getDb } = require('../config/database');

const allocationModel = {
  /**
   * Create a new active allocation
   */
  createAllocation({
    assetId,
    allocatedToUserId = null,
    allocatedToDepartmentId = null,
    allocatedBy,
    expectedReturnDate = null,
    notes = null
  }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO allocations (
          asset_id, allocated_to_user_id, allocated_to_department_id,
          allocated_by, expected_return_date, return_condition_notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')
      `;
      db.run(
        query,
        [
          assetId,
          allocatedToUserId || null,
          allocatedToDepartmentId || null,
          allocatedBy,
          expectedReturnDate || null,
          notes || null
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            asset_id: assetId,
            allocated_to_user_id: allocatedToUserId,
            allocated_to_department_id: allocatedToDepartmentId,
            allocated_by: allocatedBy,
            expected_return_date: expectedReturnDate,
            return_condition_notes: notes,
            status: 'ACTIVE'
          });
        }
      );
    });
  },

  /**
   * Fetch all allocations (including returns) with joins
   */
  findAllAllocations() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT al.id, al.asset_id, al.allocated_to_user_id, al.allocated_to_department_id,
               al.allocated_by, al.allocation_date, al.expected_return_date, al.actual_return_date,
               al.status, al.return_condition_notes,
               a.asset_tag, a.name AS asset_name, a.location AS asset_location,
               u.name AS user_name, u.email AS user_email,
               d.name AS department_name,
               b.name AS allocated_by_name
        FROM allocations al
        JOIN assets a ON al.asset_id = a.id
        LEFT JOIN users u ON al.allocated_to_user_id = u.id
        LEFT JOIN departments d ON al.allocated_to_department_id = d.id
        LEFT JOIN users b ON al.allocated_by = b.id
        ORDER BY al.id DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  /**
   * Find an active allocation by ID
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM allocations WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  /**
   * Find the current active allocation for an asset
   */
  findActiveAllocationByAssetId(assetId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT al.*, 
               u.name AS user_name, u.email AS user_email,
               d.name AS department_name
        FROM allocations al
        LEFT JOIN users u ON al.allocated_to_user_id = u.id
        LEFT JOIN departments d ON al.allocated_to_department_id = d.id
        WHERE al.asset_id = ? AND al.status = 'ACTIVE'
      `;
      db.get(query, [assetId], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  /**
   * Update allocations details (used for returns and transfers)
   */
  closeAllocation(id, { status, actualReturnDate, notes }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE allocations
        SET status = ?, actual_return_date = ?, return_condition_notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      db.run(query, [status, actualReturnDate, notes || null, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  },

  /**
   * Find active allocations that are overdue
   */
  findOverdueAllocations() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT al.*, a.asset_tag, a.name AS asset_name,
               u.name AS user_name, u.email AS user_email,
               d.name AS department_name
        FROM allocations al
        JOIN assets a ON al.asset_id = a.id
        LEFT JOIN users u ON al.allocated_to_user_id = u.id
        LEFT JOIN departments d ON al.allocated_to_department_id = d.id
        WHERE al.status = 'ACTIVE' 
          AND al.expected_return_date IS NOT NULL 
          AND date(al.expected_return_date) < date('now')
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // =========================================================================
  // TRANSFER REQUESTS QUERIES
  // =========================================================================

  createTransferRequest({
    assetId,
    fromAllocationId,
    requestedBy,
    requestedToUserId = null,
    requestedToDepartmentId = null,
    reason = null
  }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO transfer_requests (
          asset_id, from_allocation_id, requested_by,
          requested_to_user_id, requested_to_department_id, reason, status
        ) VALUES (?, ?, ?, ?, ?, ?, 'REQUESTED')
      `;
      db.run(
        query,
        [
          assetId,
          fromAllocationId,
          requestedBy,
          requestedToUserId || null,
          requestedToDepartmentId || null,
          reason || null
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            asset_id: assetId,
            from_allocation_id: fromAllocationId,
            requested_by: requestedBy,
            requested_to_user_id: requestedToUserId,
            requested_to_department_id: requestedToDepartmentId,
            reason,
            status: 'REQUESTED'
          });
        }
      );
    });
  },

  findAllTransferRequests() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT tr.id, tr.asset_id, tr.from_allocation_id, tr.requested_by,
               tr.requested_to_user_id, tr.requested_to_department_id, tr.status,
               tr.approved_by, tr.approved_at, tr.reason, tr.created_at,
               a.asset_tag, a.name AS asset_name,
               u.name AS requester_name,
               target_u.name AS target_user_name,
               target_d.name AS target_department_name
        FROM transfer_requests tr
        JOIN assets a ON tr.asset_id = a.id
        LEFT JOIN users u ON tr.requested_by = u.id
        LEFT JOIN users target_u ON tr.requested_to_user_id = target_u.id
        LEFT JOIN departments target_d ON tr.requested_to_department_id = target_d.id
        ORDER BY tr.id DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  findTransferRequestById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM transfer_requests WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  updateTransferRequestStatus(id, { status, approvedBy }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE transfer_requests
        SET status = ?, approved_by = ?, approved_at = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `;
      db.run(query, [status, approvedBy || null, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  },

  // =========================================================================
  // SYSTEM NOTIFICATIONS & LOGS WRITERS
  // =========================================================================

  addNotification({ userId, type, message, relatedEntityType = null, relatedEntityId = null }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO notifications (user_id, type, message, related_entity_type, related_entity_id, is_read)
        VALUES (?, ?, ?, ?, ?, 0)
      `;
      db.run(query, [userId, type, message, relatedEntityType, relatedEntityId], function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  },

  addActivityLog({ userId, action, entityType = null, entityId = null, details = null }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.run(
        query,
        [userId || null, action, entityType, entityId, details ? JSON.stringify(details) : null],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  }
};

module.exports = allocationModel;
