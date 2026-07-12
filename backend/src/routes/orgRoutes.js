const express = require('express');
const orgController = require('../controllers/orgController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

// =========================================================================
// DEPARTMENT MANAGEMENT ROUTES
// =========================================================================
router.get('/org/departments', isAuthenticated, orgController.getDepartments);
router.post('/org/departments', isAuthenticated, hasRole(['ADMIN']), orgController.createDepartment);
router.put('/org/departments/:id', isAuthenticated, hasRole(['ADMIN']), orgController.updateDepartment);

// =========================================================================
// ASSET CATEGORY MANAGEMENT ROUTES
// =========================================================================
router.get('/org/categories', isAuthenticated, orgController.getCategories);
router.post('/org/categories', isAuthenticated, hasRole(['ADMIN']), orgController.createCategory);
router.put('/org/categories/:id', isAuthenticated, hasRole(['ADMIN']), orgController.updateCategory);

// =========================================================================
// EMPLOYEE DIRECTORY & ROLE MANAGEMENT ROUTES
// =========================================================================
router.get('/org/employees', isAuthenticated, orgController.getEmployees);
router.put('/org/employees/:id/role', isAuthenticated, hasRole(['ADMIN']), orgController.updateEmployee);

module.exports = router;
