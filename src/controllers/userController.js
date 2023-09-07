const User = require('../models/User');
const {
    validateRequest,
    validatePasswordConfirmation,
} = require('../utils/validator');

const Model = User.modelName;

const createAccount = async (req, res) => {
    const { body } = req.body;

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
        'required;min=6'
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

    if (Array.isArray(body.maintainedApps) && body.maintainedApps.length > 0) {
        for (let mApps of body.maintainedApps) {
            await validateRequest(
                errorFields,
                'maintainedApps.name',
                mApps.name,
                'required'
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
};
