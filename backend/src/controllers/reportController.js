const reportService = require('../services/reportService');

const reportController = {
  async getReports(req, res, next) {
    try {
      const reportData = await reportService.getFullReport();
      res.status(200).json(reportData);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController;
