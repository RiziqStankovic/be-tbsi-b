const { Schema, model } = require('mongoose');

const schema = new Schema(
    {
        name: String,
        address: String,
    },
    { timestamps: true }
);

module.exports = model('Branch', schema);
