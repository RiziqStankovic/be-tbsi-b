/* Form Analyst Pinjol */
const FAP = require('../models/FormAnalystPinjol');
const {
    responseValidationError,
    responseOnly,
} = require('../utils/httpResponse');
const crudService = require('../utils/crudService');
const { validateRequest, validationFailed } = require('../utils/validator');
const fs = require('fs');
const htmlToPdf = require('html-pdf');
const path = require('path');
const pupeteer = require('puppeteer');
const User = require('../models/User');
const ReportFAP = require('../models/ReportFAP');
const { SKPP_HTML_CONTENT } = require('../utils/constants');
const { toLocalNumeric } = require('../utils/dateUtil');

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

    if (Object.keys(errorFields).length > 0) {
        return responseValidationError(res, errorFields);
    }

    const payload = {
        ...body,
        user: req.auth.id,
    };

    return await crudService.save(res, FAP.modelName, payload);
};

const generateSkpp = async (req, res) => {
    const { id: userID } = req.auth;

    try {
        const populate = [
            { path: 'user', select: 'serialNo name pob dob nik location' },
        ];

        const select = 'user progressApps';

        const getReportFap = await ReportFAP.findOne({ user: userID })
            .populate(populate)
            .select(select)
            .lean();

        let skppHtml = SKPP_HTML_CONTENT;

        const toSnakeCase = getReportFap.user.name.replace(/\s/g, '_');
        skppHtml = skppHtml.replace('[TITLE]', 'SKPP_' + toSnakeCase);
        skppHtml = skppHtml.replace('[SERIAL_NO]', getReportFap.user.serialNo);
        skppHtml = skppHtml.replace('[NAMA_NASABAH]', getReportFap.user.name);
        skppHtml = skppHtml.replace('[POB]', getReportFap.user.pob);
        skppHtml = skppHtml.replace(
            '[DOB]',
            toLocalNumeric(getReportFap.user.dob)
        );
        skppHtml = skppHtml.replace('[NIK]', getReportFap.user.nik);
        skppHtml = skppHtml.replace('[LOCATION]', getReportFap.user.location);

        let progressAppArr = [];

        let num = 1;
        for (let pApps of getReportFap.progressApps) {
            let result = num + '. ' + pApps.name;
            progressAppArr.push(result);
            num++;
        }

        skppHtml = skppHtml.replace(
            '[PROGRESS_APP_DONE]',
            progressAppArr.join(' ')
        );

        /* Generate the pdf using pupeteer */

        const browser = await pupeteer.launch();
        const page = await browser.newPage();
        await page.setContent(skppHtml, { waitUntil: 'networkidle0' });
        const pdfData = await page.pdf({ format: 'A4' });
        await browser.close();
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition':
                'attachment; filename=SKPP_' + toSnakeCase + '.pdf',
        });
        res.send(pdfData);
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
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
    generateSkpp,
};
