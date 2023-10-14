const User = require('../models/User');
const Employee = require('../models/Employee');
const {
    validateRequest,
    validatePasswordConfirmation,
} = require('../utils/validator');
const {
    responseValidationError,
    responseOnly,
    responseAuth,
    responseData,
} = require('../utils/httpResponse');
const crudService = require('../utils/crudService');
const { hashPassword } = require('../utils/bcrypt');
const generateSerialNo = require('../utils/generateSerialNo');
const ReportFAP = require('../models/ReportFAP');
const FormAnalystPinjol = require('../models/FormAnalystPinjol');

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
        'email',
        body.email,
        `required;email;unique:${Employee.modelName}:email`
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
    await validateRequest(errorFields, 'Nama', body.name, 'required');
    await validateRequest(
        errorFields,
        'nik',
        body.nik,
        'required;min=16;max=16'
    );
    await validateRequest(errorFields, 'Usia', body.age, 'required');
    await validateRequest(errorFields, 'Tempat lahir', body.pob, 'required');
    await validateRequest(errorFields, 'Tanggal lahir', body.dob, 'required');
    await validateRequest(
        errorFields,
        'Alamat rumah saat ini',
        body.location,
        'required'
    );
    await validateRequest(
        errorFields,
        'Nomor Hp pengajuan',
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

const getReport = async (req, res) => {
    try {
        const { id } = req.auth;

        let resp = {};

        const report = await ReportFAP.findOne({ user: id })
            .select('progressApps')
            .lean();

        resp.report = report;

        const totalRevenue = report.progressApps.reduce((acc, app) => {
            return acc + app.revenue;
        }, 0);

        resp.totalRevenue = totalRevenue;

        const findFap = await FormAnalystPinjol.findOne({ user: id })
            .select('barcodeInfo')
            .lean();

        resp.barcodeInfo = findFap.barcodeInfo;

        const user = await User.findById(id).select('name serialNo').lean();

        resp.user = user;

        return responseData(res, 200, resp, 'Get report success');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

module.exports = {
    createUser,
    getReport,
};
