const mongoose = require('mongoose');

const validateRequest = async (
    errorFields,
    requestKey,
    requestValue,
    rules
) => {
    let ruleArr = rules.split(';');

    for (const rule of ruleArr) {
        if (rule == 'required') {
            if (requestValue == '') {
                errorFields[requestKey] = requestKey + ' is required.';
                return;
            }
        } else if (rule == 'numeric') {
            if (!isNaN(parseFloat(requestValue)) && isFinite(requestValue)) {
                errorFields[requestKey] =
                    toCapitalize(requestKey) +
                    ' should be a numeric value [0-9].';
                return;
            }
        } else if (rule == 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(requestValue)) {
                errorFields[requestKey] =
                    toCapitalize(requestKey) +
                    ' should be a valid email, example@test.com';
                return;
            }
        } else if (rule.includes('oneof')) {
            let oneofNum = rule.split('=')[1];
            let oneofNumArr = oneofNum.split(':');
            if (!oneofNumArr.includes(requestValue)) {
                errorFields[requestKey] =
                    toCapitalize(requestKey) +
                    ' should be one of these values : ' +
                    oneofNumArr.join(', ') +
                    '.';
                return;
            }
        } else if (rule.includes('max')) {
            let maxNum = rule.split('=')[1];
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
            let minNum = rule.split('=')[1];
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
                if (requestValue.length < maxNum) {
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
                        toCapitalize(requestKey) + ' is already exist.';
                    return;
                }
            } catch (error) {
                throw new Error(error);
            }
        } else if (rule.includes('fromnow')) {
            let flag = rule.split(':');
            validateDateFromNow(errorFields, requestKey, requestValue, flag);
        }
    }
};

const validatePasswordConfirmation = (
    errorFields,
    password,
    passwordConfirmation
) => {
    if (password !== passwordConfirmation) {
        errorFields.passwordConfirmation =
            'Password Confirmation does not match';
        return;
    }
};

const validateDateFromNow = (errorFields, requestKey, requestValue, flag) => {
    const pDate = new Date(requestValue);
    const currDate = new Date();

    switch (flag) {
        case 'after':
            /* pDate should be after currDate */
            if (pDate <= currDate) {
                errorFields[requestKey] =
                    toCapitalize(requestKey) +
                    ' should be greater than current date.';
                return;
            }
        case 'before':
            /* pDate should be before currDate */
            if (pDate >= currDate) {
                errorFields[requestKey] =
                    toCapitalize(requestKey) +
                    ' should be lower than current date.';
                return;
            }
        case 'equal':
            /* pDate should be equal to currDate */
            if (pDate !== currDate) {
                errorFields[requestKey] +
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
