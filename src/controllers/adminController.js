const Employee = require('../models/Employee');
const User = require('../models/User');
const compareObjectId = require('../utils/compareObjectId');
const crudService = require('../utils/crudService');
const { responseOnly } = require('../utils/httpResponse');

const monitoringPendingRegistration = async (req, res) => {
    const { branchID } = req.auth;

    const filter = {
        branch: branchID,
        status: 'MENUNGGU VALIDASI',
    };

    const populate = ['branch'];

    return await crudService.get(req, res, User.modelName, populate, filter);
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

const monitoringUserReport = async (req, res) => {};

module.exports = {
    monitoringPendingRegistration,
    adminApproval,
};
