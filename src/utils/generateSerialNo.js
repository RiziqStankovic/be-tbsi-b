const User = require('../models/User');

const generateSerialNo = async () => {
    try {
        let userCount = await User.countDocuments();

        if (userCount == 0) userCount = 1;

        let isMatch = true;

        let serialNo;

        while (isMatch) {
            serialNo = userCount.toString().padStart(5, '0');
            let findone = await User.findOne({ serialNo }).lean();
            if (!findone) {
                isMatch = false;
                break;
            }

            userCount++;
        }

        return serialNo;
    } catch (error) {
        throw new Error('Error Generate Serial No : ' + error);
    }
};

module.exports = generateSerialNo;
