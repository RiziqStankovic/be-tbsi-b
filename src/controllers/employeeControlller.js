const Employee = require('../models/Employee');
const User = require('../models/User');
const {
    validateRequest,
    validatePasswordConfirmation,
    validationFailed,
    setErrorField,
} = require('../utils/validator');
const crudService = require('../utils/crudService');
const { hashPassword } = require('../utils/bcrypt');
const {
    responseValidationError,
    responseOnly,
    responseAccessDenied,
} = require('../utils/httpResponse');
const path = require('path');
const { uploadImage } = require('../utils/cloudinary');
const { EMP_FLD_NAME, DFLT_FINDBY_VAL } = require('../utils/constants');
const LeaveReq = require('../models/EmployeeLeaveRequest');
const dateUtil = require('../utils/dateUtil');

const ModelEmployee = Employee.modelName;

const createEmployee = async (req, res) => {
    const { body, file } = req;

    const fileExtension = path.extname(file.originalname);

    /* Validation */
    let error_field = {};

    await validateRequest(error_field, 'name', body.name, 'required');
    await validateRequest(
        error_field,
        'email',
        body.email,
        `required;email;unique:${ModelEmployee}:email`
    );
    await validateRequest(
        error_field,
        'email',
        body.email,
        `required;email;unique:${User.modelName}:email`
    );
    await validateRequest(
        error_field,
        'password',
        body.password,
        'required;min=6;onecapital;onenumber;onesymbol'
    );
    validatePasswordConfirmation(
        error_field,
        body.password,
        body.passwordConfirmation
    );
    await validateRequest(
        error_field,
        'photo',
        fileExtension,
        'required;oneof=.jpg:.png:.jpeg',
        'Ekstensi photo harus salah satu dari : jpg, png, jpeg'
    );
    await validateRequest(error_field, 'role', body.role, 'required;objectid');
    await validateRequest(
        error_field,
        'branch',
        body.branch,
        'required;objectid'
    );

    if (Object.keys(error_field).length > 0) {
        return responseValidationError(res, error_field);
    }

    const photo = await uploadImage(file.buffer, EMP_FLD_NAME);

    const payload = {
        ...body,
        password: hashPassword(body.password),
        photo: {
            url: photo.secure_url,
            public_id: photo.public_id,
        },
    };

    // return responseOnly(res, 200, 'Sip');
    return await crudService.save(res, ModelEmployee, payload);
};

const createLeaveReq = async (req, res) => {
    const { id } = req.auth;
    const { body } = req;

    let error_field = {};

    try {
        const findonepending = await LeaveReq.findOne({
            status: 'MENUNGGU PERSETUJUAN',
            employee: id,
        }).lean();
        if (findonepending) {
            setErrorField(
                error_field,
                'alreadyExist',
                'Anda telah mengajukan cuti pada tanggal ' +
                    dateUtil.toLocal(findonepending.dateFrom) +
                    ' dan belum di setujui oleh Superadmin'
            );
        } else {
            const findonerunning = await LeaveReq.findOne({
                dateTo: { $gt: Date.now() },
                status: 'DISETUJUI',
                employee: id,
            }).lean();
            if (findonerunning) {
                setErrorField(
                    error_field,
                    'alreadyExist',
                    'Anda masih memiliki waktu cuti sampai ' +
                        dateUtil.toLocal(findonerunning.dateTo)
                );
            }
        }
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    await validateRequest(
        error_field,
        'dateFrom',
        body.dateFrom,
        'required;date:after_1',
        null,
        'tanggal mulai'
    );
    await validateRequest(
        error_field,
        'dateTo',
        body.dateTo,
        'required;date',
        null,
        'tanggal akhir'
    );
    await validateRequest(
        error_field,
        'desc',
        body.desc,
        'required',
        null,
        'Deskripsi'
    );

    await validateRequest(
        error_field,
        'employee',
        id,
        `required;objectid:${Employee.modelName}`,
        null,
        'ID Karyawan'
    );

    if (validationFailed(error_field)) {
        return responseValidationError(res, error_field);
    }

    try {
        await Employee.findByIdAndUpdate(id, { $set: { status: 'CUTI' } });
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    const payload = { ...body, employee: id };

    return await crudService.save(res, LeaveReq.modelName, payload);
};

const updateStatEmp = async (req, res) => {
    const { id } = req.auth;

    try {
        const findone = await Employee.findById(id).select('status').lean();
        if (findone.status !== 'CUTI') {
            return responseAccessDenied(res);
        }
    } catch (error) {
        console.log(error);
        return responseOnly(res, 500);
    }

    const payload = { status: 'AKTIF' };
    return await crudService.update(res, Employee.modelName, payload, id);
};

module.exports = {
    createEmployee,
    createLeaveReq,
    updateStatEmp,
};
