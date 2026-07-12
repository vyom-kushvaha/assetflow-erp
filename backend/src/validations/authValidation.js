const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate standard email fields
 * @param {string} email 
 * @returns {string|null} - Error message or null if valid
 */
function validateEmail(email) {
  if (!email) return 'Email is required';
  if (typeof email !== 'string') return 'Email must be a string';
  if (!emailRegex.test(email.trim())) return 'Invalid email format';
  return null;
}

/**
 * Validate standard password fields
 * @param {string} password 
 * @returns {string|null} - Error message or null if valid
 */
function validatePassword(password) {
  if (!password) return 'Password is required';
  if (typeof password !== 'string') return 'Password must be a string';
  if (password.length < 6) return 'Password must be at least 6 characters long';
  return null;
}

const authValidation = {
  /**
   * Validate parameters for user signup registration
   * @param {object} data
   * @returns {{isValid: boolean, errors: object}}
   */
  validateSignup(data) {
    const errors = {};
    const { name, email, password, departmentId } = data;

    // Required fields validations
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.name = 'Name is required';
    }

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (departmentId !== undefined && departmentId !== null) {
      const depInt = parseInt(departmentId, 10);
      if (isNaN(depInt) || depInt <= 0) {
        errors.departmentId = 'Department ID must be a valid positive integer';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Validate parameters for user login authentication
   * @param {object} data
   * @returns {{isValid: boolean, errors: object}}
   */
  validateLogin(data) {
    const errors = {};
    const { email, password } = data;

    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;

    if (!password) {
      errors.password = 'Password is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

module.exports = authValidation;
