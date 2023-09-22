const { Schema, model } = require('mongoose');

const schema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        },
        dateFrom: Date,
        dateTo: Date,
        status: {
            type: String,
            enum: ['DISETUJUI', 'DITOLAK', 'MENUNGGU PERSETUJUAN'],
            default: 'MENUNGGU PERSETUJUAN',
        },
        desc: String,
    },
    { timestamps: true }
);

module.exports = model('EmployeeLeaveRequest', schema);
