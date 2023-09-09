const mongoose = require('mongoose');

const validateRequest = async (
    errorFields,
    requestKey,
    requestValue,
    rules,
    customMessage
) => {
    let ruleArr = rules.split(';');

    for (const rule of ruleArr) {
        if (rule == 'required') {
            if (!requestValue || requestValue == '') {
                errorFields[requestKey] =
                    customMessage ?? toCapitalize(requestKey) + ' is required.';
                return;
            }
        } else if (rule == 'numeric') {
            if (!isNaN(parseFloat(requestValue)) && isFinite(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should be a numeric value [0-9].';
                return;
            }
        } else if (rule == 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should be a valid email, example@test.com';
                return;
            }
        } else if (rule.includes('oneof')) {
            let oneofNum = rule.split('=')[1];
            let oneofNumArr = oneofNum.split(':');
            if (!oneofNumArr.includes(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should be one of these values : ' +
                        oneofNumArr.join(', ') +
                        '.';
                return;
            }
        } else if (rule.includes('max')) {
            let maxNum = parseInt(rule.split('=')[1]);
            if (rules.includes('numeric')) {
                if (requestValue > maxNum) {
                    errorFields[requestValue] =
                        'Maximum value of ' +
                        toCapitalize(requestKey) +
                        ' is ' +
                        maxNum +
                        '.';
                    return;
                }
            } else {
                if (requestValue.length > maxNum) {
                    errorFields[requestValue] =
                        'Maximum length of ' +
                        toCapitalize(requestKey) +
                        ' is ' +
                        maxNum +
                        '.';
                    return;
                }
            }
        } else if (rule.includes('min')) {
            let minNum = parseInt(rule.split('=')[1]);
            if (rules.includes('numeric')) {
                if (requestValue < minNum) {
                    errorFields[requestValue] =
                        'Mininum value of ' +
                        toCapitalize(requestKey) +
                        ' is ' +
                        minNum +
                        '.';
                    return;
                }
            } else {
                if (requestValue.length < minNum) {
                    errorFields[requestValue] =
                        'Minimum length of ' +
                        toCapitalize(requestKey) +
                        ' is ' +
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
                        toCapitalize(requestKey) + ' is already exist.';
                    return;
                }
            } catch (error) {
                throw new Error(error);
            }
        } else if (rule.includes('fromnow')) {
            let flag = rule.split(':');
            validateDateFromNow(
                errorFields,
                requestKey,
                requestValue,
                flag,
                customMessage
            );
        } else if (rule.includes('array')) {
            if (!Array.isArray(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) + ' should be an array.';
                return;
            }
            if (rule.includes(':')) {
                let arrRules = rule.split(':');
                for (let arr of arrRules) {
                    if (arr == 'notempty') {
                        if (requestValue.length == 0) {
                            errorFields[requestKey] =
                                customMessage ??
                                toCapitalize(requestKey) + ' can not empty.';
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
                    toCapitalize(requestKey) +
                        ' should contain at least one capital letter.';
                return;
            }
        } else if (rule == 'onenumber') {
            let regex = /\d/;
            if (!regex.test(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should contain at least one number.';
                return;
            }
        } else if (rule == 'onesymbol') {
            let regex = /[^a-zA-Z0-9]/;
            if (!regex.test(requestValue)) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should contain at least one symbol character.';
                return;
            }
        } else if (rule.includes('objectid')) {
            if (!mongoose.isValidObjectId(requestValue)) {
                errorFields[requestKey] =
                    toCapitalize(requestKey) +
                    ' is not valid mongoose object id.';
                return;
            }

            if (rule.includes(':')) {
                let modelName = rule.split(':')[1];
                let Model = mongoose.connection.models[modelName];
                let findone = await Model.findOne({ _id: requestValue }).lean();
                if (!findone) {
                    errorFields[requestKey] =
                        toCapitalize(requestKey) +
                        ' is not exist in model ' +
                        toCapitalize(modelName);
                }
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
            customMessage ?? 'Password Confirmation is required';
        return;
    }

    if (password !== passwordConfirmation) {
        errorFields.passwordConfirmation =
            customMessage ?? 'Password Confirmation does not match';
        return;
    }
};

const validateDateFromNow = (
    errorFields,
    requestKey,
    requestValue,
    flag,
    customMessage
) => {
    const pDate = new Date(requestValue);
    const currDate = new Date();

    switch (flag) {
        case 'after':
            /* pDate should be after currDate */
            if (pDate <= currDate) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should be greater than current date.';
                return;
            }
        case 'before':
            /* pDate should be before currDate */
            if (pDate >= currDate) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should be lower than current date.';
                return;
            }
        case 'equal':
            /* pDate should be equal to currDate */
            if (pDate !== currDate) {
                errorFields[requestKey] =
                    customMessage ??
                    toCapitalize(requestKey) +
                        ' should be equal with current date.';
                return;
            }
        default:
            break;
    }
};

const toCapitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = {
    validateRequest,
    validatePasswordConfirmation,
};
