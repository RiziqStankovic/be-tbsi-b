const { Schema, model } = require('mongoose');

const schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        phoneBrand: String,
        phoneRam: String,
        simCardStatus: {
            type: String,
            enum: ['MASIH ADA', 'SUDAH TIDAK ADA'],
        },
        recommendation: {
            person: String,
            socialMedia: String,
        },
        maintainedApps: [
            {
                name: String,
                totalLimit: Number,
                dueDate: Date,
                remainingInstallment: Number,
            },
        ],
        paymentFailedApps: [String],
        rejectedApps: [String],
        status: {
            type: String,
            enum: [
                'DISETUJUI',
                'DITOLAK',
                'MENUNGGU VALIDASI',
                'DALAM PENGGARAPAN',
                'PENGGARAPAN BERHASIL',
                'PENGGARAPAN GAGAL',
            ],
            default: 'MENUNGGU VALIDASI',
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
            default: null,
        },
        joki: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            default: null,
        },
        validatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = model('FormAnalystPinjol', schema);
