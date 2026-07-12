/**
 * Input validation schemas for Organization Setup Module.
 */

const orgValidation = {
  /**
   * Validate department creation/updates payload
   */
  validateDepartment(data) {
    const errors = {};
    
    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.name = 'Department name is required.';
    }

    if (data.headUserId !== undefined && data.headUserId !== null) {
      if (isNaN(parseInt(data.headUserId, 10))) {
        errors.headUserId = 'Department head user ID must be an integer.';
      }
    }

    if (data.parentDepartmentId !== undefined && data.parentDepartmentId !== null && data.parentDepartmentId !== '') {
      const parentIdInt = parseInt(data.parentDepartmentId, 10);
      if (isNaN(parentIdInt)) {
        errors.parentDepartmentId = 'Parent department ID must be an integer.';
      }
    }

    if (data.status !== undefined && data.status !== null) {
      if (data.status !== 'ACTIVE' && data.status !== 'INACTIVE') {
        errors.status = 'Status must be either ACTIVE or INACTIVE.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate category payload
   */
  validateCategory(data) {
    const errors = {};

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.name = 'Category name is required.';
    }

    if (data.status !== undefined && data.status !== null) {
      if (data.status !== 'ACTIVE' && data.status !== 'INACTIVE') {
        errors.status = 'Status must be either ACTIVE or INACTIVE.';
      }
    }

    if (data.fields !== undefined && data.fields !== null) {
      if (typeof data.fields !== 'object') {
        errors.fields = 'Schema fields descriptor must be an object.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate employee role promotion and account updates
   */
  validateRoleAssignment(data) {
    const errors = {};

    const validRoles = ['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD', 'EMPLOYEE'];
    const validStatuses = ['ACTIVE', 'INACTIVE'];

    if (!data.role || !validRoles.includes(data.role)) {
      errors.role = `Role must be one of: ${validRoles.join(', ')}`;
    }

    if (!data.status || !validStatuses.includes(data.status)) {
      errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
    }

    if (data.departmentId !== undefined && data.departmentId !== null && data.departmentId !== '') {
      if (isNaN(parseInt(data.departmentId, 10))) {
        errors.departmentId = 'Department ID must be an integer.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

module.exports = orgValidation;
