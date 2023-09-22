const Role = require('../models/Role');
const { responseOnly } = require('../utils/httpResponse');

const checkRole = (pRole) => {
    return async (req, res, next) => {
        const { role } = req.auth;

        if (Array.isArray(pRole)) {
            if (pRole.includes(role.name)) {
                return next();
            }
        } else {
            if (role.name === 'Superadmin' || role.name === pRole) {
                return next();
            }
        }

        return responseOnly(res, 403, 'Access denied.');
    };
};

module.exports = checkRole;
