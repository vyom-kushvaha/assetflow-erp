const auditService = require('../services/auditService');

const auditController = {
  async createCycle(req, res, next) {
    try {
      const { name, scopeDepartmentId, scopeLocation, startDate, endDate, auditorIds } = req.body;
      const createdBy = req.session ? req.session.userId : 1;

      const result = await auditService.createCycle({
        name,
        scopeDepartmentId: scopeDepartmentId ? parseInt(scopeDepartmentId, 10) : null,
        scopeLocation,
        startDate,
        endDate,
        auditorIds: Array.isArray(auditorIds) ? auditorIds.map(id => parseInt(id, 10)) : [],
        createdBy
      });

      res.status(201).json({
        message: 'Audit cycle created successfully',
        cycleId: result.cycleId,
        scopedAssets: result.scopedCount
      });
    } catch (err) {
      next(err);
    }
  },

  async startAudit(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.session ? req.session.userId : 1;

      await auditService.startAudit(parseInt(id, 10), userId);
      res.status(200).json({
        message: 'Audit cycle started successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async submitFinding(req, res, next) {
    try {
      const { findingId } = req.params;
      const { result, notes } = req.body;
      const auditorUserId = req.session ? req.session.userId : 1;
      const userRole = req.session ? req.session.role : 'ADMIN';

      if (!result) {
        return res.status(400).json({
          error: {
            message: 'Finding result (VERIFIED, MISSING, or DAMAGED) is required.',
            status: 400
          }
        });
      }

      await auditService.submitFinding(parseInt(findingId, 10), {
        result,
        notes: notes || null,
        auditorUserId,
        userRole
      });

      res.status(200).json({
        message: 'Audit finding logged successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  async closeAudit(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.session ? req.session.userId : 1;

      const summary = await auditService.closeAudit(parseInt(id, 10), userId);
      res.status(200).json({
        message: 'Audit cycle closed successfully',
        summary
      });
    } catch (err) {
      next(err);
    }
  },

  async getCycles(req, res, next) {
    try {
      const cycles = await auditService.getCycles();
      res.status(200).json({
        cycles
      });
    } catch (err) {
      next(err);
    }
  },

  async getCycleDetails(req, res, next) {
    try {
      const { id } = req.params;
      const data = await auditService.getCycleDetails(parseInt(id, 10));
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = auditController;
