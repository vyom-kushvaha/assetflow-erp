const maintenanceService = require('../services/maintenanceService');

const maintenanceController = {
  async raiseRequest(req, res, next) {
    try {
      const { assetId, issueDescription, priority, photoPath } = req.body;
      const raisedBy = req.session ? req.session.userId : 1;
      const userRole = req.session ? req.session.role : 'ADMIN';

      if (!assetId || !issueDescription) {
        return res.status(400).json({
          error: {
            message: 'Asset ID and issue description are required.',
            status: 400
          }
        });
      }

      const request = await maintenanceService.raiseRequest({
        assetId: parseInt(assetId, 10),
        raisedBy,
        issueDescription,
        priority: priority || 'MEDIUM',
        photoPath: photoPath || null,
        userRole
      });

      res.status(201).json({
        message: 'Maintenance request logged successfully',
        request
      });
    } catch (err) {
      next(err);
    }
  },

  async getRequests(req, res, next) {
    try {
      const requests = await maintenanceService.getRequests();
      res.status(200).json({
        requests
      });
    } catch (err) {
      next(err);
    }
  },

  async approveRequest(req, res, next) {
    try {
      const { id } = req.params;
      const approvedBy = req.session ? req.session.userId : 1;

      await maintenanceService.approveRequest(parseInt(id, 10), {
        approvedBy
      });

      res.status(200).json({
        message: 'Maintenance request approved successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async rejectRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const approvedBy = req.session ? req.session.userId : 1;

      await maintenanceService.rejectRequest(parseInt(id, 10), {
        approvedBy,
        reason: reason || 'Rejected by administration'
      });

      res.status(200).json({
        message: 'Maintenance request rejected successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async assignTechnician(req, res, next) {
    try {
      const { id } = req.params;
      const { technicianName } = req.body;
      const approvedBy = req.session ? req.session.userId : 1;

      if (!technicianName) {
        return res.status(400).json({
          error: {
            message: 'Technician name is required.',
            status: 400
          }
        });
      }

      await maintenanceService.assignTechnician(parseInt(id, 10), {
        approvedBy,
        technicianName
      });

      res.status(200).json({
        message: 'Technician assigned successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async resolveRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const approvedBy = req.session ? req.session.userId : 1;

      if (!resolutionNotes) {
        return res.status(400).json({
          error: {
            message: 'Resolution notes are required to close maintenance tickets.',
            status: 400
          }
        });
      }

      await maintenanceService.resolveRequest(parseInt(id, 10), {
        approvedBy,
        resolutionNotes
      });

      res.status(200).json({
        message: 'Maintenance request resolved successfully'
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = maintenanceController;
