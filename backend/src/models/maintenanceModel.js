const { getDb } = require('../config/database');

const maintenanceModel = {
  createRequest({
    assetId,
    raisedBy,
    issueDescription,
    priority = 'MEDIUM',
    photoPath = null
  }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO maintenance_requests (
          asset_id, raised_by, issue_description, priority, photo_path, status
        ) VALUES (?, ?, ?, ?, ?, 'PENDING')
      `;
      db.run(
        query,
        [
          assetId,
          raisedBy,
          issueDescription,
          priority,
          photoPath || null
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            asset_id: assetId,
            raised_by: raisedBy,
            issue_description: issueDescription,
            priority,
            photo_path: photoPath,
            status: 'PENDING'
          });
        }
      );
    });
  },

  findAllRequests() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT m.id, m.asset_id, m.raised_by, m.issue_description, m.priority, m.photo_path,
               m.status, m.approved_by, m.technician_name, m.resolution_notes, m.resolved_at,
               m.created_at, m.updated_at,
               a.asset_tag, a.name AS asset_name, a.location AS asset_location,
               u.name AS requester_name,
               app.name AS approver_name
        FROM maintenance_requests m
        JOIN assets a ON m.asset_id = a.id
        JOIN users u ON m.raised_by = u.id
        LEFT JOIN users app ON m.approved_by = app.id
        ORDER BY m.id DESC
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
      const query = `
        SELECT m.*, a.name AS asset_name, a.asset_tag
        FROM maintenance_requests m
        JOIN assets a ON m.asset_id = a.id
        WHERE m.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  updateStatus(id, {
    status,
    approvedBy = null,
    resolutionNotes = null,
    technicianName = null,
    resolvedAt = null
  }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE maintenance_requests
        SET status = ?, approved_by = ?, resolution_notes = ?,
            technician_name = ?, resolved_at = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      db.run(
        query,
        [
          status,
          approvedBy || null,
          resolutionNotes || null,
          technicianName || null,
          resolvedAt || null,
          id
        ],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }
};

module.exports = maintenanceModel;
