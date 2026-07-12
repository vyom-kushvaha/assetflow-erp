const dashboardModel = require('../models/dashboardModel');
const userModel = require('../models/userModel');

const dashboardService = {
  async getDashboardStats({ role, userId }) {
    // Fetch user details to get department_id if they are a Dept Head
    let departmentId = null;
    if (role === 'DEPT_HEAD') {
      const user = await userModel.findById(userId);
      if (user) {
        departmentId = user.department_id;
      }
    }

    const stats = await dashboardModel.getStats({ role, userId, departmentId });
    const activities = await dashboardModel.getRecentActivities({ limit: 10, role, userId, departmentId });
    const upcomingReturns = await dashboardModel.getUpcomingReturnsList({ role, userId, departmentId });

    return {
      stats,
      activities,
      upcomingReturns
    };
  },

  async getNotifications(userId) {
    return await dashboardModel.getNotifications(userId);
  },

  async readNotification(id, userId) {
    return await dashboardModel.markNotificationAsRead(id, userId);
  },

  async readAllNotifications(userId) {
    return await dashboardModel.markAllNotificationsAsRead(userId);
  },

  async getActivityLogs({ userFilter, entityFilter, startDate }) {
    return await dashboardModel.getActivityLogs({ userFilter, entityFilter, startDate });
  }
};

module.exports = dashboardService;
