const Branch = require('../models/Branch');
const { validateRequest } = require('../utils/validator');
const crudService = require('../utils/crudService');
const { responseValidationError } = require('../utils/httpResponse');

const Model = Branch.modelName;

const createBranch = async (req, res) => {
    const { body } = req;

    let error_field = {};

    await validateRequest(error_field, 'name', body.name, 'required');

    if (Object.keys(error_field).length > 0) {
        return responseValidationError(res, error_field);
    }

    return await crudService.save(res, Model, body);
};

const getBranches = async (req, res) => {
    return await crudService.get(req, res, Model, null);
};

const showBranch = async (req, res) => {
    return await crudService.show(res, Model, '_id', req.params.id);
};

const updateBranch = async (req, res) => {
    return await crudService.update(res, Model, req.body, req.params.id);
};

const removeBranch = async (req, res) => {
    return await crudService.remove(res, Model, req.params.id);
};

module.exports = {
    createBranch,
    getBranches,
    showBranch,
    updateBranch,
    removeBranch,
};
