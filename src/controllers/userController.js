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

    if (!body.recommendation || Object.keys(body.recommendation).length === 0) {
        await validateRequest(
            errorFields,
            'recommendation',
            body.recommendation.person,
            'required',
            'Rekomendasi harus diisi.'
        );
    }

    if (Object.keys(body.recommendation).length > 0) {
        if ('person' in body.recommendation) {
            await validateRequest(
                errorFields,
                'recommendation',
                body.recommendation.person,
                'required',
                'Rekomendasi dari perorangan tidak boleh kosong.'
            );
        } else if ('socialMedia' in body.recommendation) {
            await validateRequest(
                errorFields,
                'recommendation',
                body.recommendation.socialMedia,
                'required',
                'Rekomendasi dari sosial media tidak boleh kosong'
            );
        }
    }

    await validateRequest(
        errorFields,
        'maintainedApps',
        body.maintainedApps,
        'required;array:notempty'
    );

    let num = 0;
    let idx = 0;
    if (body.maintainedApps.length > 0) {
        num = 1;
        for (let mApps of body.maintainedApps) {
            await validateRequest(
                errorFields,
                'maintainedApps.name' + idx,
                mApps.name,
                'required',
                'Nama aplikasi rawatan ke ' + num + ' wajib diisi.'
            );
            await validateRequest(
                errorFields,
                'maintainedApps.totalLimit' + idx,
                mApps.totalLimit,
                'required',
                'Total limit aplikasi rawatan ke ' + num + ' wajib diisi.'
            );

            await validateRequest(
                errorFields,
                'maintainedApps.totalLimit' + idx,
                mApps.totalLimit,
                'numeric',
                'Total limit aplikasi rawatan ke ' +
                    num +
                    ' harus berupa angka numeric.'
            );
            await validateRequest(
                errorFields,
                'maintainedApps.dueDate' + idx,
                mApps.dueDate,
                'required',
                'Tanggal jatuh tempo aplikasi rawatan ke ' +
                    num +
                    ' harus diisi.'
            );
            await validateRequest(
                errorFields,
                'maintainedApps.remaining' + idx,
                mApps.remainingInstallment,
                'required',
                'Sisa angsuran aplikasi rawatan ke ' + num + ' harus diisi.'
            );

            num++;
            idx++;
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
