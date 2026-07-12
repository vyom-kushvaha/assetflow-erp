/**
 * Authentication and authorization middleware checks.
 */
const authMiddleware = {
  /**
   * Restrict access to authenticated users only (requires session.userId)
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
      return next();
    }
    return res.status(401).json({
      error: {
        message: 'Unauthorized: Authentication is required',
        status: 401,
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * Restrict access to guest users only (session.userId must NOT exist)
   * @param {import('express').Request} req 
   * @param {import('express').Response} res 
   * @param {import('express').NextFunction} next 
   */
  isGuest(req, res, next) {
    if (!req.session || !req.session.userId) {
      return next();
    }
    return res.status(403).json({
      error: {
        message: 'Forbidden: You are already logged in',
        status: 403,
        timestamp: new Date().toISOString()
      }
    });
  },

  /**
   * Restrict access to users possessing specific authorization roles
   * @param {string[]} allowedRoles - Array of roles allowed (e.g. ['ADMIN', 'DEPT_HEAD'])
   */
  hasRole(allowedRoles) {
    return (req, res, next) => {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({
          error: {
            message: 'Unauthorized: Authentication is required',
            status: 401,
            timestamp: new Date().toISOString()
          }
        });
      }

      const userRole = req.session.role;
      if (allowedRoles.includes(userRole)) {
        return next();
      }

      return res.status(403).json({
        error: {
          message: `Forbidden: Access restricted. Required role: [${allowedRoles.join(', ')}]`,
          status: 403,
          timestamp: new Date().toISOString()
        }
      });
    };
  }
};

module.exports = authMiddleware;
