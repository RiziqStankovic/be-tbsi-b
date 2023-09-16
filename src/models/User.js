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
    },
    { timestamps: true }
);

module.exports = model('User', userSchema);
