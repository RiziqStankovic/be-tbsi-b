const User = require('../models/User');
const {
    validateRequest,
    validatePasswordConfirmation,
} = require('../utils/validator');
const { responseValidationError } = require('../utils/httpResponse');
const crudService = require('../utils/crudService');
const { hashPassword } = require('../utils/bcrypt');

const Model = User.modelName;

const createUser = async (req, res) => {
    const { body } = req;

    let errorFields = {};

    await validateRequest(
        errorFields,
        'email',
        body.email,
        `required;email;unique:${Model}:email`
    );
    await validateRequest(
        errorFields,
        'password',
        body.password,
        'required;min=6;onecapital;onenumber;onesymbol'
    );
    validatePasswordConfirmation(
        errorFields,
        body.password,
        body.passwordConfirmation
    );
    await validateRequest(errorFields, 'name', body.name, 'required');
    await validateRequest(errorFields, 'nik', body.nik, 'required');
    await validateRequest(errorFields, 'age', body.age, 'required');
    await validateRequest(errorFields, 'pob', body.pob, 'required');
    await validateRequest(errorFields, 'dob', body.dob, 'required');
    await validateRequest(errorFields, 'location', body.location, 'required');
    await validateRequest(
        errorFields,
        'phoneNumber',
        body.phoneNumber,
        'required'
    );
    await validateRequest(
        errorFields,
        'phoneBrand',
        body.phoneBrand,
        'required'
    );
    await validateRequest(errorFields, 'phoneRam', body.phoneRam, 'required');
    await validateRequest(
        errorFields,
        'simCardStatus',
        body.simCardStatus,
        'required;oneof=MASIH ADA:SUDAH TIDAK ADA'
    );

    await validateRequest(
        errorFields,
        'maintainedApps',
        body.maintainedApps,
        'required;array:notempty'
    );

    let num = 0;
    if (body.maintainedApps.length > 0) {
        num = 0;
        for (let mApps of body.maintainedApps) {
            num++;
            await validateRequest(
                errorFields,
                'maintainedApps.name',
                mApps.name,
                'required',
                'Nama aplikasi rawatan ' + num + ' is rqeuired.'
            );
            await validateRequest(
                errorFields,
                'maintainedApps.totalLimit',
                mApps.totalLimit,
                'required'
            );
            await validateRequest(
                errorFields,
                'maintainedApps.dueDate',
                mApps.dueDate,
                'required;fromnow:before'
            );
            await validateRequest(
                errorFields,
                'maintainedApps.remaining',
                mApps.remaining,
                'required'
            );
        }
    }

    if (body.paymentFailedApps) {
        await validateRequest(
            errorFields,
            'paymentFailedApps',
            body.paymentFailedApps,
            'array'
        );
    }

    if (body.rejectedApps) {
        await validateRequest(
            errorFields,
            'rejectedApps',
            body.rejectedApps,
            'array'
        );
    }

    await validateRequest(
        errorFields,
        'branch',
        body.branch,
        'required;objectid'
    );

    if (Object.keys(errorFields).length > 0) {
        return responseValidationError(res, errorFields);
    }

    const payload = {
        ...body,
        password: hashPassword(body.password),
    };

    return await crudService.save(res, Model, payload);
};

const getUsers = async (req, res) => {
    const populate = 'branch';

    return await crudService.get(req, res, Model, populate);
};

const showUser = async (req, res) => {
    const populate = 'branch';
    return await crudService.show(res, Model, '_id', req.params.id, populate);
};

const updateUser = async (req, res) => {
    return await crudService.update(res, Model, req.body, req, params.id);
};

const removeUser = async (req, res) => {
    return await crudService.remove(res, Model, req.params.id);
};

module.exports = {
    createUser,
    getUsers,
    showUser,
    updateUser,
    removeUser,
};
