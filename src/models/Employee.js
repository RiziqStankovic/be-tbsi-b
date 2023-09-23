const { Schema, model } = require('mongoose');

const schema = new Schema(
    {
        name: String,
        email: String,
        password: String,
        photo: {
            url: String,
            public_id: String,
        },
        role: {
            type: Schema.Types.ObjectId,
            ref: 'Role',
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
        },
        status: {
            type: String,
            enum: ['AKTIF', 'CUTI'],
            default: 'AKTIF',
        },
        loginAt: Date,
    },
    { timestamps: true }
);

module.exports = model('Employee', schema);
