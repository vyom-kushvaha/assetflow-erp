const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/maintenance', isAuthenticated, maintenanceController.getRequests);
router.post('/maintenance', isAuthenticated, maintenanceController.raiseRequest);
router.post('/maintenance/:id/approve', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), maintenanceController.approveRequest);
router.post('/maintenance/:id/reject', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), maintenanceController.rejectRequest);
router.post('/maintenance/:id/assign', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), maintenanceController.assignTechnician);
router.post('/maintenance/:id/resolve', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), maintenanceController.resolveRequest);

module.exports = router;
