const { Schema, model } = require('mongoose');

const roleSchema = new Schema(
    {
        name: String,
    },
    { timestamps: true }
);

module.exports = model('Role', roleSchema);
