require('dotenv').config();
const { responseOnly } = require('../utils/httpResponse');

const checkEnv = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        return next();
    }

    return responseOnly(res, 503, 'Service Unavailable.');
};

module.exports = checkEnv;
