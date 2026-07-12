const maintenanceModel = require('../models/maintenanceModel');
const assetModel = require('../models/assetModel');
const allocationModel = require('../models/allocationModel');

const maintenanceService = {
  async raiseRequest({ assetId, raisedBy, issueDescription, priority, photoPath, userRole }) {
    // 1. Verify asset exists
    const asset = await assetModel.findById(assetId);
    if (!asset) {
      const err = new Error(`Asset ID ${assetId} not found.`);
      err.status = 404;
      throw err;
    }

    // 2. Enforce constraint: "Only allocated users or authorized roles can raise requests."
    const isAuthorizedRole = userRole === 'ADMIN' || userRole === 'ASSET_MANAGER';
    if (!isAuthorizedRole) {
      const activeAlloc = await allocationModel.findActiveAllocationByAssetId(assetId);
      const isAllocatedUser = activeAlloc && activeAlloc.allocated_to_user_id === raisedBy;
      
      if (!isAllocatedUser) {
        const err = new Error('Unauthorized: Only the currently allocated user or system manager can raise maintenance tickets.');
        err.status = 403;
        throw err;
      }
    }

    // 3. Create request
    return await maintenanceModel.createRequest({
      assetId,
      raisedBy,
      issueDescription: issueDescription.trim(),
      priority,
      photoPath
    });
  },

  async getRequests() {
    return await maintenanceModel.findAllRequests();
  },

  async approveRequest(id, { approvedBy }) {
    const request = await maintenanceModel.findById(id);
    if (!request) {
      const err = new Error(`Maintenance request ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (request.status !== 'PENDING') {
      const err = new Error(`Request is already resolved or approved (Status: ${request.status}).`);
      err.status = 400;
      throw err;
    }

    // Update ticket status to APPROVED
    await maintenanceModel.updateStatus(id, {
      status: 'APPROVED',
      approvedBy
    });

    // Update asset status to UNDER_MAINTENANCE
    const asset = await assetModel.findById(request.asset_id);
    await assetModel.update(request.asset_id, {
      name: asset.name,
      categoryId: asset.category_id,
      serialNumber: asset.serial_number,
      qrCode: asset.qr_code,
      acquisitionDate: asset.acquisition_date,
      acquisitionCost: asset.acquisition_cost,
      condition: asset.condition,
      location: asset.location,
      departmentId: asset.department_id,
      status: 'UNDER_MAINTENANCE',
      isBookable: asset.is_bookable
    });

    return true;
  },

  async rejectRequest(id, { approvedBy, reason }) {
    const request = await maintenanceModel.findById(id);
    if (!request) {
      const err = new Error(`Maintenance request ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (request.status !== 'PENDING') {
      const err = new Error('Request is already processed.');
      err.status = 400;
      throw err;
    }

    return await maintenanceModel.updateStatus(id, {
      status: 'REJECTED',
      approvedBy,
      resolutionNotes: reason
    });
  },

  async assignTechnician(id, { approvedBy, technicianName }) {
    const request = await maintenanceModel.findById(id);
    if (!request) {
      const err = new Error(`Maintenance request ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    const validStates = ['APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'];
    if (!validStates.includes(request.status)) {
      const err = new Error(`Cannot assign technician to request in status: ${request.status}`);
      err.status = 400;
      throw err;
    }

    // Set to TECHNICIAN_ASSIGNED first, or move directly to IN_PROGRESS if already assigned
    const targetStatus = request.status === 'APPROVED' ? 'TECHNICIAN_ASSIGNED' : 'IN_PROGRESS';

    return await maintenanceModel.updateStatus(id, {
      status: targetStatus,
      approvedBy,
      technicianName
    });
  },

  async resolveRequest(id, { approvedBy, resolutionNotes }) {
    const request = await maintenanceModel.findById(id);
    if (!request) {
      const err = new Error(`Maintenance request ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    const activeStates = ['APPROVED', 'TECHNICIAN_ASSIGNED', 'IN_PROGRESS'];
    if (!activeStates.includes(request.status)) {
      const err = new Error('Only active approved tickets can be resolved.');
      err.status = 400;
      throw err;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Resolve ticket
    await maintenanceModel.updateStatus(id, {
      status: 'RESOLVED',
      approvedBy,
      resolutionNotes,
      technicianName: request.technician_name,
      resolvedAt: todayDate
    });

    // 2. Set Asset status back to AVAILABLE
    const asset = await assetModel.findById(request.asset_id);
    await assetModel.update(request.asset_id, {
      name: asset.name,
      categoryId: asset.category_id,
      serialNumber: asset.serial_number,
      qrCode: asset.qr_code,
      acquisitionDate: asset.acquisition_date,
      acquisitionCost: asset.acquisition_cost,
      condition: 'GOOD', // Repaired back to good shape!
      location: asset.location,
      departmentId: null, // Reset allocation to pool
      status: 'AVAILABLE',
      isBookable: asset.is_bookable
    });

    // 3. Log Activity
    await allocationModel.addActivityLog({
      userId: approvedBy,
      action: 'RESOLVE_MAINTENANCE',
      entityType: 'assets',
      entityId: request.asset_id,
      details: {
        ticketId: id,
        notes: resolutionNotes
      }
    });

    // 4. Create Notification for requester
    await allocationModel.addNotification({
      userId: request.raised_by,
      type: 'MAINTENANCE_RESOLVED',
      message: `Your maintenance ticket for asset "${asset.name}" (${asset.asset_tag}) has been resolved.`,
      relatedEntityType: 'maintenance_requests',
      relatedEntityId: id
    });

    return true;
  }
};

module.exports = maintenanceService;
