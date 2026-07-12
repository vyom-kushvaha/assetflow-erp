const allocationModel = require('../models/allocationModel');
const assetModel = require('../models/assetModel');
const userModel = require('../models/userModel');
const departmentModel = require('../models/departmentModel');

const allocationService = {
  async allocateAsset({
    assetId,
    allocatedToUserId,
    allocatedToDepartmentId,
    allocatedBy,
    expectedReturnDate,
    notes
  }) {
    // 1. Verify asset exists
    const asset = await assetModel.findById(assetId);
    if (!asset) {
      const err = new Error(`Asset ID ${assetId} not found.`);
      err.status = 404;
      throw err;
    }

    // 2. Enforce constraint: Only AVAILABLE assets can be allocated
    if (asset.status !== 'AVAILABLE') {
      // Find the active allocation to show who holds it
      const activeAlloc = await allocationModel.findActiveAllocationByAssetId(assetId);
      const holderName = activeAlloc 
        ? (activeAlloc.user_name || `${activeAlloc.department_name} (Dept)`)
        : 'Unknown Holder';

      const err = new Error(`Double Allocation Blocked: Asset is currently ${asset.status}. Active Holder: ${holderName}.`);
      err.status = 400;
      err.holderName = holderName;
      err.activeAllocationId = activeAlloc ? activeAlloc.id : null;
      throw err;
    }

    // 3. Verify target employee exists
    if (allocatedToUserId) {
      const user = await userModel.findById(allocatedToUserId);
      if (!user) {
        const err = new Error(`Target employee ID ${allocatedToUserId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    // 4. Verify target department exists
    if (allocatedToDepartmentId) {
      const dept = await departmentModel.findById(allocatedToDepartmentId);
      if (!dept) {
        const err = new Error(`Target department ID ${allocatedToDepartmentId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    // 5. Create Allocation
    const allocation = await allocationModel.createAllocation({
      assetId,
      allocatedToUserId,
      allocatedToDepartmentId,
      allocatedBy,
      expectedReturnDate,
      notes
    });

    // 6. Update Asset Status to ALLOCATED
    await assetModel.update(assetId, {
      name: asset.name,
      categoryId: asset.category_id,
      serialNumber: asset.serial_number,
      qrCode: asset.qr_code,
      acquisitionDate: asset.acquisition_date,
      acquisitionCost: asset.acquisition_cost,
      condition: asset.condition,
      location: asset.location,
      departmentId: allocatedToDepartmentId || asset.department_id,
      status: 'ALLOCATED',
      isBookable: asset.is_bookable
    });

    // 7. Log Activity
    await allocationModel.addActivityLog({
      userId: allocatedBy,
      action: 'ALLOCATE_ASSET',
      entityType: 'assets',
      entityId: assetId,
      details: {
        allocationId: allocation.id,
        targetUser: allocatedToUserId,
        targetDept: allocatedToDepartmentId,
        expectedReturn: expectedReturnDate
      }
    });

    // 8. Create Notification
    const notifyTargetUserId = allocatedToUserId || allocatedBy;
    const holderLabel = allocatedToUserId ? 'you' : 'your department';
    await allocationModel.addNotification({
      userId: notifyTargetUserId,
      type: 'ALLOCATION_RECEIVED',
      message: `Asset "${asset.name}" (${asset.asset_tag}) has been allocated to ${holderLabel}.`,
      relatedEntityType: 'allocations',
      relatedEntityId: allocation.id
    });

    return allocation;
  },

  async getAllocations() {
    return await allocationModel.findAllAllocations();
  },

  async returnAsset(id, { returnDate, returnConditionNotes, userId }) {
    const alloc = await allocationModel.findById(id);
    if (!alloc) {
      const err = new Error(`Allocation record ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (alloc.status !== 'ACTIVE') {
      const err = new Error(`Allocation ID ${id} is already closed (Status: ${alloc.status}).`);
      err.status = 400;
      throw err;
    }

    const asset = await assetModel.findById(alloc.asset_id);
    if (!asset) {
      const err = new Error(`Asset ID ${alloc.asset_id} not found.`);
      err.status = 404;
      throw err;
    }

    const todayDate = returnDate || new Date().toISOString().split('T')[0];

    // 1. Close Allocation (status = RETURNED)
    await allocationModel.closeAllocation(id, {
      status: 'RETURNED',
      actualReturnDate: todayDate,
      notes: returnConditionNotes
    });

    // 2. Set Asset status back to AVAILABLE
    await assetModel.update(alloc.asset_id, {
      name: asset.name,
      categoryId: asset.category_id,
      serialNumber: asset.serial_number,
      qrCode: asset.qr_code,
      acquisitionDate: asset.acquisition_date,
      acquisitionCost: asset.acquisition_cost,
      condition: returnConditionNotes ? 'FAIR' : asset.condition,
      location: asset.location,
      departmentId: null,
      status: 'AVAILABLE',
      isBookable: asset.is_bookable
    });

    // 3. Log Activity
    await allocationModel.addActivityLog({
      userId,
      action: 'RETURN_ASSET',
      entityType: 'assets',
      entityId: alloc.asset_id,
      details: {
        allocationId: id,
        returnDate: todayDate,
        notes: returnConditionNotes
      }
    });

    // 4. Create Notification
    await allocationModel.addNotification({
      userId: userId || alloc.allocated_by,
      type: 'ASSET_RETURNED',
      message: `Asset "${asset.name}" (${asset.asset_tag}) has been returned back to storage.`,
      relatedEntityType: 'allocations',
      relatedEntityId: id
    });

    return true;
  },

  async requestTransfer({ assetId, requestedBy, requestedToUserId, requestedToDepartmentId, reason }) {
    // Check asset active allocation
    const activeAlloc = await allocationModel.findActiveAllocationByAssetId(assetId);
    if (!activeAlloc) {
      const err = new Error(`Asset ID ${assetId} has no active allocation. Handover transfer request rejected.`);
      err.status = 400;
      throw err;
    }

    // Save transfer
    const transfer = await allocationModel.createTransferRequest({
      assetId,
      fromAllocationId: activeAlloc.id,
      requestedBy,
      requestedToUserId,
      requestedToDepartmentId,
      reason
    });

    // Log Activity
    await allocationModel.addActivityLog({
      userId: requestedBy,
      action: 'REQUEST_TRANSFER',
      entityType: 'transfer_requests',
      entityId: transfer.id,
      details: {
        assetId,
        fromAllocationId: activeAlloc.id,
        reason
      }
    });

    return transfer;
  },

  async getTransferRequests() {
    return await allocationModel.findAllTransferRequests();
  },

  async approveTransfer(id, { approvedBy }) {
    const tr = await allocationModel.findTransferRequestById(id);
    if (!tr) {
      const err = new Error(`Transfer request ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (tr.status !== 'REQUESTED') {
      const err = new Error(`Transfer request is already resolved (Status: ${tr.status}).`);
      err.status = 400;
      throw err;
    }

    const asset = await assetModel.findById(tr.asset_id);
    if (!asset) {
      const err = new Error(`Asset ID ${tr.asset_id} not found.`);
      err.status = 404;
      throw err;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    // 1. Close old allocation (status = TRANSFERRED)
    await allocationModel.closeAllocation(tr.from_allocation_id, {
      status: 'TRANSFERRED',
      actualReturnDate: todayDate,
      notes: `Transferred via request #T-${id}`
    });

    // 2. Create new active allocation for target holder
    const newAlloc = await allocationModel.createAllocation({
      assetId: tr.asset_id,
      allocatedToUserId: tr.requested_to_user_id,
      allocatedToDepartmentId: tr.requested_to_department_id,
      allocatedBy: approvedBy,
      expectedReturnDate: null,
      notes: 'Transferred handover allocation'
    });

    // 3. Update transfer status to COMPLETED
    await allocationModel.updateTransferRequestStatus(id, {
      status: 'COMPLETED',
      approvedBy
    });

    // 4. Update asset department link
    await assetModel.update(tr.asset_id, {
      name: asset.name,
      categoryId: asset.category_id,
      serialNumber: asset.serial_number,
      qrCode: asset.qr_code,
      acquisitionDate: asset.acquisition_date,
      acquisitionCost: asset.acquisition_cost,
      condition: asset.condition,
      location: asset.location,
      departmentId: tr.requested_to_department_id || null,
      status: 'ALLOCATED',
      isBookable: asset.is_bookable
    });

    // 5. Log Activity
    await allocationModel.addActivityLog({
      userId: approvedBy,
      action: 'APPROVE_TRANSFER',
      entityType: 'transfer_requests',
      entityId: id,
      details: {
        oldAllocationId: tr.from_allocation_id,
        newAllocationId: newAlloc.id
      }
    });

    // 6. Create Notifications
    const targetUserId = tr.requested_to_user_id || approvedBy;
    await allocationModel.addNotification({
      userId: targetUserId,
      type: 'TRANSFER_COMPLETED',
      message: `Asset "${asset.name}" (${asset.asset_tag}) transfer has been approved and allocated to you.`,
      relatedEntityType: 'transfer_requests',
      relatedEntityId: id
    });

    return true;
  },

  async rejectTransfer(id, { approvedBy }) {
    const tr = await allocationModel.findTransferRequestById(id);
    if (!tr) {
      const err = new Error(`Transfer request ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    if (tr.status !== 'REQUESTED') {
      const err = new Error(`Transfer request is already resolved.`);
      err.status = 400;
      throw err;
    }

    // Reject transfer
    await allocationModel.updateTransferRequestStatus(id, {
      status: 'REJECTED',
      approvedBy
    });

    // Log Activity
    await allocationModel.addActivityLog({
      userId: approvedBy,
      action: 'REJECT_TRANSFER',
      entityType: 'transfer_requests',
      entityId: id
    });

    return true;
  },

  async checkOverdueAllocations() {
    const overdues = await allocationModel.findOverdueAllocations();
    
    // Create notifications for each overdue allocation
    for (const al of overdues) {
      const userId = al.allocated_to_user_id || al.allocated_by;
      await allocationModel.addNotification({
        userId,
        type: 'ALLOCATION_OVERDUE',
        message: `ALERT: Asset "${al.asset_name}" (${al.asset_tag}) allocation return date (${al.expected_return_date}) is overdue!`,
        relatedEntityType: 'allocations',
        relatedEntityId: al.id
      });
    }

    return overdues;
  }
};

module.exports = allocationService;
