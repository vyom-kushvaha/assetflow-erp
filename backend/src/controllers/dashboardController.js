const dashboardService = require('../services/dashboardService');

const dashboardController = {
  async getStats(req, res, next) {
    try {
      const userId = req.session ? req.session.userId : 1;
      const role = req.session ? req.session.role : 'ADMIN';

      const data = await dashboardService.getDashboardStats({ role, userId });
      res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  },

  async getNotifications(req, res, next) {
    try {
      const userId = req.session ? req.session.userId : 1;
      const notifications = await dashboardService.getNotifications(userId);
      res.status(200).json({
        notifications
      });
    } catch (err) {
      next(err);
    }
  },

  async readNotification(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.session ? req.session.userId : 1;

      await dashboardService.readNotification(parseInt(id, 10), userId);
      res.status(200).json({
        message: 'Notification marked as read.'
      });
    } catch (err) {
      next(err);
    }
  },

  async readAllNotifications(req, res, next) {
    try {
      const userId = req.session ? req.session.userId : 1;
      await dashboardService.readAllNotifications(userId);
      res.status(200).json({
        message: 'All notifications marked as read.'
      });
    } catch (err) {
      next(err);
    }
  },

  async getActivityLogs(req, res, next) {
    try {
      const { userFilter, entityFilter, startDate } = req.query;
      const logs = await dashboardService.getActivityLogs({ userFilter, entityFilter, startDate });
      res.status(200).json({
        logs
      });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = dashboardController;
