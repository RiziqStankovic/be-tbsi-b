const STAT_SCC = 'SUCCESS';
const STAT_FLD = 'FAILED';

const responseOnly = (res, code, message) => {
    return res.status(code).json({
        status: code >= 200 && code <= 299 ? STAT_SCC : STAT_FLD,
        message:
            message === null || code == 500
                ? 'Server processing error.'
                : message,
    });
};

const responseData = (res, code, data, message) => {
    let respJson = {};

    if (code == 400) {
        respJson.error_field = data;
    } else {
        respJson.data = data;
    }

    respJson.status = code >= 200 && code <= 299 ? STAT_SCC : STAT_FLD;
    respJson.message = message;

    return res.status(code).json(respJson);
};

const responseValidationError = (res, errorFields) => {
    return responseData(res, 400, errorFields, 'Validation Error.');
};

const responsePagination = (res, data, paginate_info) => {
    return res.status(200).json({
        status: STAT_SCC,
        data,
        paginate_info,
        message: 'Get all data success.',
    });
};

const responseAPINotFound = (res) => {
    return res.status(404).json({
        status: STAT_FLD,
        message: 'API not found.',
    });
};

const responseAuth = (res, token) => {
    return res.status(200).json({
        status: STAT_SCC,
        token,
        message: 'Authentication Success.',
    });
};

const responseAccessDenied = (res, customeMessage) => {
    return responseOnly(res, 403, customeMessage ?? 'Access denied.');
};

module.exports = {
    responseOnly,
    responseData,
    responsePagination,
    responseAPINotFound,
    responseValidationError,
    responseAuth,
    responseAccessDenied,
};
