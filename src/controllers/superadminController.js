const Employee = require('../models/Employee');
const LeaveReq = require('../models/EmployeeLeaveRequest');
const { DFLT_FINDBY_VAL } = require('../utils/constants');
const crudService = require('../utils/crudService');
const { responseOnly } = require('../utils/httpResponse');
const { validateRequest } = require('../utils/validator');

const monitoringLeaveReq = async (req, res) => {
    const populate = 'employee';
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
        { page: 'role', select: 'name' },
        { page: 'branch', select: 'branch' },
    ];

    return await crudService.show(
        res,
        Employee.modelName,
        DFLT_FINDBY_VAL,
        id,
        populate
    );
};

module.exports = {
    monitoringLeaveReq,
    leaveReqAppr,
    getProfile,
};
