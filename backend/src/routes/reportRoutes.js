const express = require('express');
const reportController = require('../controllers/reportController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/reports', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), reportController.getReports);

module.exports = router;
