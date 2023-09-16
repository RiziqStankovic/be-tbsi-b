const { Schema, model } = require('mongoose');

const reportSchema = new Schema(
    {
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        progressApps: [
            {
                name: String,
                status: {
                    type: String,
                    enum: ['BERHASIL CAIR', 'GAGAL CAIR'],
                },
                revenue: Number,
                desc: String,
            },
        ],
    },
    { timestamps: true }
);

module.exports = model('Report', reportSchema);
