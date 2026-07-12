/**
 * Validation rules for Asset Registration and updates.
 */

const assetValidation = {
  validateAsset(data) {
    const errors = {};

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      errors.name = 'Asset name is required.';
    }

    if (data.categoryId === undefined || data.categoryId === null || isNaN(parseInt(data.categoryId, 10))) {
      errors.categoryId = 'A valid category is required.';
    }

    if (data.condition !== undefined && data.condition !== null) {
      const validConditions = ['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED'];
      if (!validConditions.includes(data.condition)) {
        errors.condition = `Condition must be one of: ${validConditions.join(', ')}`;
      }
    } else {
      errors.condition = 'Asset condition is required.';
    }

    if (data.status !== undefined && data.status !== null) {
      const validStatuses = ['AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED'];
      if (!validStatuses.includes(data.status)) {
        errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
      }
    }

    if (data.isBookable !== undefined && data.isBookable !== null) {
      const val = parseInt(data.isBookable, 10);
      if (val !== 0 && val !== 1) {
        errors.isBookable = 'isBookable must be 0 (No) or 1 (Yes).';
      }
    }

    if (data.acquisitionCost !== undefined && data.acquisitionCost !== null && data.acquisitionCost !== '') {
      if (isNaN(parseFloat(data.acquisitionCost)) || parseFloat(data.acquisitionCost) < 0) {
        errors.acquisitionCost = 'Acquisition cost must be a non-negative number.';
      }
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

module.exports = assetValidation;
