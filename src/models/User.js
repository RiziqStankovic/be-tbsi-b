const { Schema, model } = require('mongoose');

const userSchema = new Schema(
    {
        serialNo: String,
        email: String,
        password: String,
        name: String,
        nik: String,
        age: Number,
        pob: String,
        dob: Date,
        location: String,
        phoneNumber: String,
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
            enum: ['APPROVED', 'DECLINE', 'PENDING'],
            default: 'PENDING',
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
        },
    },
    { timestamps: true }
);

module.exports = model('User', userSchema);
