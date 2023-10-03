const Employee = require('../models/Employee');
const User = require('../models/User');
const FAP = require('../models/FormAnalystPinjol');
const crudService = require('../utils/crudService');
const {
    responseOnly,
    responseAccessDenied,
    responseValidationError,
    responseData,
} = require('../utils/httpResponse');
const Branch = require('../models/Branch');
const {
    validateRequest,
    validationFailed,
    setErrorField,
} = require('../utils/validator');
const { DFLT_FINDBY_VAL, EMP_FLD_NAME } = require('../utils/constants');
const Role = require('../models/Role');
const path = require('path');
const { uploadImage } = require('../utils/cloudinary');

const monitorFAP = async (req, res) => {
    const { branch } = req.auth;

    let resp;

    /* Jika tidak memiliki branch */
    if (!branch) {
        return responseAccessDenied(res);
    }

    let filter;
    let countFilter = null;
    let populate = [{ path: 'user', select: 'name' }];

    let select = 'status createdAt';

    if (branch.name !== 'Mampang') {
        filter = { branch: branch.id };
        countFilter = { ...filter };
    } else {
        filter = { branch: { $in: [branch.id, null] } };
    }

    return await crudService.get(
        req,
        res,
        FAP.modelName,
        populate,
        filter,
        select,
        countFilter
    );
};

const detailFAP = async (req, res) => {
    const populate = [
        { path: 'user', select: 'nik name age location phoneNumber' },
    ];

    const select =
        'phoneBrand phoneRam recommendation maintainedApps paymentFailedApps rejectedApps status reportStatus';

    return await crudService.show(
        res,
        FAP.modelName,
        DFLT_FINDBY_VAL,
        req.params.id,
        populate,
        select
    );
};

