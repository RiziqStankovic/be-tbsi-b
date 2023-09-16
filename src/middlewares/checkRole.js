const Role = require('../models/Role');
const { responseOnly } = require('../utils/httpResponse');

const checkRole = (roleName) => {
    return async (req, res, next) => {
        const { role } = req.auth;

        if (role.name === 'Superadmin') {
            return next();
        }

        if (role.name !== roleName) {
            return responseOnly(res, 403, 'Access denied.');
        }

        return next();
    };
};

module.exports = checkRole;
