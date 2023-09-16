const Report = require('../models/Report');
const User = require('../models/User');
const FAP = require('../models/FormAnalystPinjol');
const crudService = require('../utils/crudService');
const { responseOnly } = require('../utils/httpResponse');
const { validateRequest } = require('../utils/validator');

const jokiMonitoringWork = async (req, res) => {
    const { branch, id: jokiID } = req.auth;

    const filter = {
        branch: branch.id,
        status: 'DISETUJUI',
        joki: jokiID,
    };

    const populate = [
        { path: 'branch', select: 'name' },
        { path: 'joki', select: 'name' },
        { path: 'validatedBy', select: 'name' },
    ];

    return await crudService.get(req, res, FAP.modelName, populate, filter);
};

const processFAP = async (req, res) => {
    const payload = { status: 'DALAM PENGGARAPAN' };
    return await crudService.update(res, FAP.modelName, payload, req.params.id);
};

const jokiApproval = async (req, res) => {
    const { status, joki } = req.body;
    const { id: userID } = req.params;
    const { id: jokiID } = req.auth;

    if (!status || status === '' || !joki || joki === '') {
        return responseOnly(res, 400, 'Invalid request body.');
    }

    if (joki !== jokiID) {
        return responseOnly(res, 403, 'Access denied.');
    }

    if (status !== 'PENGGARAPAN BERHASIL' || status !== 'PENGGARAPAN GAGAL') {
        return responseOnly(res, 400, 'Invalid status value.');
    }

    const payload = { status };

    return await crudService.update(res, User.modelName, payload, userID);
};

const sendReport = async (req, res) => {
    const { status, appName, appDesc } = req.body;
    const { id: FAP_ID } = req.params;

    let error_field = {};

    await validateRequest(
        error_field,
        'fap_id',
        FAP_ID,
        `required;objectid:${FAP}`
    );

    await validateRequest(
        error_field,
        'status',
        status,
        'required;oneof=PENGGARAPAN BERHASIL:PENGGARAPAN GAGAL'
    );

    if (status === 'PENGGARAPAN BERHASIL' || status === 'PENGGARAPAN GAGAL') {
        await validateRequest(
            error_field,
            'appName',
            appName,
            'required',
            'Field Nama aplikasi yang digarap harus diisi.'
        );

        await validateRequest(
            error_field,
            'appDesc',
            appDesc,
            'required',
            'Field Deskripsi penggarapan aplikasi harus diisi.'
        );
    }

    return await crudService.save();
};

module.exports = {
    jokiMonitoringWork,
    jokiApproval,
    sendReport,
};
