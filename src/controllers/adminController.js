const Employee = require('../models/Employee');
const User = require('../models/User');
const FAP = require('../models/FormAnalystPinjol');
const crudService = require('../utils/crudService');
const {
    responseOnly,
    responseAccessDenied,
    responseValidationError,
} = require('../utils/httpResponse');
const Branch = require('../models/Branch');
const { validateRequest } = require('../utils/validator');

const monitorFAP = async (req, res) => {
    const { branch } = req.auth;

    /* Jika tidak memiliki branch */
    if (!branch) {
        return responseAccessDenied(res);
    }

    let filter;
    let populate = [
        { path: 'joki', select: 'name' },
        { path: 'validatedBy', select: 'name' },
        { path: 'user', select: 'name age nik location phoneNumber' },
        { path: 'branch', select: 'name' },
    ];

    if (branch.name !== 'Mampang') {
        filter = { branch: branch.id };
    } else {
        filter = { branch: { $in: [branch.id, null] } };
    }

    console.log(filter);

    return await crudService.get(req, res, FAP.modelName, populate, filter);
};

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

            console.log(checkJoki);
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
    const { branch } = req.auth;

    let error_field = {};

    await validateRequest(
        error_field,
        'action',
        action,
        'required;oneof=DELEGATE:APPROVAL'
    );

    if (action === 'DELEGATE') {
        await validateRequest(
            error_field,
            'destBranch',
            destBranch,
            `required;objectid:${Branch.modelName}`,
            'Field Tujuan cabang harus diisi.'
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
            'required;oneof=DISETUJUI:DITOLAK'
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
            const payloadApproval = { status, joki };
            return await crudService.update(
                res,
                FAP.modelName,
                payloadApproval,
                FAP_ID
            );
        default:
            return responseOnly(res, 400, 'Action is invalid.');
    }
};

module.exports = {
    monitorFAP,
    adminApproval,
    respondFAP,
};
