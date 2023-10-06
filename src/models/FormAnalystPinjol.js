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
                'PENGGARAPAN SELESAI',
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
        reportStatus: {
            firstReport: {
                type: String,
                default: '0',
            },
            secondReport: {
                type: String,
                default: '0',
            },
        },
        barcodeInfo: {
            isGenerated: { type: Boolean, default: false },
            public_id: String,
            url: String,
        },
    },
    { timestamps: true }
);

module.exports = model('FormAnalystPinjol', schema);
