const mongoose = require('mongoose');

const mongoInit = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Mongodb ready');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = mongoInit;
