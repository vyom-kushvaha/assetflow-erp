const { getDb } = require('../config/database');

const assetModel = {
  /**
   * Find all assets, joining category name and department name
   * @returns {Promise<Array>}
   */
  findAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT a.id, a.asset_tag, a.name, a.category_id, a.serial_number, a.qr_code,
               a.acquisition_date, a.acquisition_cost, a.condition, a.location,
               a.department_id, a.status, a.is_bookable, a.created_at, a.updated_at,
               c.name AS category_name,
               d.name AS department_name
        FROM assets a
        JOIN asset_categories c ON a.category_id = c.id
        LEFT JOIN departments d ON a.department_id = d.id
        ORDER BY a.id ASC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  /**
   * Find a specific asset by ID
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT a.id, a.asset_tag, a.name, a.category_id, a.serial_number, a.qr_code,
               a.acquisition_date, a.acquisition_cost, a.condition, a.location,
               a.department_id, a.status, a.is_bookable, a.created_at, a.updated_at,
               c.name AS category_name,
               d.name AS department_name
        FROM assets a
        JOIN asset_categories c ON a.category_id = c.id
        LEFT JOIN departments d ON a.department_id = d.id
        WHERE a.id = ?
      `;
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  /**
   * Check if asset tag already exists
   * @param {string} tag 
   * @param {number|null} excludeId 
   * @returns {Promise<boolean>}
   */
  checkTagExists(tag, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = 'SELECT id FROM assets WHERE LOWER(asset_tag) = LOWER(?)';
      const params = [tag];
      if (excludeId !== null) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      db.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      });
    });
  },

  /**
   * Check if QR code already exists
   * @param {string} qrCode 
   * @param {number|null} excludeId 
   * @returns {Promise<boolean>}
   */
  checkQrCodeExists(qrCode, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = 'SELECT id FROM assets WHERE LOWER(qr_code) = LOWER(?)';
      const params = [qrCode];
      if (excludeId !== null) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      db.get(query, params, (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      });
    });
  },

  /**
   * Retrieve the highest asset tag suffix index to increment
   * @returns {Promise<number>}
   */
  getNextTagNumber() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      // Match pattern 'AF-XXXX' where XXXX is digits only to prevent collision with custom tags
      db.get("SELECT asset_tag FROM assets WHERE asset_tag GLOB 'AF-[0-9][0-9][0-9][0-9]' ORDER BY asset_tag DESC LIMIT 1", [], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(1); // Seed first tag index

        const lastTag = row.asset_tag;
        const matches = lastTag.match(/AF-(\d+)/);
        if (matches && matches[1]) {
          resolve(parseInt(matches[1], 10) + 1);
        } else {
          resolve(1);
        }
      });
    });
  },

  /**
   * Create a new asset registry entry
   */
  create({
    assetTag,
    name,
    categoryId,
    serialNumber = null,
    qrCode = null,
    acquisitionDate = null,
    acquisitionCost = null,
    condition = 'GOOD',
    location = null,
    departmentId = null,
    status = 'AVAILABLE',
    isBookable = 0
  }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        INSERT INTO assets (
          asset_tag, name, category_id, serial_number, qr_code,
          acquisition_date, acquisition_cost, condition, location,
          department_id, status, is_bookable
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.run(
        query,
        [
          assetTag, name, categoryId, serialNumber || null, qrCode || null,
          acquisitionDate || null, acquisitionCost || null, condition, location || null,
          departmentId || null, status, isBookable
        ],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            asset_tag: assetTag,
            name,
            category_id: categoryId,
            serial_number: serialNumber,
            qr_code: qrCode,
            acquisition_date: acquisitionDate,
            acquisition_cost: acquisitionCost,
            condition,
            location,
            department_id: departmentId,
            status,
            is_bookable: isBookable
          });
        }
      );
    });
  },

  /**
   * Update an existing asset
   */
  update(id, {
    name,
    categoryId,
    serialNumber,
    qrCode,
    acquisitionDate,
    acquisitionCost,
    condition,
    location,
    departmentId,
    status,
    isBookable
  }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE assets
        SET name = ?, category_id = ?, serial_number = ?, qr_code = ?,
            acquisition_date = ?, acquisition_cost = ?, condition = ?, location = ?,
            department_id = ?, status = ?, is_bookable = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      db.run(
        query,
        [
          name, categoryId, serialNumber || null, qrCode || null,
          acquisitionDate || null, acquisitionCost || null, condition, location || null,
          departmentId || null, status, isBookable, id
        ],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  },

  // =========================================================================
  // ATTACHMENTS & DOCUMENT HANDLING
  // =========================================================================

  addDocument({ assetId, filePath, fileType, uploadedBy }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run(
        'INSERT INTO asset_documents (asset_id, file_path, file_type, uploaded_by) VALUES (?, ?, ?, ?)',
        [assetId, filePath, fileType || null, uploadedBy || null],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            asset_id: assetId,
            file_path: filePath,
            file_type: fileType,
            uploaded_by: uploadedBy
          });
        }
      );
    });
  },

  getDocuments(assetId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.all('SELECT * FROM asset_documents WHERE asset_id = ? ORDER BY id DESC', [assetId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  // =========================================================================
  // HISTORIES LOGS
  // =========================================================================

  getAllocationHistory(assetId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT a.id, a.allocation_date, a.expected_return_date, a.actual_return_date, a.status,
               u.name AS user_name,
               d.name AS department_name
        FROM allocations a
        LEFT JOIN users u ON a.allocated_to_user_id = u.id
        LEFT JOIN departments d ON a.allocated_to_department_id = d.id
        WHERE a.asset_id = ?
        ORDER BY a.id DESC
      `;
      db.all(query, [assetId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  getMaintenanceHistory(assetId) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT m.id, m.issue_description, m.priority, m.status, m.resolved_at, m.created_at,
               u.name AS raised_by_name
        FROM maintenance_requests m
        LEFT JOIN users u ON m.raised_by = u.id
        WHERE m.asset_id = ?
        ORDER BY m.id DESC
      `;
      db.all(query, [assetId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }
};

module.exports = assetModel;
