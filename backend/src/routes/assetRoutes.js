const express = require('express');
const assetController = require('../controllers/assetController');
const { isAuthenticated, hasRole } = require('../middleware/authMiddleware');

const router = express.Router();

// =========================================================================
// ASSET DIRECTORY & REGISTRATION ROUTES
// =========================================================================
router.get('/assets', isAuthenticated, assetController.getAssets);
router.get('/assets/:id', isAuthenticated, assetController.getAssetById);
router.post('/assets', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), assetController.createAsset);
router.put('/assets/:id', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), assetController.updateAsset);
router.post('/assets/:id/documents', isAuthenticated, hasRole(['ADMIN', 'ASSET_MANAGER']), assetController.uploadAttachment);

module.exports = router;
