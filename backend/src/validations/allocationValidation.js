/**
 * Input validation checks for Allocation & Transfer workflows.
 */

const allocationValidation = {
  validateAllocation(data) {
    const errors = {};

    if (!data.assetId || isNaN(parseInt(data.assetId, 10))) {
      errors.assetId = 'Asset ID is required.';
    }

    const hasUser = data.allocatedToUserId !== undefined && data.allocatedToUserId !== null && data.allocatedToUserId !== '';
    const hasDept = data.allocatedToDepartmentId !== undefined && data.allocatedToDepartmentId !== null && data.allocatedToDepartmentId !== '';

    if (!hasUser && !hasDept) {
      errors.target = 'You must allocate the asset to either an employee or a department.';
    }

    if (hasUser && hasDept) {
      errors.target = 'Cannot allocate to both employee and department. Select exactly one.';
    }

    if (data.expectedReturnDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const returnDate = new Date(data.expectedReturnDate);
      
      if (isNaN(returnDate.getTime())) {
        errors.expectedReturnDate = 'Invalid return date format.';
      } else if (returnDate < today) {
        errors.expectedReturnDate = 'Expected return date cannot be in the past.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateTransfer(data) {
    const errors = {};

    if (!data.assetId || isNaN(parseInt(data.assetId, 10))) {
      errors.assetId = 'Asset ID is required.';
    }

    if (!data.reason || typeof data.reason !== 'string' || !data.reason.trim()) {
      errors.reason = 'Reason for transfer handover is required.';
    }

    const hasUser = data.requestedToUserId !== undefined && data.requestedToUserId !== null && data.requestedToUserId !== '';
    const hasDept = data.requestedToDepartmentId !== undefined && data.requestedToDepartmentId !== null && data.requestedToDepartmentId !== '';

    if (!hasUser && !hasDept) {
      errors.target = 'You must specify a target employee or department for the transfer.';
    }

    if (hasUser && hasDept) {
      errors.target = 'Cannot transfer to both employee and department. Choose exactly one.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

module.exports = allocationValidation;
