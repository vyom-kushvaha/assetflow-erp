const { getDb } = require('../config/database');

/**
 * Helper to unpack extra_fields_schema JSON
 * @param {string|null} schemaStr 
 * @returns {object} { description: '', status: 'ACTIVE', fields: {} }
 */
function unpackSchema(schemaStr) {
  const result = { description: '', status: 'ACTIVE', fields: {} };
  if (!schemaStr) return result;

  try {
    const parsed = JSON.parse(schemaStr);
    
    // Check if it is the structured metadata format or a simple schema format
    if (parsed.status !== undefined || parsed.description !== undefined || parsed.fields !== undefined) {
      result.description = parsed.description || '';
      result.status = parsed.status || 'ACTIVE';
      result.fields = parsed.fields || {};
    } else {
      // Legacy simple schema format
      result.fields = parsed;
    }
  } catch (e) {
    console.error('Failed to parse category schema string', schemaStr, e);
  }
  return result;
}

/**
 * Helper to pack values into extra_fields_schema JSON string
 */
function packSchema({ description, status = 'ACTIVE', fields = {} }) {
  return JSON.stringify({
    description: description || '',
    status: status || 'ACTIVE',
    fields: fields || {}
  });
}

const categoryModel = {
  /**
   * Find all asset categories, unpacking custom fields
   * @returns {Promise<Array>}
   */
  findAll() {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.all('SELECT * FROM asset_categories ORDER BY id ASC', [], (err, rows) => {
        if (err) return reject(err);
        
        const mapped = (rows || []).map(row => {
          const unpacked = unpackSchema(row.extra_fields_schema);
          return {
            id: row.id,
            name: row.name,
            description: unpacked.description,
            status: unpacked.status,
            fields: unpacked.fields,
            created_at: row.created_at
          };
        });
        
        resolve(mapped);
      });
    });
  },

  /**
   * Find a specific category by ID
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  findById(id) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      db.get('SELECT * FROM asset_categories WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        
        const unpacked = unpackSchema(row.extra_fields_schema);
        resolve({
          id: row.id,
          name: row.name,
          description: unpacked.description,
          status: unpacked.status,
          fields: unpacked.fields,
          created_at: row.created_at
        });
      });
    });
  },

  /**
   * Check if category name exists
   * @param {string} name 
   * @param {number|null} excludeId 
   * @returns {Promise<boolean>}
   */
  checkNameExists(name, excludeId = null) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      let query = 'SELECT id FROM asset_categories WHERE LOWER(name) = LOWER(?)';
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
   * Create a new category
   * @param {object} params
   * @param {string} params.name
   * @param {string} params.description
   * @param {string} params.status
   * @param {object} params.fields
   * @returns {Promise<object>}
   */
  create({ name, description, status = 'ACTIVE', fields = {} }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const schemaStr = packSchema({ description, status, fields });
      db.run(
        'INSERT INTO asset_categories (name, extra_fields_schema) VALUES (?, ?)',
        [name, schemaStr],
        function (err) {
          if (err) return reject(err);
          resolve({
            id: this.lastID,
            name,
            description,
            status,
            fields
          });
        }
      );
    });
  },

  /**
   * Update category details
   * @param {number} id 
   * @param {object} params
   * @param {string} params.name
   * @param {string} params.description
   * @param {string} params.status
   * @param {object} params.fields
   * @returns {Promise<boolean>}
   */
  update(id, { name, description, status, fields }) {
    return new Promise((resolve, reject) => {
      const db = getDb();
      const schemaStr = packSchema({ description, status, fields });
      db.run(
        'UPDATE asset_categories SET name = ?, extra_fields_schema = ? WHERE id = ?',
        [name, schemaStr, id],
        function (err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }
};

module.exports = categoryModel;
