const Branch = require('../models/Branch');
const { responseOnly } = require('../utils/httpResponse');

const checkBranch = (branchName) => {
    return async (req, res, next) => {
        const { branchID } = req.auth;

        const getBranch = await Branch.findById(branchID).select('name').lean();

        if (getBranch.name !== branchName) {
            return responseOnly(res, 403, 'Access denied');
        }

        return next();
    };
};

module.exports = checkBranch;
