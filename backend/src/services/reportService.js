const reportModel = require('../models/reportModel');

const reportService = {
  async getFullReport() {
    const [
      utilization,
      mostUsed,
      idle,
      maintenanceFrequency,
      departmentAllocation,
      bookingHeatmap,
      retirement,
      underMaintenance,
      overdueReturns,
      auditDiscrepancies
    ] = await Promise.all([
      reportModel.getAssetStatusUtilization(),
      reportModel.getMostUsedAssets(),
      reportModel.getIdleAssets(),
      reportModel.getMaintenanceFrequency(),
      reportModel.getDepartmentAllocationSummary(),
      reportModel.getBookingHeatmap(),
      reportModel.getNearingRetirement(),
      reportModel.getUnderMaintenance(),
      reportModel.getOverdueReturns(),
      reportModel.getAuditDiscrepancy()
    ]);

    return {
      utilization,
      mostUsed,
      idle,
      maintenanceFrequency,
      departmentAllocation,
      bookingHeatmap,
      retirement,
      underMaintenance,
      overdueReturns,
      auditDiscrepancies
    };
  }
};

module.exports = reportService;
