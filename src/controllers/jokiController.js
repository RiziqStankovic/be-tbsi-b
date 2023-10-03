const Report = require('../models/ReportFAP');
const User = require('../models/User');
const FAP = require('../models/FormAnalystPinjol');
const crudService = require('../utils/crudService');
const {
    responseOnly,
    responseAccessDenied,
    responseValidationError,
} = require('../utils/httpResponse');
const {
    validateRequest,
    validationFailed,
    setErrorField,
} = require('../utils/validator');
const Employee = require('../models/Employee');
const { DFLT_FINDBY_VAL } = require('../utils/constants');

const jokiMonitoringWork = async (req, res) => {
    const { branch, id: jokiID } = req.auth;

    const filter = {
        branch: branch.id,
        status: { $in: ['DALAM PENGGARAPAN', 'DISETUJUI'] },
        joki: jokiID,
    };

    const populate = [
        { path: 'validatedBy', select: 'name' },
        { path: 'user', select: 'name' },
        { path: 'joki', select: 'name' },
    ];

    const select = 'user validatedBy joki reportStatus status';

    return await crudService.get(
        req,
        res,
        FAP.modelName,
        populate,
        filter,
        select,
        filter
    );
};

const jokiApproval = async (req, res) => {
    const { id: fapID } = req.params;
    const { id: jokiID } = req.auth;

    let error_field = {};

    try {
        const findFap = await FAP.findById(fapID)
            .select('joki reportStatus.firstReport')
            .lean();

        if (!findFap.joki.equals(jokiID)) {
            return responseAccessDenied(res);
        }

        if (findFap.reportStatus.firstReport !== '1') {
            setErrorField(
                error_field,
                'firstReport',
                'Laporan pertama belum selesai.'
            );
        }
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    if (validationFailed(error_field)) {
        return responseValidationError(res, error_field);
    }

    const payload = { status: 'DALAM PENGGARAPAN' };

    return await crudService.update(res, FAP.modelName, payload, fapID);
};

const sendReport = async (req, res) => {
    const { body } = req;
    const { id: fapID } = req.params;
    const { id: jokiID } = req.auth;

    let error_field = {};

    /* validation */

    try {
        const findFap = await FAP.findById(fapID).select('reportStatus').lean();

        if (findFap.reportStatus.secondReport !== '1') {
            setErrorField(
                error_field,
                'secondReport',
                'Laporan kedua belum selesai.'
            );
        }
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    await validateRequest(
        error_field,
        'user',
        body.user,
        'required;objectid:' + User.modelName
    );

    await validateRequest(
        error_field,
        'fap',
        fapID,
        'required;objectid:' + FAP.modelName
    );

    await validateRequest(
        error_field,
        'progressApps',
        body.progressApps,
        'required;array:notempty',
        null,
        'Laporan Penggarapan'
    );

    let num = 0;
    let idx = 0;
    if (body.progressApps.length > 0) {
        num = 1;
        for (let pApps of body.progressApps) {
            await validateRequest(
                error_field,
                'progressApps.name' + idx,
                pApps.name,
                'required',
                null,
                'Nama aplikasi penggarapan ke ' + num
            );
            await validateRequest(
                error_field,
                'progressApss.revenue' + idx,
                pApps.revenue,
                'required;numeric',
                null,
                'Total pencairan ke ' + num
            );
            await validateRequest(
                error_field,
                'progressApps.desc' + idx,
                pApps.desc,
                'required',
                null,
                'Deskripsi penggarapan ke ' + num
            );

            num++;
            idx++;
        }
    }

    if (validationFailed(error_field)) {
        return responseValidationError(res, error_field);
    }

    const payload = {
        ...body,
        joki: jokiID,
        fap: fapID,
    };

    try {
        await FAP.findByIdAndUpdate(fapID, {
            $set: { status: 'PENGGARAPAN SELESAI' },
        }).lean();
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    return await crudService.save(res, Report.modelName, payload);
};

const getJokiInfo = async (req, res) => {
    const { id } = req.auth;

    const select = 'email branch name photo.url status';

    const populate = [{ path: 'branch', select: 'name' }];

    return await crudService.show(
        res,
        Employee.modelName,
        '_id',
        id,
        populate,
        select
    );
};

const getDetailFap = async (req, res) => {
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

module.exports = {
    jokiMonitoringWork,
    jokiApproval,
    sendReport,
    getJokiInfo,
    getDetailFap,
};
