const { getDb } = require('../config/database');

const auditModel = {
  createCycle({ name, scopeDepartmentId, scopeLocation, startDate, endDate, createdBy }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO audit_cycles (
          name, scope_department_id, scope_location, start_date, end_date, status, created_by
        ) VALUES (?, ?, ?, ?, ?, 'PLANNED', ?)
      `;
      db.run(
        query,
        [name, scopeDepartmentId || null, scopeLocation || null, startDate, endDate, createdBy],
        function (err) {
          if (err) return reject(err);
          resolve(this.lastID);
        }
      );
    });
  },

  addAuditors(cycleId, auditorIds) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT OR IGNORE INTO audit_cycle_auditors (audit_cycle_id, auditor_user_id)
        VALUES (?, ?)
      `;
      db.serialize(() => {
        const stmt = db.prepare(query);
        auditorIds.forEach(auditorId => {
          stmt.run([cycleId, auditorId]);
        });
        stmt.finalize(err => {
          if (err) return reject(err);
          resolve(true);
        });
      });
    });
  },

  populateFindings(cycleId, scopeDepartmentId, scopeLocation) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      
      // Construct asset filter query based on scope
      let assetQuery = 'SELECT id FROM assets WHERE status != \'DISPOSED\' AND status != \'RETIRED\'';
      const params = [];

      if (scopeDepartmentId) {
        assetQuery += ' AND department_id = ?';
        params.push(scopeDepartmentId);
      }

      if (scopeLocation) {
        assetQuery += ' AND LOWER(location) LIKE LOWER(?)';
        params.push(`%${scopeLocation}%`);
      }

      db.all(assetQuery, params, (err, assets) => {
        if (err) return reject(err);
        if (assets.length === 0) return resolve(0);

        const insertQuery = `
          INSERT OR IGNORE INTO audit_findings (audit_cycle_id, asset_id)
          VALUES (?, ?)
        `;
        db.serialize(() => {
          const stmt = db.prepare(insertQuery);
          assets.forEach(asset => {
            stmt.run([cycleId, asset.id]);
          });
          stmt.finalize(errInsert => {
            if (errInsert) return reject(errInsert);
            resolve(assets.length);
          });
        });
      });
    });
  },

  findCycleById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT c.*, d.name AS department_name, u.name AS creator_name
        FROM audit_cycles c
        LEFT JOIN departments d ON c.scope_department_id = d.id
        LEFT JOIN users u ON c.created_by = u.id
        WHERE c.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);

        // Fetch assigned auditors for this cycle
        const auditorQuery = `
          SELECT u.id, u.name, u.email
          FROM audit_cycle_auditors ca
          JOIN users u ON ca.auditor_user_id = u.id
          WHERE ca.audit_cycle_id = ?
        `;
        db.all(auditorQuery, [id], (errAuditors, auditors) => {
          if (errAuditors) return reject(errAuditors);
          row.auditors = auditors || [];
          resolve(row);
        });
      });
    });
  },

  findAllCycles() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT c.*, d.name AS department_name,
               (SELECT COUNT(*) FROM audit_findings WHERE audit_cycle_id = c.id) AS total_assets,
               (SELECT COUNT(*) FROM audit_findings WHERE audit_cycle_id = c.id AND result IS NOT NULL) AS verified_assets
        FROM audit_cycles c
        LEFT JOIN departments d ON c.scope_department_id = d.id
        ORDER BY c.id DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  findFindingsByCycleId(cycleId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT f.id, f.audit_cycle_id, f.asset_id, f.auditor_user_id, f.result, f.notes, f.checked_at,
               a.asset_tag, a.name AS asset_name, a.location AS asset_location, a.condition AS asset_condition,
               u.name AS auditor_name
        FROM audit_findings f
        JOIN assets a ON f.asset_id = a.id
        LEFT JOIN users u ON f.auditor_user_id = u.id
        WHERE f.audit_cycle_id = ?
      `;
      db.all(query, [cycleId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  findFindingById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM audit_findings WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  updateFinding(id, { result, notes, auditorUserId }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE audit_findings
        SET result = ?, notes = ?, auditor_user_id = ?, checked_at = datetime('now')
        WHERE id = ?
      `;
      db.run(query, [result, notes, auditorUserId, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  },

  updateCycleStatus(id, status) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const closedAtClause = status === 'CLOSED' ? ', closed_at = datetime(\'now\')' : '';
      const query = `
        UPDATE audit_cycles
        SET status = ? ${closedAtClause}
        WHERE id = ?
      `;
      db.run(query, [status, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
};

module.exports = auditModel;
