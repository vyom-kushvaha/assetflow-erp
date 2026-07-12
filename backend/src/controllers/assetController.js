const assetService = require('../services/assetService');
const assetValidation = require('../validations/assetValidation');

const assetController = {
  async createAsset(req, res, next) {
    try {
      const validation = assetValidation.validateAsset(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const asset = await assetService.createAsset({
        name: req.body.name,
        categoryId: req.body.categoryId,
        serialNumber: req.body.serialNumber,
        qrCode: req.body.qrCode,
        acquisitionDate: req.body.acquisitionDate,
        acquisitionCost: req.body.acquisitionCost,
        condition: req.body.condition,
        location: req.body.location,
        departmentId: req.body.departmentId,
        isBookable: req.body.isBookable
      });

      res.status(201).json({
        message: 'Asset registered successfully',
        asset
      });
    } catch (err) {
      next(err);
    }
  },

  async getAssets(req, res, next) {
    try {
      const assets = await assetService.getAssets();
      res.status(200).json({
        assets
      });
    } catch (err) {
      next(err);
    }
  },

  async getAssetById(req, res, next) {
    try {
      const { id } = req.params;
      const asset = await assetService.getAssetById(parseInt(id, 10));
      res.status(200).json({
        asset
      });
    } catch (err) {
      next(err);
    }
  },

  async updateAsset(req, res, next) {
    try {
      const { id } = req.params;
      const validation = assetValidation.validateAsset(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      await assetService.updateAsset(parseInt(id, 10), {
        name: req.body.name,
        categoryId: req.body.categoryId,
        serialNumber: req.body.serialNumber,
        qrCode: req.body.qrCode,
        acquisitionDate: req.body.acquisitionDate,
        acquisitionCost: req.body.acquisitionCost,
        condition: req.body.condition,
        location: req.body.location,
        departmentId: req.body.departmentId,
        status: req.body.status,
        isBookable: req.body.isBookable
      });

      res.status(200).json({
        message: 'Asset details updated successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async uploadAttachment(req, res, next) {
    try {
      const { id } = req.params;
      const { filePath, fileType } = req.body;

      if (!filePath) {
        return res.status(400).json({
          error: {
            message: 'Document file path is required.',
            status: 400
          }
        });
      }

      const userId = req.session ? req.session.userId : null;

      const doc = await assetService.uploadDocument(parseInt(id, 10), {
        filePath: filePath.trim(),
        fileType: fileType ? fileType.trim() : 'document',
        uploadedBy: userId
      });

      res.status(201).json({
        message: 'Asset document uploaded successfully',
        document: doc
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = assetController;
