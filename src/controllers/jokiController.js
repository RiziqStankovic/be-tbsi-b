const Report = require('../models/ReportFAP');
const User = require('../models/User');
const FAP = require('../models/FormAnalystPinjol');
const crudService = require('../utils/crudService');
const {
    responseOnly,
    responseAccessDenied,
    responseValidationError,
    responseData,
} = require('../utils/httpResponse');
const {
    validateRequest,
    validationFailed,
    setErrorField,
} = require('../utils/validator');
const Employee = require('../models/Employee');
const { DFLT_FINDBY_VAL } = require('../utils/constants');
const Excel = require('exceljs');
const ReportFAP = require('../models/ReportFAP');

const jokiMonitoringWork = async (req, res) => {
    const { branch, id: jokiID } = req.auth;

    const filter = {
        branch: branch.id,
        status: {
            $in: ['DALAM PENGGARAPAN', 'DISETUJUI', 'PENGGARAPAN SELESAI'],
        },
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

const getJokiInfo = async (req, res) => {
    const { id } = req.auth;

    const select = 'email branch name photo.url status role';

    const populate = [
        { path: 'branch', select: 'name' },
        { path: 'role', select: 'name' },
    ];

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

const downloadTemplate = async (req, res) => {
    try {
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Set the width and border of columns A, B, and C
        ['A', 'B', 'C'].forEach((column) => {
            const col = worksheet.getColumn(column);
            col.width = 40;
            col.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        const namaAppCell = worksheet.getCell('A1');
        namaAppCell.value = 'Nama Aplikasi';
        namaAppCell.font = { bold: true, size: 14 };
        namaAppCell.alignment = { horizontal: 'center', vertical: 'middle' };
        namaAppCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' },
        };

        const totalPencairanCell = worksheet.getCell('B1');
        totalPencairanCell.value = 'Total Pencairan';
        totalPencairanCell.font = { bold: true, size: 14 };
        totalPencairanCell.alignment = {
            horizontal: 'center',
            vertical: 'middle',
        };
        totalPencairanCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' },
        };

        const deskripsiCell = worksheet.getCell('C1');
        deskripsiCell.value = 'Deskripsi';
        deskripsiCell.font = { bold: true, size: 14 };
        deskripsiCell.alignment = { horizontal: 'center', vertical: 'middle' };
        deskripsiCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFF00' },
        };

        const filename = 'template_laporan_joki';

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + filename + '.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

const sendReport = async (req, res) => {
    try {
        const { buffer } = req.file;
        const { user } = req.query;
        const { id, branch } = req.auth;

        const findFap = await FAP.findOne({ user })
            .select('reportStatus')
            .lean();

        let error_field = {};

        if (findFap.reportStatus.secondReport !== '1') {
            setErrorField(
                error_field,
                'secondReport',
                'Laporan kedua belum selesai.'
            );
        }

        if (validationFailed(error_field)) {
            return responseValidationError(res, error_field);
        }

        const workbook = new Excel.Workbook();
        await workbook.xlsx.load(buffer);

        const worksheet = workbook.getWorksheet('Sheet 1');

        const report = new ReportFAP({
            user,
            fap: findFap._id,
            branch: branch.id,
            joki: id,
            progressApps: [],
            desc: 'Cair',
        });

        for (let i = 2; i <= worksheet.rowCount; i++) {
            report.progressApps.push({
                name: worksheet.getCell('A' + i).value,
                revenue: worksheet.getCell('B' + i).value,
                desc: worksheet.getCell('C' + i).value,
            });
        }

        await FAP.findByIdAndUpdate(findFap._id, {
            $set: { status: 'PENGGARAPAN SELESAI' },
        });
        await report.save();

        return responseData(res, 201, null, 'Berhasil upload data');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

module.exports = {
    jokiMonitoringWork,
    jokiApproval,
    sendReport,
    getJokiInfo,
    getDetailFap,
    downloadTemplate,
};
