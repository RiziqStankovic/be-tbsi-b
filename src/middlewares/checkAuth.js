const { decodeToken } = require('../utils/jwt');
const { responseOnly } = require('../utils/httpResponse');

const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return responseOnly(res, 401, 'Unauthorized.');
    }

    const [bearer, token] = authHeader.split(' ');

    if (!token || bearer !== 'Bearer' || token == 'null') {
        return responseOnly(res, 401, 'Invalid authorization token.');
    }

    const decoded = decodeToken(token, process.env.JWT_SECRET);

    if (!decoded) {
        console.log('Error when decoding a token.');
        return responseOnly(res, 500);
    }

    req.auth = { ...decoded };

    console.log(req.auth);

    return next();
};

module.exports = checkAuth;
