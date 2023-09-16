const Role = require('../models/Role');
const { responseOnly } = require('../utils/httpResponse');

const checkRole = (roleName) => {
    return async (req, res, next) => {
        const { roleID } = req.auth;

        const getRole = await Role.findById(roleID).select('name').lean();

        if (getRole.name !== roleName) {
            return responseOnly(res, 403, 'Access denied.');
        }

        return next();
    };
};

module.exports = checkRole;
