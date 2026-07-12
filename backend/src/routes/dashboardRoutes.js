const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard/stats', isAuthenticated, dashboardController.getStats);
router.get('/notifications', isAuthenticated, dashboardController.getNotifications);
router.post('/notifications/read-all', isAuthenticated, dashboardController.readAllNotifications);
router.post('/notifications/:id/read', isAuthenticated, dashboardController.readNotification);
router.get('/logs', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), dashboardController.getActivityLogs);

module.exports = router;
