const { responseOnly } = require('../utils/httpResponse');

const checkBranch = (branchName) => {
    return async (req, res, next) => {
        const { branch } = req.auth;

        if (Array.isArray(branchName)) {
            if (branchName.includes(branch.name)) {
                return next();
            }
        }

        if (branch.name !== branchName) {
            return responseOnly(res, 403, 'Access denied');
        }

        return next();
    };
};

module.exports = checkBranch;
