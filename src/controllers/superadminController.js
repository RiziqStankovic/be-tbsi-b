const Employee = require('../models/Employee');
const LeaveReq = require('../models/EmployeeLeaveRequest');
const FAP = require('../models/FormAnalystPinjol');
const { DFLT_FINDBY_VAL } = require('../utils/constants');
const crudService = require('../utils/crudService');
const { responseOnly, responseData } = require('../utils/httpResponse');
const { validateRequest } = require('../utils/validator');
const ReportFAP = require('../models/ReportFAP');
const {
    getOneMonthAgo,
    getTimeRange,
    getDateAndMonthOnly,
} = require('../utils/dateUtil');

const monitoringLeaveReq = async (req, res) => {
    const populate = {
        path: 'employee',
        select: 'name photo.url',
    };
    return await crudService.get(req, res, LeaveReq.modelName, populate);
};

const leaveReqAppr = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    let error_fields = {};

    await validateRequest(
        error_fields,
        'status',
        status,
        'required;oneof=DISETUJUI:DITOLAK',
        null,
        'Status persetujuan'
    );

    const payload = { status };

    if (status === 'DISETUJUI') {
        try {
            await Employee.findByIdAndUpdate(id, { status: 'CUTI' }).lean();
        } catch (error) {
            console.log(error);
            return responseOnly(res, 500);
        }
    }

    return await crudService.update(res, LeaveReq.modelName, payload, id);
};

const getProfile = async (req, res) => {
    const { id } = req.auth;

    const populate = [
        { path: 'role', select: 'name' },
        { path: 'branch', select: 'name' },
    ];

    return await crudService.show(
        res,
        Employee.modelName,
        DFLT_FINDBY_VAL,
        id,
        populate
    );
};

const monitoringNasabah = async (req, res) => {
    const populate = [
        { path: 'user', select: 'name' },
        { path: 'branch', select: 'name' },
        { path: 'joki', select: 'name' },
        { path: 'validatedBy', select: 'name' },
    ];

    const select = 'user branch joki validatedBy';

    return await crudService.get(
        req,
        res,
        FAP.modelName,
        populate,
        null,
        select
    );
};

const getDetailNasabah = async (req, res) => {
    const { id } = req.params;
    const populate = [
        { path: 'user', select: 'name' },
        { path: 'branch', select: 'name' },
        { path: 'joki', select: 'name' },
        { path: 'validatedBy', select: 'name' },
    ];

    return await crudService.show(
        res,
        FAP.modelName,
        DFLT_FINDBY_VAL,
        id,
        populate
    );
};

const getStatistics = async (req, res) => {
    let { from, to, branch } = req.query;

    try {
        const gte = from === undefined ? getOneMonthAgo() : new Date(from);
        const lte = to === undefined ? new Date() : new Date(to);
        let totalFaps = [];
        let totalRevenues = [];

        const timerange = getTimeRange(gte, lte);

        for (const tr of timerange) {
            let dateFilt = { $gte: tr.startDay, $lte: tr.endDay };
            const totalFap = await FAP.countDocuments({
                branch,
                createdAt: dateFilt,
            }).lean();
            totalFaps.push({
                branch,
                label: getDateAndMonthOnly(tr.startDay),
                totalFap,
            });

            const getReports = await ReportFAP.find({
                branch,
                createdAt: dateFilt,
            })
                .select('progressApps')
                .lean();

            const totalRevenue = getReports.reduce((acc, rep) => {
                return (
                    acc +
                    rep.progressApps.reduce((acc, app) => {
                        return acc + app.revenue;
                    }, 0)
                );
            }, 0);

            totalRevenues.push({
                branch,
                label: getDateAndMonthOnly(tr.startDay),
                totalRevenue,
            });
        }

        const respData = {
            totalFaps,
            totalRevenues,
        };

        return responseData(res, 200, respData, 'Get statistic succeses.');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

const getReportTesting = async (req, res) => {
    try {
        const { from, to } = req.query;

        const startdate = new Date(from);
        const enddate = new Date(to);

        const timediff = Math.abs(enddate.getTime() - startdate.getTime());
        const daydiff = Math.ceil(timediff / (1000 * 3600 * 24));
        const timerange = [];

        for (let i = 0; i <= daydiff; i++) {
            const startDay = new Date(
                startdate.getTime() + i * (1000 * 3600 * 24)
            );
            const endDay = new Date(startDay.getTime() + 1000 * 3600 * 24);
            timerange.push({ startDay, endDay });
        }

        return responseData(res, 200, timerange, 'eh haah lahh');
    } catch (error) {
        console.log(error);
        return null;
    }
};

const getFap = async (req, res) => {
    try {
        const { branch, from, to } = req.query;
        const gte = from === undefined ? getOneMonthAgo() : new Date(from);
        const lte = to === undefined ? new Date() : new Date(to);
        const dateFilter = {
            $gte: gte,
            $lte: lte,
        };
        const countFap = await FAP.countDocuments({
            createdAt: dateFilter,
            branch,
        }).lean();

        return responseData(res, 200, countFap, 'Nih');
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

module.exports = {
    monitoringLeaveReq,
    leaveReqAppr,
    getProfile,
    monitoringNasabah,
    getDetailNasabah,
    getStatistics,
    getReportTesting,
    getFap,
};
