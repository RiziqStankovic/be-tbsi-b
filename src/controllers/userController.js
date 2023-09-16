const User = require('../models/User');
const {
    validateRequest,
    validatePasswordConfirmation,
} = require('../utils/validator');
const {
    responseValidationError,
    responseOnly,
    responseAuth,
} = require('../utils/httpResponse');
const crudService = require('../utils/crudService');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const generateSerialNo = require('../utils/generateSerialNo');
const { generateToken } = require('../utils/jwt');

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
    await validateRequest(
        errorFields,
        'nik',
        body.nik,
        'required;min=16;max=16'
    );
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

    if (Object.keys(errorFields).length > 0) {
        return responseValidationError(res, errorFields);
    }

    const serialNo = await generateSerialNo();

    const payload = {
        ...body,
        password: hashPassword(body.password),
        serialNo,
    };

    return await crudService.save(res, Model, payload);
    // return responseOnly(res, 200, 'Sip');
};

const getUsers = async (req, res) => {
    return await crudService.get(req, res, Model);
};

const showUser = async (req, res) => {
    return await crudService.show(res, Model, '_id', req.params.id);
};

const updateUser = async (req, res) => {
    return await crudService.update(res, Model, req.body, req, params.id);
};

const removeUser = async (req, res) => {
    return await crudService.remove(res, Model, req.params.id);
};

const authenticateUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).lean();
        if (!user) {
            return responseOnly(res, 400, 'Email salah.');
        }

        if (!comparePassword(password, user.password)) {
            return responseOnly(res, 400, 'Password salah.');
        }

        const payload = {
            id: user._id,
        };

        const token = generateToken(payload);

        return responseAuth(res, token);
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

module.exports = {
    createUser,
    getUsers,
    showUser,
    updateUser,
    removeUser,
    authenticateUser,
};
