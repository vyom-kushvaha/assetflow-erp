const orgService = require('../services/orgService');
const orgValidation = require('../validations/orgValidation');

const orgController = {
  // =========================================================================
  // DEPARTMENT CONTROLLERS
  // =========================================================================

  async createDepartment(req, res, next) {
    try {
      const validation = orgValidation.validateDepartment(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const { name, headUserId, parentDepartmentId } = req.body;
      const dept = await orgService.createDepartment({
        name: name.trim(),
        headUserId: headUserId ? parseInt(headUserId, 10) : null,
        parentDepartmentId: parentDepartmentId ? parseInt(parentDepartmentId, 10) : null
      });

      res.status(201).json({
        message: 'Department created successfully',
        department: dept
      });
    } catch (err) {
      next(err);
    }
  },

  async getDepartments(req, res, next) {
    try {
      const depts = await orgService.getDepartments();
      res.status(200).json({
        departments: depts
      });
    } catch (err) {
      next(err);
    }
  },

  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const validation = orgValidation.validateDepartment(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const { name, headUserId, parentDepartmentId, status } = req.body;
      await orgService.updateDepartment(parseInt(id, 10), {
        name: name.trim(),
        headUserId: headUserId ? parseInt(headUserId, 10) : null,
        parentDepartmentId: parentDepartmentId ? parseInt(parentDepartmentId, 10) : null,
        status: status || 'ACTIVE'
      });

      res.status(200).json({
        message: 'Department updated successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  // =========================================================================
  // CATEGORY CONTROLLERS
  // =========================================================================

  async createCategory(req, res, next) {
    try {
      const validation = orgValidation.validateCategory(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const { name, description, status, fields } = req.body;
      const cat = await orgService.createCategory({
        name: name.trim(),
        description: description ? description.trim() : '',
        status: status || 'ACTIVE',
        fields: fields || {}
      });

      res.status(201).json({
        message: 'Category created successfully',
        category: cat
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategories(req, res, next) {
    try {
      const cats = await orgService.getCategories();
      res.status(200).json({
        categories: cats
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const validation = orgValidation.validateCategory(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const { name, description, status, fields } = req.body;
      await orgService.updateCategory(parseInt(id, 10), {
        name: name.trim(),
        description: description ? description.trim() : '',
        status: status || 'ACTIVE',
        fields: fields || {}
      });

      res.status(200).json({
        message: 'Category updated successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  // =========================================================================
  // EMPLOYEE CONTROLLERS
  // =========================================================================

  async getEmployees(req, res, next) {
    try {
      const emps = await orgService.getEmployees();
      res.status(200).json({
        employees: emps
      });
    } catch (err) {
      next(err);
    }
  },

  async updateEmployee(req, res, next) {
    try {
      const { id } = req.params;
      const validation = orgValidation.validateRoleAssignment(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const { role, status, departmentId } = req.body;
      await orgService.updateEmployee(parseInt(id, 10), {
        role,
        status,
        departmentId: departmentId ? parseInt(departmentId, 10) : null
      });

      res.status(200).json({
        message: 'Employee settings updated successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = orgController;
