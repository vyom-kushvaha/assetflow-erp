const { getDb } = require('../config/database');

const userModel = {
  /**
   * Find a user by their email address (including password_hash for validation)
   * @param {string} email 
   * @returns {Promise<object|null>}
   */
  findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  },

  /**
   * Find a user by their ID (excluding password_hash for safety)
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get(
        'SELECT id, name, email, department_id, role, status, created_at, updated_at FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) return reject(err);
          resolve(row || null);
        }
      );
    });
  },

  /**
   * Insert a new user into the database with default role of EMPLOYEE
   * @param {object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.passwordHash
   * @param {number|null} params.departmentId
   * @returns {Promise<object>}
   */
  create({ name, email, passwordHash, departmentId }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.run(
        'INSERT INTO users (name, email, password_hash, department_id, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, passwordHash, departmentId || null, 'EMPLOYEE', 'ACTIVE'],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            name,
            email,
            department_id: departmentId || null,
            role: 'EMPLOYEE',
            status: 'ACTIVE'
          });
        }
      );
    });
  },

  /**
   * Check if a user exists with a specific email
   * @param {string} email 
   * @returns {Promise<boolean>}
   */
  checkEmailExists(email) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT id FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        resolve(!!row);
      });
    });
  },

  /**
   * Find all users (employees) with their department names
   * @returns {Promise<Array>}
   */
  findAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        SELECT u.id, u.name, u.email, u.department_id, u.role, u.status, u.created_at, u.updated_at,
               d.name AS department_name
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        ORDER BY u.id ASC
      `;
      db.all(query, [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  },

  /**
   * Update a user's role, status, and department
   * @param {number} id 
   * @param {object} params
   * @param {string} params.role
   * @param {string} params.status
   * @param {number|null} params.departmentId
   * @returns {Promise<boolean>}
   */
  updateRoleAndStatus(id, { role, status, departmentId }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const query = `
        UPDATE users 
        SET role = ?, status = ?, department_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `;
      db.run(query, [role, status, departmentId, id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }
};

module.exports = userModel;
