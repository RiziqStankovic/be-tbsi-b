const Employee = require('../models/Employee');
const User = require('../models/User');
const { comparePassword } = require('../utils/bcrypt');
const {
    responseAuth,
    responseOnly,
    responseValidationError,
} = require('../utils/httpResponse');
const { generateToken } = require('../utils/jwt');
const {
    validateRequest,
    validationFailed,
    setErrorField,
} = require('../utils/validator');

const authenticateCredentials = async (req, res) => {
    const { email, password } = req.body;

    let error_fields = {};
    let token = null;

    await validateRequest(error_fields, 'email', email, `required`);
    await validateRequest(error_fields, 'password', password, 'required');

    try {
        const findEmailEmp = await Employee.findOne({ email }).lean();

        if (!findEmailEmp) {
            const findEmailUsr = await User.findOne({ email }).lean();

            if (!findEmailUsr) {
                setErrorField(error_fields, 'email', 'Email salah.');
            } else {
                if (!comparePassword(password, findEmailUsr.password)) {
                    setErrorField(error_fields, 'password', 'Password salah.');
                } else {
                    const payloadUsr = {
                        id: findEmailUsr._id,
                        role: { name: 'User' },
                    };
                    token = generateToken(payloadUsr);
                    return responseAuth(res, token);
                }
            }
        } else {
            if (!comparePassword(password, findEmailEmp.password)) {
                setErrorField(error_fields, 'password', 'Password salah.');
            } else {
                const payloadEmp = {
                    id: findEmailEmp._id,
                    branch: {
                        id: findEmailEmp.branch._id,
                        name: findEmailEmp.branch.name,
                    },
                    role: {
                        id: findEmailEmp.role._id,
                        name: findEmailEmp.role.name,
                    },
                };
                // findEmailEmp.loginAt = new Date();
                // await Employee.updateOne(findEmailEmp);
                token = generateToken(payloadEmp);
                return responseAuth(res, token);
            }
        }

        if (validationFailed(error_fields)) {
            return responseValidationError(res, error_fields);
        }
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }
};

module.exports = {
    authenticateCredentials,
};
