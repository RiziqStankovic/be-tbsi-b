/* Form Analyst Pinjol */
const FAP = require('../models/FormAnalystPinjol');
const { responseValidationError } = require('../utils/httpResponse');
const crudService = require('../utils/crudService');

const createFAP = async (req, res) => {
    const { body } = req;

    let errorFields = {};

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

    const payload = {
        ...body,
    };

    return await crudService.save(res, FAP.modelName, payload);
};

const getFAPs = async (req, res) => {
    const populate = ['branch', 'joki', 'validatedBy'];

    return await crudService.get(req, res, FAP.modelName, populate);
};

const showFAP = async (req, res) => {
    const populate = ['branch', 'joki', 'validatedBy'];

    return await crudService.show(
        res,
        FAP.modelName,
        '_id',
        req.params.id,
        populate
    );
};

const updateFAP = async (req, res) => {
    return await crudService.update(
        res,
        FAP.modelName,
        req.body,
        req.params.id
    );
};

const removeFAP = async (req, res) => {
    return await crudService.remove(res, FAP.modelName, req.params.id);
};

module.exports = {
    createFAP,
    getFAPs,
    showFAP,
    updateFAP,
    removeFAP,
};
