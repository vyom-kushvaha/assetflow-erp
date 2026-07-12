const allocationService = require('../services/allocationService');
const allocationValidation = require('../validations/allocationValidation');

const allocationController = {
  async createAllocation(req, res, next) {
    try {
      const validation = allocationValidation.validateAllocation(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const allocatedBy = req.session ? req.session.userId : 1; // Default to admin user id 1 if session unavailable

      const allocation = await allocationService.allocateAsset({
        assetId: parseInt(req.body.assetId, 10),
        allocatedToUserId: req.body.allocatedToUserId ? parseInt(req.body.allocatedToUserId, 10) : null,
        allocatedToDepartmentId: req.body.allocatedToDepartmentId ? parseInt(req.body.allocatedToDepartmentId, 10) : null,
        allocatedBy,
        expectedReturnDate: req.body.expectedReturnDate,
        notes: req.body.notes
      });

      res.status(201).json({
        message: 'Asset allocated successfully',
        allocation
      });
    } catch (err) {
      next(err);
    }
  },

  async getAllocations(req, res, next) {
    try {
      const allocations = await allocationService.getAllocations();
      res.status(200).json({
        allocations
      });
    } catch (err) {
      next(err);
    }
  },

  async returnAsset(req, res, next) {
    try {
      const { id } = req.params;
      const { returnDate, returnConditionNotes } = req.body;
      const userId = req.session ? req.session.userId : 1;

      await allocationService.returnAsset(parseInt(id, 10), {
        returnDate,
        returnConditionNotes,
        userId
      });

      res.status(200).json({
        message: 'Asset returned successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async requestTransfer(req, res, next) {
    try {
      const validation = allocationValidation.validateTransfer(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          error: {
            message: 'Validation failed',
            status: 400,
            details: validation.errors
          }
        });
      }

      const requestedBy = req.session ? req.session.userId : 1;

      const transfer = await allocationService.requestTransfer({
        assetId: parseInt(req.body.assetId, 10),
        requestedBy,
        requestedToUserId: req.body.requestedToUserId ? parseInt(req.body.requestedToUserId, 10) : null,
        requestedToDepartmentId: req.body.requestedToDepartmentId ? parseInt(req.body.requestedToDepartmentId, 10) : null,
        reason: req.body.reason
      });

      res.status(201).json({
        message: 'Transfer request logged successfully',
        transfer
      });
    } catch (err) {
      next(err);
    }
  },

  async getTransferRequests(req, res, next) {
    try {
      const transfers = await allocationService.getTransferRequests();
      res.status(200).json({
        transfers
      });
    } catch (err) {
      next(err);
    }
  },

  async approveTransfer(req, res, next) {
    try {
      const { id } = req.params;
      const approvedBy = req.session ? req.session.userId : 1;

      await allocationService.approveTransfer(parseInt(id, 10), {
        approvedBy
      });

      res.status(200).json({
        message: 'Transfer request approved and executed successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async rejectTransfer(req, res, next) {
    try {
      const { id } = req.params;
      const approvedBy = req.session ? req.session.userId : 1;

      await allocationService.rejectTransfer(parseInt(id, 10), {
        approvedBy
      });

      res.status(200).json({
        message: 'Transfer request rejected successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async getOverdueAllocations(req, res, next) {
    try {
      const overdues = await allocationService.checkOverdueAllocations();
      res.status(200).json({
        overdues
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = allocationController;
