const { getDb } = require('../config/database');

const departmentModel = {
  /**
   * Find all departments, joining head user name and parent department name
   * @returns {Promise<Array>}
   */
  findAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT d.id, d.name, d.head_user_id, d.parent_department_id, d.status, d.created_at, d.updated_at,
               u.name AS head_user_name,
               p.name AS parent_department_name
        FROM departments d
        LEFT JOIN users u ON d.head_user_id = u.id
        LEFT JOIN departments p ON d.parent_department_id = p.id
        ORDER BY d.id ASC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  /**
   * Find a specific department by ID
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM departments WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  /**
   * Check if department name already exists (optionally excluding a specific ID during updates)
   * @param {string} name 
   * @param {number|null} excludeId 
   * @returns {Promise<boolean>}
   */
  checkNameExists(name, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = 'SELECT id FROM departments WHERE LOWER(name) = LOWER(?)';
      const params = [name];
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
   * Create a new department
   * @param {object} params
   * @param {string} params.name
   * @param {number|null} params.headUserId
   * @param {number|null} params.parentDepartmentId
   * @param {string} params.status
   * @returns {Promise<object>}
   */
  create({ name, headUserId, parentDepartmentId, status = 'ACTIVE' }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run(
        'INSERT INTO departments (name, head_user_id, parent_department_id, status) VALUES (?, ?, ?, ?)',
        [name, headUserId || null, parentDepartmentId || null, status],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            name,
            head_user_id: headUserId || null,
            parent_department_id: parentDepartmentId || null,
            status
          });
        }
      );
    });
  },

  /**
   * Update department details
   * @param {number} id 
   * @param {object} params
   * @param {string} params.name
   * @param {number|null} params.headUserId
   * @param {number|null} params.parentDepartmentId
   * @param {string} params.status
   * @returns {Promise<boolean>}
   */
  update(id, { name, headUserId, parentDepartmentId, status }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE departments
        SET name = ?, head_user_id = ?, parent_department_id = ?, status = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      db.run(
        query,
        [name, headUserId || null, parentDepartmentId || null, status, id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }
};

module.exports = departmentModel;
