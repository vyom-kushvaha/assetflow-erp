const departmentModel = require('../models/departmentModel');
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');

const orgService = {
  // =========================================================================
  // DEPARTMENT MANAGEMENT SERVICE METHODS
  // =========================================================================

  async createDepartment({ name, headUserId, parentDepartmentId }) {
    // Check duplicate name
    const exists = await departmentModel.checkNameExists(name);
    if (exists) {
      const err = new Error(`Department name "${name}" already exists.`);
      err.status = 400;
      throw err;
    }

    // Check parent department exists
    if (parentDepartmentId) {
      const parent = await departmentModel.findById(parentDepartmentId);
      if (!parent) {
        const err = new Error(`Parent department ID ${parentDepartmentId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    // Check head user exists
    if (headUserId) {
      const user = await userModel.findById(headUserId);
      if (!user) {
        const err = new Error(`Department head user ID ${headUserId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    return await departmentModel.create({ name, headUserId, parentDepartmentId });
  },

  async getDepartments() {
    return await departmentModel.findAll();
  },

  async updateDepartment(id, { name, headUserId, parentDepartmentId, status }) {
    const dept = await departmentModel.findById(id);
    if (!dept) {
      const err = new Error(`Department with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    // Validate name uniqueness
    const exists = await departmentModel.checkNameExists(name, id);
    if (exists) {
      const err = new Error(`Department name "${name}" is already taken.`);
      err.status = 400;
      throw err;
    }

    // Prevent self-referencing parent department
    if (parentDepartmentId && parseInt(parentDepartmentId, 10) === parseInt(id, 10)) {
      const err = new Error('A department cannot reference itself as a parent.');
      err.status = 400;
      throw err;
    }

    // Check parent exists
    if (parentDepartmentId) {
      const parent = await departmentModel.findById(parentDepartmentId);
      if (!parent) {
        const err = new Error(`Parent department ID ${parentDepartmentId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    // Check head user exists
    if (headUserId) {
      const user = await userModel.findById(headUserId);
      if (!user) {
        const err = new Error(`Department head user ID ${headUserId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    return await departmentModel.update(id, { name, headUserId, parentDepartmentId, status });
  },

  // =========================================================================
  // CATEGORY MANAGEMENT SERVICE METHODS
  // =========================================================================

  async createCategory({ name, description, status, fields }) {
    const exists = await categoryModel.checkNameExists(name);
    if (exists) {
      const err = new Error(`Asset category name "${name}" already exists.`);
      err.status = 400;
      throw err;
    }

    return await categoryModel.create({ name, description, status, fields });
  },

  async getCategories() {
    return await categoryModel.findAll();
  },

  async updateCategory(id, { name, description, status, fields }) {
    const cat = await categoryModel.findById(id);
    if (!cat) {
      const err = new Error(`Category with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    const exists = await categoryModel.checkNameExists(name, id);
    if (exists) {
      const err = new Error(`Category name "${name}" is already taken.`);
      err.status = 400;
      throw err;
    }

    return await categoryModel.update(id, { name, description, status, fields });
  },

  // =========================================================================
  // EMPLOYEE DIRECTORY METHODS
  // =========================================================================

  async getEmployees() {
    return await userModel.findAll();
  },

  async updateEmployee(id, { role, status, departmentId }) {
    const user = await userModel.findById(id);
    if (!user) {
      const err = new Error(`Employee with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    // Verify department exists if provided
    if (departmentId) {
      const dept = await departmentModel.findById(departmentId);
      if (!dept) {
        const err = new Error(`Department with ID ${departmentId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    return await userModel.updateRoleAndStatus(id, { role, status, departmentId: departmentId || null });
  }
};

module.exports = orgService;
