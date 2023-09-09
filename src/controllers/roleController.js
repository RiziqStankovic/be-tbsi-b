const Role = require('../models/Role');
const { validateRequest } = require('../utils/validator');
const { responseValidationError } = require('../utils/httpResponse');
const crudService = require('../utils/crudService');

const Model = Role.modelName;

const createRole = async (req, res) => {
    const { body } = req;

    let error_fields = {};

    await validateRequest(
        error_fields,
        'name',
        body.name,
        `required;unique:${Model}:name`
    );

    if (Object.keys(error_fields).length > 0) {
        return responseValidationError(res, error_fields);
    }

    return await crudService.save(res, Model, body);
};

const getRoles = async (req, res) => {
    return await crudService.get(req, res, Model);
};

const showRole = async (req, res) => {
    return await crudService.show(res, Model, '_id', req.params.id);
};

const updateRole = async (req, res) => {
    return await crudService.update(res, Model, req.body, req.params.id);
};

const removeRole = async (req, res) => {
    return await crudService.remove(res, Model, req.params.id);
};

module.exports = {
    createRole,
    getRoles,
    showRole,
    updateRole,
    removeRole,
};
