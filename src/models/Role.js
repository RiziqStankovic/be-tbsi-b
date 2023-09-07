const { Schema, model } = require('mongoose');

const roleSchema = new Schema(
    {
        name: String,
        permission: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Permission',
            },
        ],
    },
    { timestamps: true }
);

module.exports = model('Role', roleSchema);
