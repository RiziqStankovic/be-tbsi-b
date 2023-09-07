const STAT_SCC = 'SUCCESS';
const STAT_FLD = 'FAILED';

const responseOnly = (res, code, message) => {
    return res.status(code).json({
        status: code >= 200 && code <= 299 ? STAT_SCC : STAT_FLD,
        message: message || code == 500 ? 'Server processing error' : message,
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
    return responseData(res, 400, errorFields, 'Validation Error');
};

const responsePagination = (res, data, paginateInfo) => {
    return res.status(200).json({
        status: STAT_SCC,
        data,
        paginateInfo,
        message: 'Get all data success.',
    });
};

const responseAPINotFound = (res) => {
    return res.status(404).json({
        status: STAT_FLD,
        message: 'API not found.',
    });
};

module.exports = {
    responseOnly,
    responseData,
    responsePagination,
    responseAPINotFound,
    responseValidationError,
};
