const express = require('express');
const allocationController = require('../controllers/allocationController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

// =========================================================================
// ASSET ALLOCATION & RETURN ROUTES
// =========================================================================
router.get('/allocations', isAuthenticated, allocationController.getAllocations);
router.post('/allocations', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), allocationController.createAllocation);
router.post('/allocations/:id/return', isAuthenticated, allocationController.returnAsset);
router.get('/allocations/overdue', isAuthenticated, allocationController.getOverdueAllocations);

// =========================================================================
// HANDOVER & TRANSFER REQUESTS ROUTES
// =========================================================================
router.get('/transfers', isAuthenticated, allocationController.getTransferRequests);
router.post('/transfers', isAuthenticated, allocationController.requestTransfer);
router.post('/transfers/:id/approve', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD']), allocationController.approveTransfer);
router.post('/transfers/:id/reject', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER', 'DEPT_HEAD']), allocationController.rejectTransfer);

module.exports = router;
