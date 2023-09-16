const Report = require('../models/Report');
const User = require('../models/User');
const crudService = require('../utils/crudService');
const { responseOnly } = require('../utils/httpResponse');
const { validateRequest } = require('../utils/validator');

const jokiMonitoringWork = async (req, res) => {
    const { branchID } = req.auth;

    const filter = {
        branch: branchID,
        status: 'DISETUJUI',
    };

    const populate = ['branch', 'role'];

    return await crudService.get(req, res, User.modelName, populate, filter);
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
    const { progressApps } = req.body;
    const { id: userID } = req.params;

    let error_fields = {};

    await validateRequest(error_fields, 'userID', userID, 'required;objectid');

    await validateRequest(
        error_fields,
        'progressApps',
        progressApps,
        'required;array;notempty'
    );

    let num = 0;
    let idx = 0;

    if (Array.isArray(progressApps) && progressApps.length > 0) {
        num = 1;
        for (let pApps of progressApps) {
            await validateRequest(
                error_fields,
                'progressApps.name' + idx,
                pApps.name,
                'required',
                'Nama aplikasi wajib diisi.'
            );

            await validateRequest(
                error_fields,
                'progressApps.status' + idx,
                pApps.status,
                'required;oneof=BERHASIL CAIR:GAGAL CAIR',
                'Status aplikasi wajib diisi.'
            );

            await validateRequest(
                error_fields,
                'progressApps.revenue',
                pApps.revenue,
                'required;numeric;min=0'
            );

            num++;
            idx++;
        }
    }

    const finduser = await User.findById(userID).lean();
    if (!finduser) {
        return responseOnly(res, 400, 'User not found.');
    }

    const payload = {
        userID,
        progressApps,
    };

    return await crudService.save(res, Report.modelName, payload);
};

module.exports = {
    jokiMonitoringWork,
    jokiApproval,
    sendReport,
};
