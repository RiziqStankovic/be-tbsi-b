const { Schema, model } = require('mongoose');

const reportSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        fap: {
            type: Schema.Types.ObjectId,
            ref: 'FormAnalystPinjol',
        },
        progressApps: [
            {
                name: String,
                revenue: Number,
                desc: String,
            },
        ],
        gestune: String,
        market: String,
        joki: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
        },
        desc: String,
    },
    { timestamps: true }
);

module.exports = model('ReportFap', reportSchema);
