const assetModel = require('../models/assetModel');
const categoryModel = require('../models/categoryModel');
const departmentModel = require('../models/departmentModel');

const assetService = {
  async createAsset({
    name,
    categoryId,
    serialNumber,
    qrCode,
    acquisitionDate,
    acquisitionCost,
    condition,
    location,
    departmentId,
    isBookable
  }) {
    // 1. Verify Category exists
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      const err = new Error(`Category ID ${categoryId} does not exist.`);
      err.status = 400;
      throw err;
    }

    // 2. Verify Department exists (if provided)
    if (departmentId) {
      const dept = await departmentModel.findById(departmentId);
      if (!dept) {
        const err = new Error(`Department ID ${departmentId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    // 3. Verify duplicate QR Code
    if (qrCode) {
      const qrExists = await assetModel.checkQrCodeExists(qrCode);
      if (qrExists) {
        const err = new Error(`QR Code "${qrCode}" is already registered.`);
        err.status = 400;
        throw err;
      }
    }

    // 4. Auto-generate sequential Asset Tag
    const nextNum = await assetModel.getNextTagNumber();
    const assetTag = `AF-${String(nextNum).padStart(4, '0')}`;

    // 5. Create Asset
    return await assetModel.create({
      assetTag,
      name: name.trim(),
      categoryId: parseInt(categoryId, 10),
      serialNumber: serialNumber ? serialNumber.trim() : null,
      qrCode: qrCode ? qrCode.trim() : null,
      acquisitionDate: acquisitionDate || null,
      acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : null,
      condition: condition || 'GOOD',
      location: location ? location.trim() : null,
      departmentId: departmentId ? parseInt(departmentId, 10) : null,
      status: 'AVAILABLE',
      isBookable: isBookable ? parseInt(isBookable, 10) : 0
    });
  },

  async getAssets() {
    return await assetModel.findAll();
  },

  async getAssetById(id) {
    const asset = await assetModel.findById(id);
    if (!asset) {
      const err = new Error(`Asset with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    // Fetch documents, allocations history, maintenance history
    const documents = await assetModel.getDocuments(id);
    const allocations = await assetModel.getAllocationHistory(id);
    const maintenance = await assetModel.getMaintenanceHistory(id);

    return {
      ...asset,
      documents,
      allocations,
      maintenance
    };
  },

  async updateAsset(id, {
    name,
    categoryId,
    serialNumber,
    qrCode,
    acquisitionDate,
    acquisitionCost,
    condition,
    location,
    departmentId,
    status,
    isBookable
  }) {
    // Verify asset exists
    const asset = await assetModel.findById(id);
    if (!asset) {
      const err = new Error(`Asset with ID ${id} not found.`);
      err.status = 404;
      throw err;
    }

    // Verify Category exists
    const category = await categoryModel.findById(categoryId);
    if (!category) {
      const err = new Error(`Category ID ${categoryId} does not exist.`);
      err.status = 400;
      throw err;
    }

    // Verify Department exists (if provided)
    if (departmentId) {
      const dept = await departmentModel.findById(departmentId);
      if (!dept) {
        const err = new Error(`Department ID ${departmentId} does not exist.`);
        err.status = 400;
        throw err;
      }
    }

    // Verify duplicate QR Code
    if (qrCode) {
      const qrExists = await assetModel.checkQrCodeExists(qrCode, id);
      if (qrExists) {
        const err = new Error(`QR Code "${qrCode}" is already taken.`);
        err.status = 400;
        throw err;
      }
    }

    return await assetModel.update(id, {
      name: name.trim(),
      categoryId: parseInt(categoryId, 10),
      serialNumber: serialNumber ? serialNumber.trim() : null,
      qrCode: qrCode ? qrCode.trim() : null,
      acquisitionDate: acquisitionDate || null,
      acquisitionCost: acquisitionCost ? parseFloat(acquisitionCost) : null,
      condition,
      location: location ? location.trim() : null,
      departmentId: departmentId ? parseInt(departmentId, 10) : null,
      status: status || asset.status,
      isBookable: isBookable ? parseInt(isBookable, 10) : 0
    });
  },

  async uploadDocument(assetId, { filePath, fileType, uploadedBy }) {
    const asset = await assetModel.findById(assetId);
    if (!asset) {
      const err = new Error(`Asset with ID ${assetId} not found.`);
      err.status = 404;
      throw err;
    }

    return await assetModel.addDocument({
      assetId,
      filePath,
      fileType,
      uploadedBy
    });
  }
};

module.exports = assetService;