/* 
! DEPRECATED
*/
const adminApproval = async (req, res) => {
    const { status, joki } = req.body;
    const { id: userID } = req.params;
    const { id: adminID } = req.auth;

    let adminBranch;
    let userBranch;

    try {
        userBranch = await User.findById(userID).select('branch joki').lean();
        adminBranch = await Employee.findById(adminID).select('branch').lean();

        if (!userBranch.branch.equals(adminBranch.branch)) {
            return responseOnly(res, 403, 'Access denied.');
        }
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    const statusEnum = ['DISETUJUI', 'DITOLAK'];

    if (!status || !statusEnum.includes(status)) {
        return responseOnly(res, 400, 'Invalid status value.');
    }

    let payload = {
        status,
        validatedBy: adminID,
    };

    if (status === 'DISETUJUI') {
        if (!joki) {
            return responseOnly(res, 400, 'Harap memilih Joki sesuai cabang.');
        }

        let checkJoki;

        try {
            checkJoki = await Employee.findById(joki)
                .select('role branch')
                .populate('role branch')
                .lean();
        } catch (error) {
            console.log(error);
            return responseOnly(res, 500);
        }

        if (!checkJoki) {
            return responseOnly(res, 404, 'Joki not found.');
        }

        if (checkJoki.role.name !== 'Joki') {
            return responseOnly(res, 403, 'Access denied.');
        }

        if (
            !checkJoki.branch._id.equals(adminBranch.branch) ||
            !checkJoki.branch._id.equals(userBranch.branch)
        ) {
            return responseOnly(res, 403, 'Access denied.');
        }

        payload.joki = joki;
    }

    return await crudService.update(res, User.modelName, payload, userID);
};

const respondFAP = async (req, res) => {
    const { action, destBranch, status, joki } = req.body;
    const { id: FAP_ID } = req.params;
    const { branch, id: adminID } = req.auth;

    let error_field = {};

    await validateRequest(
        error_field,
        'action',
        action,
        'required;oneof=DELEGATE:APPROVAL:REJECTION'
    );

    if (action === 'DELEGATE') {
        await validateRequest(
            error_field,
            'destBranch',
            destBranch,
            `required;objectid:${Branch.modelName}`,
            null,
            'Cabang'
        );
    } else if (action === 'APPROVAL') {
        await validateRequest(
            error_field,
            'joki',
            joki,
            `required;objectid:${Employee.modelName}`
        );
        await validateRequest(
            error_field,
            'status',
            status,
            'required;oneof=DISETUJUI'
        );
    } else if (action === 'REJECTION') {
        await validateRequest(
            error_field,
            'status',
            status,
            'required;oneof=DITOLAK'
        );
    }

    if (Object.keys(error_field).length > 0) {
        return responseValidationError(res, error_field);
    }

    switch (action) {
        case 'DELEGATE':
            if (branch.name !== 'Mampang') {
                return responseAccessDenied(res);
            }

            const payloadDelegate = { branch: destBranch };
            return await crudService.update(
                res,
                FAP.modelName,
                payloadDelegate,
                FAP_ID
            );
        case 'APPROVAL':
            const payloadApproval = {
                status,
                joki,
                branch: branch.id,
                validatedBy: adminID,
            };
            return await crudService.update(
                res,
                FAP.modelName,
                payloadApproval,
                FAP_ID
            );
        case 'REJECTION':
            const payloadRejection = {
                status,
                validatedBy: adminID,
            };
            return await crudService.update(
                res,
                FAP.modelName,
                payloadRejection,
                FAP_ID
            );
        default:
            return responseOnly(res, 400, 'Action is invalid.');
    }
};

const updateReportStatus = async (req, res) => {
    const { id } = req.params;
    const { firstReport, secondReport } = req.body;

    let error_fields = {};
    let findFap = null;

    try {
        findFap = await FAP.findById(id).select('status').lean();
    } catch (error) {
        return responseOnly(res, 500);
    }

    let payload = {
        reportStatus: {},
    };
    if (firstReport === '1') {
        if (findFap.status !== 'DISETUJUI') {
            setErrorField(
                error_fields,
                'reportStatus',
                'Data nasabah belum disetujui.'
            );
        } else {
            payload.reportStatus.firstReport = '1';
        }
    } else if (secondReport === '1') {
        if (findFap.status !== 'DALAM PENGGARAPAN') {
            setErrorField(
                error_fields,
                'reportStatus',
                'Data nasabah belum dilakukan penggarapan.'
            );
        } else {
            payload.reportStatus.secondReport = '1';
        }
    } else {
        await validateRequest(
            error_fields,
            'reportStatus',
            firstReport,
            'required',
            null,
            'Status Laporan Pertama / Kedua'
        );
    }

    if (validationFailed(error_fields)) {
        return responseValidationError(res, error_fields);
    }

    return await crudService.update(res, FAP.modelName, payload, id);
};

const getAdminInfo = async (req, res) => {
    const select = 'name photo.url status email';
    const populate = [
        { path: 'role', select: 'name' },
        { path: 'branch', select: 'name' },
    ];

    return await crudService.show(
        res,
        Employee.modelName,
        DFLT_FINDBY_VAL,
        req.auth.id,
        populate,
        select
    );
};

const getDestBranches = async (req, res) => {
    const filter = { name: { $ne: 'Mampang' } };

    const select = 'name';

    return await crudService.get(
        req,
        res,
        Branch.modelName,
        null,
        filter,
        select
    );
};

const getJoki = async (req, res) => {
    try {
        const { branch } = req.auth;
        const jokiRole = await Role.findOne({ name: 'Joki' })
            .select('name')
            .lean();

        const populate = [{ path: 'role', select: 'name' }];

        const filter = { role: jokiRole._id, branch: branch.id };

        const select = 'name status photo.url';

        const joki = await Employee.find(filter)
            .select(select)
            .populate(populate)
            .lean();
        let payload = [];

        for (let j of joki) {
            const countTasks = await FAP.countDocuments({
                status: { $in: ['DISETUJUI', 'DALAM PENGGARAPAN'] },
                joki: j._id,
            });
            payload.push({ ...j, countTasks });
        }

        return responseData(res, 200, payload, 'Get all joki success');
    } catch (error) {
        return responseOnly(res, 500);
    }
};

const createJoki = async (req, res) => {
    const { body, file } = req;
    const { branch } = req.auth;

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
        'email',
        body.email,
        `required;email;unique:${User.modelName}:email`
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

    if (Object.keys(error_field).length > 0) {
        return responseValidationError(res, error_field);
    }

    const photo = await uploadImage(file.buffer, EMP_FLD_NAME);

    let role;

    try {
        role = await Role.findOne({ name: 'Joki' }).select('name').lean();
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    const payload = {
        ...body,
        password: hashPassword(body.password),
        photo: {
            url: photo.secure_url,
            public_id: photo.public_id,
        },
        branch: branch.id,
        role,
    };

    // return responseOnly(res, 200, 'Sip');
    return await crudService.save(res, Employee.modelName, payload);
};

module.exports = {
    monitorFAP,
    adminApproval,
    respondFAP,
    detailFAP,
    getAdminInfo,
    getDestBranches,
    getJoki,
    updateReportStatus,
    createJoki,
};
