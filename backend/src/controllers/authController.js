const authService = require('../services/authService');
const authValidation = require('../validations/authValidation');
const userModel = require('../models/userModel');

/**
 * Controller containing HTTP request-response handlers for authentication endpoints.
 */
const authController = {
  /**
   * Handle user signup registration
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  async signup(req, res, next) {
    try {
      // 1. Validate payload
      const { isValid, errors } = authValidation.validateSignup(req.body);
      if (!isValid) {
        return res.status(400).json({
          error: {
            message: 'Signup validation failed',
            status: 400,
            details: errors,
            timestamp: new Date().toISOString()
          }
        });
      }

      // 2. Call service logic
      const { name, email, password, departmentId } = req.body;
      const newUser = await authService.signup({ name, email, password, departmentId });

      // 3. Auto-establish session on successful signup
      req.session.userId = newUser.id;
      req.session.role = newUser.role;
      req.session.departmentId = newUser.department_id;

      return res.status(201).json({
        message: 'Signup registration completed successfully',
        user: newUser
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user login authentication
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  async login(req, res, next) {
    try {
      // 1. Validate payload
      const { isValid, errors } = authValidation.validateLogin(req.body);
      if (!isValid) {
        return res.status(400).json({
          error: {
            message: 'Login validation failed',
            status: 400,
            details: errors,
            timestamp: new Date().toISOString()
          }
        });
      }

      // 2. Authenticate user
      const { email, password } = req.body;
      const user = await authService.login({ email, password });

      // 3. Establish session
      req.session.userId = user.id;
      req.session.role = user.role;
      req.session.departmentId = user.department_id;

      return res.status(200).json({
        message: 'Login authenticated successfully',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Handle user session destruction / logout
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  async logout(req, res, next) {
    if (!req.session || !req.session.userId) {
      return res.status(400).json({
        error: {
          message: 'Bad Request: No active session found to logout',
          status: 400,
          timestamp: new Date().toISOString()
        }
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          error: {
            message: 'Internal Error: Could not close session, please try again',
            status: 500,
            timestamp: new Date().toISOString()
          }
        });
      }

      // Clear the session identifier cookie
      res.clearCookie('connect.sid');
      return res.status(200).json({
        message: 'Logout completed successfully'
      });
    });
  },

  /**
   * Get active logged-in user profile information
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({
          error: {
            message: 'Unauthorized: Session credentials not found',
            status: 401,
            timestamp: new Date().toISOString()
          }
        });
      }

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User profile not found in system database',
            status: 404,
            timestamp: new Date().toISOString()
          }
        });
      }

      return res.status(200).json({
        user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
