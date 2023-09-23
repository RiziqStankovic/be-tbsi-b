const mongoose = require('mongoose');

const validateRequest = async (
    errorFields,
    requestKey,
    requestValue,
    rules,
    customMessage,
    customRequestKey
) => {
    let ruleArr = rules.split(';');

    for (const rule of ruleArr) {
        if (rule == 'required') {
            if (!requestValue || requestValue == '') {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus diisi.';
                return;
            }
        } else if (rule == 'numeric') {
            if (typeof requestValue !== 'number') {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus berupa nilai numerik [0-9].';
                return;
            }
        } else if (rule == 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus berupa email yang valid, contoh: johndoe1234@gmail.com';
                return;
            }
        } else if (rule.includes('oneof')) {
            let oneofNum = rule.split('=')[1];
            let oneofNumArr = oneofNum.split(':');
            if (!oneofNumArr.includes(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus salah satu dari nilai berikut: ' +
                        oneofNumArr.join(', ') +
                        '.';
                return;
            }
        } else if (rule.includes('max')) {
            let maxNum = parseInt(rule.split('=')[1]);
            if (rules.includes('numeric')) {
                if (requestValue > maxNum) {
                    errorFields[requestKey] =
                        'Nilai maksimum dari ' +
                        formatReqestKey(customRequestKey ?? requestKey) +
                        ' adalah ' +
                        maxNum +
                        '.';
                    return;
                }
            } else {
                if (requestValue.length > maxNum) {
                    errorFields[requestKey] =
                        'Panjang maksimum dari ' +
                        formatReqestKey(customRequestKey ?? requestKey) +
                        ' adalah ' +
                        maxNum +
                        '.';
                    return;
                }
            }
        } else if (rule.includes('min')) {
            let minNum = parseInt(rule.split('=')[1]);
            if (rules.includes('numeric')) {
                if (requestValue < minNum) {
                    errorFields[requestKey] =
                        'Nilai minimum dari ' +
                        formatReqestKey(customRequestKey ?? requestKey) +
                        ' adalah ' +
                        minNum +
                        '.';
                    return;
                }
            } else {
                if (requestValue.length < minNum) {
                    errorFields[requestKey] =
                        'Panjang minimum dari ' +
                        formatReqestKey(customRequestKey ?? requestKey) +
                        ' adalah ' +
                        minNum +
                        '.';
                    return;
                }
            }
        } else if (rule.includes('unique')) {
            let modelName = rule.split(':')[1];
            let fieldName = rule.split(':')[2];

            try {
                const Model = mongoose.connection.models[modelName];
                const find = await Model.findOne({
                    [fieldName]: requestValue,
                }).lean();
                if (find) {
                    errorFields[requestKey] =
                        customMessage ??
                        formatReqestKey(customRequestKey ?? requestKey) +
                            ' sudah ada.';
                    return;
                }
            } catch (error) {
                throw new Error(error);
            }
        } else if (rule.includes('date')) {
            let parsedDate = Date.parse(requestValue);
            if (isNaN(parsedDate)) {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus berupa tanggal yang valid.';
                return;
            }

            if (rule.includes(':')) {
                let flag = rule.split(':')[1];
                validateDateFromNow(
                    errorFields,
                    requestKey,
                    requestValue,
                    flag,
                    customMessage,
                    customRequestKey
                );
            }
        } else if (rule.includes('array')) {
            if (!Array.isArray(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus berupa sebuah array.';
                return;
            }
            if (rule.includes(':')) {
                let arrRules = rule.split(':');
                for (let arr of arrRules) {
                    if (arr == 'notempty') {
                        if (requestValue.length == 0) {
                            errorFields[requestKey] =
                                customMessage ??
                                formatReqestKey(
                                    customRequestKey ?? requestKey
                                ) + ' tidak boleh kosong.';
                            return;
                        }
                    }
                }
            }
        } else if (rule == 'onecapital') {
            let regeex = /[A-Z]/;
            if (!regeex.test(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus mengandung setidaknya satu huruf kapital.';
                return;
            }
        } else if (rule == 'onenumber') {
            let regex = /\d/;
            if (!regex.test(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus mengandung setidaknya satu angka.';
                return;
            }
        } else if (rule == 'onesymbol') {
            let regex = /[^a-zA-Z0-9]/;
            if (!regex.test(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus mengandung setidaknya satu karakter simbol.';
                return;
            }
        } else if (rule.includes('objectid')) {
            if (!mongoose.isValidObjectId(requestValue)) {
                errorFields[requestKey] =
                    formatReqestKey(customRequestKey ?? requestKey) +
                    ' bukan merupakan ID objek mongoose yang valid.';
                return;
            }

            if (rule.includes(':')) {
                let modelName = rule.split(':')[1];
                let Model = mongoose.connection.models[modelName];
                let findone = await Model.findOne({ _id: requestValue }).lean();
                if (!findone) {
                    errorFields[requestKey] =
                        formatReqestKey(customRequestKey ?? requestKey) +
                        ' tidak ditemukan pada model ' +
                        formatReqestKey(modelName);
                }
            }
        } else if (rule === 'boolean') {
            if (typeof requestValue !== 'boolean') {
                errorFields[requestKey] =
                    customMessage ??
                    formatReqestKey(customRequestKey ?? requestKey) +
                        ' harus berupa boolean.';
            }
        }
    }
};

const validatePasswordConfirmation = (
    errorFields,
    password,
    passwordConfirmation,
    customMessage
) => {
    if (passwordConfirmation === null || passwordConfirmation === undefined) {
        errorFields.passwordConfirmation =
            customMessage ?? 'Konfirmasi Password harus diisi.';
        return;
    }

    if (password !== passwordConfirmation) {
        errorFields.passwordConfirmation =
            customMessage ?? 'Konfirmasi Password tidak sesuai.';
        return;
    }
};

const validateDateFromNow = (
    errorFields,
    requestKey,
    requestValue,
    flag,
    customMessage,
    customRequestKey
) => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    requestValue = new Date(requestValue);

    if (flag === 'after') {
        if (requestValue.getTime() <= today.getTime()) {
            errorFields[requestKey] =
                customMessage ??
                formatReqestKey(customRequestKey ?? requestKey) +
                    ' harus melewati dari tanggal hari ini.';
            return;
        }
    } else if (flag === 'before') {
        if (requestValue.getTime() >= today.getTime()) {
            errorFields[requestKey] =
                customMessage ??
                formatReqestKey(customRequestKey ?? requestKey) +
                    ' harus sebelum dari tanggal hari ini';
            return;
        }
    } else if (flag.startsWith('after_')) {
        let diffDayVal = parseInt(flag.split('_')[1]);
        /* Count different in millisecond */
        const diffInMs = requestValue.getTime() - today.getTime();
        /* Count different in days */
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays < diffDayVal) {
            errorFields[requestKey] =
                customMessage ??
                formatReqestKey(customRequestKey ?? requestKey) +
                    ' harus setidaknya lebih dari ' +
                    diffDayVal +
                    ' hari dari hari ini.';
            return;
        }
    } else if (flag.startsWith('before_')) {
        let diffDayVal = parseInt(flag.split('_')[1]);
        /* Count different in millisecond */
        const diffInMs = requestValue.getTime() - today.getTime();
        /* Count different in days */
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays > diffDayVal) {
            errorFields[requestKey] =
                customMessage ??
                formatReqestKey(customRequestKey ?? requestKey) +
                    ' harus setidaknya kurang dari ' +
                    diffDayVal +
                    ' hari dari hari ini.';
            return;
        }
    }
};

const setErrorField = (errorFields, requestKey, message) => {
    errorFields[requestKey] = message;
};

const formatReqestKey = (str) => {
    return 'Field ' + str.charAt(0).toUpperCase() + str.slice(1);
};

const validationFailed = (errorFields) => {
    return Object.keys(errorFields).length > 0;
};

module.exports = {
    validateRequest,
    validatePasswordConfirmation,
    validationFailed,
    setErrorField,
};
