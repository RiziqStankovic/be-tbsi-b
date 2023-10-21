/* Form Analyst Pinjol */
const FAP = require('../models/FormAnalystPinjol');
const {
    responseValidationError,
    responseOnly,
    responseData,
    responseAccessDenied,
} = require('../utils/httpResponse');
const crudService = require('../utils/crudService');
const { validateRequest } = require('../utils/validator');
const pupeteer = require('puppeteer');
const ReportFAP = require('../models/ReportFAP');
const { SKPP_HTML_CONTENT, BARCD_FLD_NAME } = require('../utils/constants');
const { toLocalNumeric, toLocal } = require('../utils/dateUtil');
const bwipjs = require('bwip-js');
const { uploadImage } = require('../utils/cloudinary');

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
        const fap = await FAP.findOne({ user: userID }).select('status').lean();

        if (fap.status !== 'PENGGARAPAN SELESAI') {
            return responseAccessDenied(res);
        }

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
        skppHtml = skppHtml.replace('[NAMA_NASABAH]', getReportFap.user.name);
        skppHtml = skppHtml.replace('[POB]', getReportFap.user.pob);
        skppHtml = skppHtml.replace(
            '[DOB]',
            toLocalNumeric(getReportFap.user.dob)
        );
        skppHtml = skppHtml.replace('[NIK]', getReportFap.user.nik);
        skppHtml = skppHtml.replace('[LOCATION]', getReportFap.user.location);
        const currDate = new Date();
        skppHtml = skppHtml.replace('[TANGGAL]', toLocal(currDate));

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

        let qrCodeData =
            getReportFap.user.name +
            '\nNasabah Malahayati ke ' +
            getReportFap.user.serialNo +
            '\nAplikasi Garapan : \n' +
            progressAppArr.join('\n');
        const qrCodeImage = await new Promise((resolve, reject) => {
            bwipjs.toBuffer(
                {
                    bcid: 'qrcode',
                    text: qrCodeData,
                    scale: 3,
                    height: 10,
                    includetext: true,
                    textxalign: 'center',
                },
                (err, buffer) => {
                    if (err) reject(err);
                    else resolve(buffer);
                }
            );
        });

        skppHtml = skppHtml.replace(
            '[BARCODE]',
            qrCodeImage.toString('base64')
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

const uploadQrCode = async (req, res) => {
    try {
        const { file } = req;
        const { id } = req.auth;

        const findfap = await FAP.findOne({ user: id }).select('barcodeInfo');
        if (!findfap.barcodeInfo.isGenerated) {
            const uplQrCode = await uploadImage(file.buffer, BARCD_FLD_NAME);
            findfap.barcodeInfo.isGenerated = true;
            findfap.barcodeInfo.public_id = uplQrCode.public_id;
            findfap.barcodeInfo.url = uplQrCode.secure_url;
            await FAP.updateOne({ user: id }, findfap);
        }

        return responseData(res, 200, null, 'Upload qr code success.');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

const getReportFap = async (req, res) => {
    const { id: fapID } = req.params;
    const { role } = req.auth;

    let findfap;

    try {
        findfap = await FAP.findById(fapID).select('status').lean();
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    const populate = [{ path: 'joki', select: 'name' }];
    const select = 'progressApps joki user createdAt';

    if (findfap.status === 'PENGGARAPAN SELESAI') {
        try {
            const findReport = await ReportFAP.findOne({ fap: fapID })
                .populate(populate)
                .select(select)
                .lean();

            let respData = {};
            let tempProgressArr = [];
            let tempProgress = {};
            let tempRevenue = [];

            for (const pr of findReport.progressApps) {
                tempProgress = {
                    ...pr,
                    revenue: role.name === 'Superadmin' ? pr.revenue : 0,
                };
                tempProgressArr.push(tempProgress);
                tempRevenue.push(tempProgress.revenue);
            }

            const totalRevenue = tempRevenue.reduce(
                (total, item) => total + item,
                0
            );

            respData = {
                ...findReport,
                progressApps: tempProgressArr,
                totalRevenue,
            };

            return responseData(res, 200, respData, 'Data found.');
        } catch (error) {
            console.log(error);
            return responseOnly(res, 500);
        }
    }

    return responseData(res, 204, [], 'No content');
};

module.exports = {
    createFAP,
    generateSkpp,
    getReportFap,
    uploadQrCode,
};
