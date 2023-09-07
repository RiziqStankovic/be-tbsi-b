const { Schema, model } = require('mongoose');

const schema = new Schema(
    {
        name: String,
        username: String,
        email: String,
        password: String,
        photo: String,
        role: {
            type: Schema.Types.ObjectId,
            ref: 'Role',
        },
    },
    { timestamps: true }
);

module.exports = model('Employee', schema);
