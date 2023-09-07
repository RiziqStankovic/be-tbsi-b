const { Schema, model } = require('mongoose');

const schema = new Schema(
    {
        name: String,
    },
    { timestamps: true }
);

module.exports = model('Permission', schema);
