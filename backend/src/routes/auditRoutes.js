const express = require('express');
const auditController = require('../controllers/auditController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/audit/cycles', isAuthenticated, auditController.getCycles);
router.get('/audit/cycles/:id', isAuthenticated, auditController.getCycleDetails);
router.post('/audit/cycles', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), auditController.createCycle);
router.post('/audit/cycles/:id/start', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), auditController.startAudit);
router.post('/audit/cycles/:id/close', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), auditController.closeAudit);
router.post('/audit/findings/:findingId', isAuthenticated, auditController.submitFinding);

module.exports = router;
