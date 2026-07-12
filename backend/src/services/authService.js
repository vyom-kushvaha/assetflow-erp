const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const authService = {
  /**
   * Implement business logic for creating a new user account.
   * @param {object} params
   * @param {string} params.name
   * @param {string} params.email
   * @param {string} params.password
   * @param {number|null} params.departmentId
   * @returns {Promise<object>} - Newly registered user details
   */
  async signup({ name, email, password, departmentId }) {
    // 1. Check if email is already taken
    const emailExists = await userModel.checkEmailExists(email);
    if (emailExists) {
      const error = new Error('Email is already registered');
      error.status = 400;
      throw error;
    }

    // 2. Hash the plain text password using bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Save new user to the database
    try {
      const newUser = await userModel.create({
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        departmentId
      });
      return newUser;
    } catch (dbError) {
      // Handle foreign key constraint failure (e.g. department_id does not exist)
      if (dbError.message && dbError.message.includes('FOREIGN KEY constraint failed')) {
        const error = new Error('Department ID does not exist in the system');
        error.status = 400;
        throw error;
      }
      throw dbError;
    }
  },

  /**
   * Implement business logic to authenticate and retrieve session payload for a user.
   * @param {object} params
   * @param {string} params.email
   * @param {string} params.password
   * @returns {Promise<object>} - User session details
   */
  async login({ email, password }) {
    // 1. Find user by email
    const user = await userModel.findByEmail(email.toLowerCase().trim());
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // 2. Verify user status
    if (user.status !== 'ACTIVE') {
      const error = new Error('Account is deactivated. Please contact your administrator.');
      error.status = 403;
      throw error;
    }

    // 3. Verify bcrypt password matches
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    // 4. Return clean session payload (never return password_hash)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department_id: user.department_id,
      status: user.status
    };
  }
};

module.exports = authService;
