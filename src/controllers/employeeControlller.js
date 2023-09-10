const Employee = require('../models/Employee');
const {
    validateRequest,
    validatePasswordConfirmation,
} = require('../utils/validator');
const crudService = require('../utils/crudService');
const { hashPassword } = require('../utils/bcrypt');
const {
    responseValidationError,
    responseOnly,
} = require('../utils/httpResponse');
const path = require('path');
const { uploadImage } = require('../utils/cloudinary');

const ModelEmployee = Employee.modelName;

const createEmployee = async (req, res) => {
    const { body, file } = req;

    const fileExtension = path.extname(file.originalname);

    /* Validation */
    let error_field = {};

    await validateRequest(error_field, 'name', body.name, 'required');
    await validateRequest(
        error_field,
        'email',
        body.email,
        `required;email;unique:${ModelEmployee}:email`
    );
    await validateRequest(
        error_field,
        'password',
        body.password,
        'required;min=6;onecapital;onenumber;onesymbol'
    );
    validatePasswordConfirmation(
        error_field,
        body.password,
        body.passwordConfirmation
    );
    await validateRequest(
        error_field,
        'photo',
        fileExtension,
        'required;oneof=.jpg:.png:.jpeg',
        'Ekstensi photo harus salah satu dari : jpg, png, jpeg'
    );
    await validateRequest(error_field, 'role', body.role, 'required;objectid');
    await validateRequest(
        error_field,
        'branch',
        body.branch,
        'required;objectid'
    );

    if (Object.keys(error_field).length > 0) {
        return responseValidationError(res, error_field);
    }

    const photoUrl = await uploadImage(file.buffer);

    const payload = {
        ...body,
        password: hashPassword(body.password),
        photo: photoUrl,
    };

    // return responseOnly(res, 200, 'Sip');
    return await crudService.save(res, ModelEmployee, payload);
};

const getEmployees = async (req, res) => {
    let populate = ['branch', 'role'];

    return await crudService.get(req, res, ModelEmployee, populate);
};

const showEmploye = async (req, res) => {
    let populate = ['branch', 'role'];
    return await crudService.show(
        res,
        ModelEmployee,
        '_id',
        req.params.id,
        populate
    );
};

const updateEmployee = async (req, res) => {
    return await crudService.update(
        res,
        ModelEmployee,
        req.body,
        req.params.id
    );
};

const removeEmployee = async (req, res) => {
    return await crudService.remove(res, ModelEmployee, req.params.id);
};

module.exports = {
    createEmployee,
    getEmployees,
    showEmploye,
    removeEmployee,
    updateEmployee,
};
